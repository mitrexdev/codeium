"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  User,
  KeyRound,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronsUpDown,
  Check,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type UserDoc = {
  clerkUserId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  aiBaseUrl?: string | null;
  aiApiKey?: string | null;
  aiModel?: string | null;
};

type FetchedModel = {
  id: string;
  name: string;
  reasoning: boolean;
  toolCall: boolean;
};

type FetchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; models: FetchedModel[]; source: string; count: number }
  | { kind: "error"; message: string };

const QUICK_PROVIDERS = [
  { label: "OpenRouter", url: "https://openrouter.ai/api/v1" },
  { label: "OpenAI", url: "https://api.openai.com/v1" },
  { label: "Anthropic", url: "https://api.anthropic.com/v1" },
  { label: "Groq", url: "https://api.groq.com/openai/v1" },
  { label: "Together AI", url: "https://api.together.xyz/v1" },
];

/* ── Appearance (theme) card ─────────────────────────────── */

function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      value: "light" as const,
      label: "Light",
      hint: "Warm cream canvas",
      icon: Sun,
      preview: (
        <span className="block h-14 w-full rounded-lg border border-border bg-[#faf9f5] p-2">
          <span className="block h-2 w-10 rounded-full bg-[#141413]/80" />
          <span className="mt-1.5 block h-2 w-16 rounded-full bg-[#6c6a64]/50" />
          <span className="mt-2 block h-4 w-8 rounded-md bg-[#cc785c]" />
        </span>
      ),
    },
    {
      value: "dark" as const,
      label: "Dark",
      hint: "Dark navy surfaces",
      icon: Moon,
      preview: (
        <span className="block h-14 w-full rounded-lg border border-white/10 bg-[#181715] p-2">
          <span className="block h-2 w-10 rounded-full bg-[#faf9f5]/80" />
          <span className="mt-1.5 block h-2 w-16 rounded-full bg-[#a09d96]/60" />
          <span className="mt-2 block h-4 w-8 rounded-md bg-[#cc785c]" />
        </span>
      ),
    },
    {
      value: "system" as const,
      label: "System",
      hint: "Match your device",
      icon: Monitor,
      preview: (
        <span className="flex h-14 w-full overflow-hidden rounded-lg border border-border">
          <span className="flex-1 bg-[#faf9f5] p-2">
            <span className="block h-2 w-8 rounded-full bg-[#141413]/70" />
            <span className="mt-1.5 block h-3 w-6 rounded-md bg-[#cc785c]" />
          </span>
          <span className="flex-1 bg-[#181715] p-2">
            <span className="block h-2 w-8 rounded-full bg-[#faf9f5]/80" />
            <span className="mt-1.5 block h-3 w-6 rounded-md bg-[#cc785c]" />
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        {theme === "dark" ? (
          <Moon className="size-4 text-primary" />
        ) : theme === "light" ? (
          <Sun className="size-4 text-primary" />
        ) : (
          <Monitor className="size-4 text-primary" />
        )}
        Appearance
      </h3>
      <p className="text-muted-foreground mb-5 text-sm">
        Choose how Codeium looks on this device.
      </p>

      {/* segmented option cards */}
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid gap-3 sm:grid-cols-3"
      >
        {options.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-primary ring-primary/25 ring-2"
                  : "border-border hover:border-foreground/25"
              }`}
            >
              {o.preview}
              <div className="mt-3 flex items-center justify-between px-0.5">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <o.icon className="text-muted-foreground size-3.5" />
                  {o.label}
                </span>
                <span
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    active ? "border-primary" : "border-border"
                  }`}
                >
                  {active && <Check className="text-primary size-3" />}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 px-0.5 text-xs">
                {o.hint}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsBoard({ user }: { user: UserDoc }) {
  const updateProfile = useMutation(api.users.updateProfile);
  const saveAiSettings = useMutation(api.users.saveAiSettings);

  /* ── Profile state ─────────────────────────────────────────── */
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const profileDirty =
    firstName !== (user.firstName ?? "") || lastName !== (user.lastName ?? "");

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      await updateProfile({
        clerkUserId: user.clerkUserId,
        firstName,
        lastName,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Provider state ────────────────────────────────────────── */
  const [baseUrl, setBaseUrl] = useState(user.aiBaseUrl ?? "");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(user.aiModel ?? "");
  const [modelOpen, setModelOpen] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>({ kind: "idle" });
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerSaved, setProviderSaved] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  const hasKey = !!user.aiApiKey;
  const configured = !!(user.aiBaseUrl && user.aiModel);

  const fetchModels = async () => {
    if (!baseUrl.trim()) return;
    setFetchState({ kind: "loading" });
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const messages: Record<string, string> = {
          invalid_base_url: "Enter a valid http(s) base URL.",
          unknown_provider_key_required:
            "Unknown provider — paste your API key so we can list models live.",
          provider_models_fetch_failed:
            "Couldn't reach the provider's /models endpoint. Check URL & key.",
        };
        setFetchState({
          kind: "error",
          message: messages[data.error] ?? "Fetch failed.",
        });
        return;
      }
      setFetchState({
        kind: "done",
        models: data.models,
        source: data.source,
        count: data.count,
      });
    } catch {
      setFetchState({
        kind: "error",
        message: "Network error while fetching models.",
      });
    }
  };

  const handleProviderSave = async () => {
    setSavingProvider(true);
    setProviderSaved(false);
    setProviderError(null);
    try {
      await saveAiSettings({
        clerkUserId: user.clerkUserId,
        aiBaseUrl: baseUrl,
        aiApiKey: apiKey || undefined,
        aiModel: model,
      });
      setProviderSaved(true);
      setApiKey("");
      setTimeout(() => setProviderSaved(false), 3000);
    } catch (e) {
      setProviderError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingProvider(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ══════════ PROFILE CARD ══════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,#cc785c10,transparent)]"
        />
        <div className="relative p-6">
          {/* Identity row */}
          <div className="flex items-center gap-5 pb-6 border-b border-border/40">
            <Avatar className="size-16 border-2 border-primary/25 shadow-lg shadow-primary/10">
              <AvatarImage src={user.imageUrl ?? undefined} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {(firstName?.[0] ?? user.firstName?.[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  "Unnamed user"}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {user.email}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                <CheckCircle2 className="size-3" />
                synced from clerk
              </span>
            </div>
          </div>

          {/* Editable details */}
          <div className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <User className="size-4 text-primary" />
              Personal details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email ?? ""}
                  disabled
                  readOnly
                  className="opacity-60"
                />
                <p className="text-muted-foreground/60 text-xs">
                  Email is managed by your Clerk account and cannot be changed
                  here.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={handleProfileSave}
                disabled={!profileDirty || savingProfile}
                className="gap-2"
              >
                {savingProfile && <Loader2 className="size-4 animate-spin" />}
                Save changes
              </Button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                  <CheckCircle2 className="size-4" />
                  Saved
                </span>
              )}
              {profileError && (
                <span className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangle className="size-4" />
                  {profileError}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ APPEARANCE CARD ══════════ */}
      <AppearanceCard />

      {/* ══════════ PROVIDER CARD ══════════ */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        {/* Status banner */}
        <div
          className={`mb-5 rounded-xl border px-4 py-3 ${
            configured
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-amber-500/25 bg-amber-500/5"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {configured ? (
              <>
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Reviewer active on{" "}
                  <span className="font-mono text-xs">{user.aiModel}</span>
                  {" · "}
                  <span className="font-mono text-xs opacity-70">
                    {user.aiBaseUrl}
                  </span>
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No provider configured yet — reviews will fail until you save
                  a base URL, API key, and model.
                </p>
              </>
            )}
          </div>
        </div>

        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-primary" />
          AI provider
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setFetchState({ kind: "idle" });
              }}
              placeholder="https://openrouter.ai/api/v1"
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                quick fill:
              </span>
              {QUICK_PROVIDERS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setBaseUrl(p.url);
                    setFetchState({ kind: "idle" });
                  }}
                  className="rounded-full border border-border/50 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                API key{" "}
                {hasKey && (
                  <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                    saved ✓
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    hasKey ? "•••••••• (leave empty to keep)" : "sk-..."
                  }
                  className="pr-10 font-mono text-sm"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  aria-label={showKey ? "Hide key" : "Show key"}
                  className="text-muted-foreground/60 absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={fetchModels}
                disabled={!baseUrl.trim() || fetchState.kind === "loading"}
                className="w-full gap-2 sm:w-auto"
              >
                {fetchState.kind === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Fetch models
              </Button>
            </div>
          </div>

          {fetchState.kind === "error" && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              {fetchState.message}
            </p>
          )}

          {fetchState.kind === "done" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="model">Model</Label>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
                  {fetchState.count} models · via {fetchState.source}
                </span>
              </div>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={modelOpen}
                      className="border-border/50 hover:border-primary/40 flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-transparent px-3 py-2 text-left transition-colors"
                    >
                      <span className="truncate font-mono text-sm">
                        {model || (
                          <span className="text-muted-foreground/60">
                            Search &amp; select a model...
                          </span>
                        )}
                      </span>
                      <ChevronsUpDown className="text-muted-foreground/60 size-4 shrink-0" />
                    </button>
                  }
                />
                <PopoverContent
                  align="start"
                  sideOffset={6}
                  className="w-[28rem] max-w-[calc(100vw-2.5rem)] overflow-hidden p-0"
                >
                  <Command shouldFilter>
                    <CommandInput placeholder="Search models..." />
                    <CommandList className="max-h-72">
                      <CommandEmpty>No model matches your search.</CommandEmpty>
                      <CommandGroup>
                        {fetchState.models.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={`${m.name} ${m.id}`}
                            onSelect={() => {
                              setModel(m.id);
                              setModelOpen(false);
                            }}
                            className="font-mono text-xs"
                          >
                            <Check
                              className={`mr-1 size-3.5 shrink-0 ${
                                model === m.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <span className="truncate">{m.name}</span>
                            <span className="text-muted-foreground/40 ml-auto shrink-0 pl-2 text-[10px]">
                              {m.reasoning && (
                                <span className="mr-1 rounded border border-violet-500/30 bg-violet-500/10 px-1 py-px uppercase text-violet-400">
                                  reasoning
                                </span>
                              )}
                              {m.toolCall && (
                                <span className="rounded border border-sky-500/30 bg-sky-500/10 px-1 py-px uppercase text-sky-400">
                                  tools
                                </span>
                              )}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {model && (
                <p className="text-muted-foreground/50 truncate font-mono text-[10px]">
                  id: {model}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-border/40 pt-4">
            <Button
              onClick={handleProviderSave}
              disabled={
                savingProvider ||
                !baseUrl.trim() ||
                !model ||
                (!hasKey && !apiKey.trim())
              }
              className="gap-2"
            >
              {savingProvider && <Loader2 className="size-4 animate-spin" />}
              Save provider
            </Button>
            {providerSaved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                <CheckCircle2 className="size-4" />
                Saved — next review uses this model
              </span>
            )}
            {providerError && (
              <span className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="size-4" />
                {providerError}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}