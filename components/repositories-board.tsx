"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Lock,
  Star,
  Search,
  RefreshCw,
  ExternalLink,
  GitBranch,
  PackageSearch,
  AlertTriangle,
  PlugZap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type Repo = {
  id: number;
  fullName: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  defaultBranch: string;
  updatedAt: string;
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-400",
  JavaScript: "bg-yellow-400",
  Python: "bg-sky-400",
  Go: "bg-cyan-400",
  Rust: "bg-orange-400",
  Java: "bg-red-400",
  Kotlin: "bg-purple-400",
  Ruby: "bg-rose-400",
  PHP: "bg-indigo-400",
  "C++": "bg-pink-400",
  C: "bg-gray-400",
  "C#": "bg-green-400",
  Swift: "bg-orange-300",
  Dart: "bg-teal-400",
  Shell: "bg-lime-400",
  HTML: "bg-orange-500",
  CSS: "bg-violet-400",
  Vue: "bg-emerald-400",
};

function languageColor(lang: string | null): string {
  if (!lang) return "bg-muted-foreground/40";
  return LANGUAGE_COLORS[lang] ?? "bg-primary";
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
            <FolderGit2 className="size-5" />
          </span>
          <div className="min-w-0">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-mono text-sm font-semibold hover:text-primary hover:underline"
            >
              {repo.fullName}
            </a>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                repo.private
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {repo.private ? (
                <>
                  <Lock className="size-2.5" /> private
                </>
              ) : (
                "public"
              )}
            </span>
          </div>
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${repo.fullName} on GitHub`}
          className="text-muted-foreground/40 shrink-0 rounded-lg p-1.5 opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
        >
          <ExternalLink className="size-4" />
        </a>
      </div>

      {repo.description && (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
          {repo.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-4 pt-4">
        {repo.language && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`size-2.5 rounded-full ${languageColor(repo.language)}`}
            />
            {repo.language}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5" />
            {repo.stars}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          <GitBranch className="size-3" />
          updated {timeAgo(repo.updatedAt)}
        </span>
      </div>
    </div>
  );
}

export function RepositoriesBoard() {
  const [data, setData] = useState<{ repositories: Repo[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) {
        setError(res.status === 400 ? "github_not_connected" : "fetch_failed");
        return;
      }
      setData(await res.json());
    } catch {
      setError("fetch_failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const repos = data?.repositories;
  const filtered = useMemo(() => {
    if (!repos) return null;
    if (!query.trim()) return repos;
    const q = query.toLowerCase();
    return repos.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.language?.toLowerCase().includes(q)
    );
  }, [repos, query]);

  /* Loading */
  if (!error && filtered === null) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
              <div className="mt-4 flex gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Not connected */
  if (error === "github_not_connected") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 bg-card/40">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <PlugZap className="size-7" />
              </span>
            </EmptyMedia>
            <EmptyTitle className="text-xl font-bold">
              GitHub not connected
            </EmptyTitle>
            <EmptyDescription className="max-w-md text-sm leading-relaxed">
              Connect GitHub from the Connectors page to see your repositories
              here.
            </EmptyDescription>
            <Button render={<Link href="/dashboard/connectors" />} className="mt-2">
              Go to Connectors
            </Button>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  /* Fetch failed */
  if (error === "fetch_failed") {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-destructive" />
        <p className="font-semibold">Couldn&apos;t load repositories</p>
        <p className="text-muted-foreground mt-1 text-sm">
          GitHub request failed. The installation may have been revoked.
        </p>
        <Button variant="outline" onClick={refresh} className="mt-4 gap-2">
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  const total = filtered!.length;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories..."
            className="h-10 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-muted-foreground/50 sm:block">
            {total} repo{total === 1 ? "" : "s"} · reviews active on all
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Grid */}
      {total === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 bg-card/40">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 text-muted-foreground">
                  <PackageSearch className="size-7" />
                </span>
              </EmptyMedia>
              <EmptyTitle className="text-xl font-bold">
                No matching repositories
              </EmptyTitle>
              <EmptyDescription className="max-w-md text-sm leading-relaxed">
                {query
                  ? `Nothing matches "${query}". Try a different search.`
                  : "Install the GitHub App on more repos to see them here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered!.map((r) => (
            <RepoCard key={r.id} repo={r} />
          ))}
        </div>
      )}
    </div>
  );
}