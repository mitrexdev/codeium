import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type ModelsDevModel = {
  id: string;
  name: string;
  reasoning?: boolean;
  tool_call?: boolean;
};

type ModelsDevProvider = {
  id: string;
  name: string;
  api: string;
  models: Record<string, ModelsDevModel>;
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
let cache: { data: Record<string, ModelsDevProvider>; at: number } | null =
  null;

async function loadModelsDev(): Promise<Record<string, ModelsDevProvider>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }
  const res = await fetch("https://models.dev/api.json", {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`models.dev responded ${res.status}`);
  const data = (await res.json()) as Record<string, ModelsDevProvider>;
  cache = { data, at: Date.now() };
  return data;
}

function normalize(url: string): string {
  try {
    const u = new URL(url.trim().replace(/\/+$/, ""));
    return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return url.trim().replace(/\/+$/, "");
  }
}

export async function POST(req: Request) {
  await auth.protect();

  let body: { baseUrl?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const baseUrl = body.baseUrl?.trim().replace(/\/+$/, "");
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
    return NextResponse.json({ error: "invalid_base_url" }, { status: 400 });
  }
  const apiKey = body.apiKey?.trim() || "";
  const normalized = normalize(baseUrl);

  // 1) Match against models.dev provider catalog
  try {
    const providers = await loadModelsDev();
    const matches = Object.values(providers).filter(
      (p) => p.api && normalize(p.api) === normalized,
    );

    if (matches.length > 0) {
      const seen = new Set<string>();
      const models = matches.flatMap((p) =>
        Object.values(p.models ?? {})
          .filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          })
          .map((m) => ({
            id: m.id,
            name: m.name || m.id,
            reasoning: !!m.reasoning,
            toolCall: !!m.tool_call,
          })),
      );
      models.sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({
        source: "models.dev",
        providers: matches.map((p) => ({ id: p.id, name: p.name })),
        count: models.length,
        models,
      });
    }
  } catch {
    // fall through to live fetch
  }

  // 2) Unknown base URL — try OpenAI-compatible /models endpoint
  if (!apiKey) {
    return NextResponse.json(
      { error: "unknown_provider_key_required" },
      { status: 422 },
    );
  }

  try {
    const res = await fetch(`${normalized}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "provider_models_fetch_failed", status: res.status },
        { status: 502 },
      );
    }
    const data = (await res.json()) as {
      data?: { id?: string; name?: string }[];
    };
    const models = (data.data ?? [])
      .filter((m) => m.id)
      .map((m) => ({
        id: m.id!,
        name: m.name || m.id!,
        reasoning: false,
        toolCall: false,
      }));
    models.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      source: "live",
      providers: [],
      count: models.length,
      models,
    });
  } catch {
    return NextResponse.json(
      { error: "provider_models_fetch_failed" },
      { status: 502 },
    );
  }
}