import {
  CODEIUM_SYSTEM_PROMPT,
  CODEIUM_TRIVIAL_PROMPT_SUFFIX,
  CODEIUM_USER_PROMPT_TEMPLATE,
} from "../lib/prompt";

export type UserAiSettings = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

/**
 * Calls an OpenAI-compatible chat completions endpoint using the
 * per-user provider settings stored in Convex. No env fallbacks —
 * users must configure base URL + key + model in Settings → Providers.
 */
export async function analyzeDiff(
  diffText: string,
  settings: UserAiSettings,
  context?: {
    repo?: string;
    type?: "push" | "pull_request";
    truncated?: boolean;
    trivial?: boolean;
  },
): Promise<string> {
  const systemPrompt =
    CODEIUM_SYSTEM_PROMPT +
    (context?.trivial ? CODEIUM_TRIVIAL_PROMPT_SUFFIX : "");

  const url = `${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Codeium",
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: CODEIUM_USER_PROMPT_TEMPLATE({
            repo: context?.repo,
            eventType: context?.type,
            truncated: context?.truncated,
            diffText,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(240_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Provider request failed (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Provider returned an empty completion");
  }
  return content.trim();
}