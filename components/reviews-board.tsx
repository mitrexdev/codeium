"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Mermaid } from "@/components/mermaid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  GitPullRequestArrow,
  GitCommitHorizontal,
  Inbox,
  ExternalLink,
  CheckCircle2,
  Loader2,
  XCircle,
  Activity,
  Clock,
  FileDiff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Review = {
  _id: string;
  _creationTime: number;
  repo: string;
  type: "push" | "pull_request";
  status: "processing" | "completed" | "failed";
  summary?: string | undefined;
  error?: string | undefined;
  githubUrl?: string | undefined;
};

type Filter = "all" | "completed" | "processing" | "failed";

type Verdict = {
  key: "approved" | "comments" | "changes";
  icon: React.ElementType;
  label: string;
  className: string;
};

const VERDICTS: Record<Verdict["key"], Verdict> = {
  approved: {
    key: "approved",
    icon: CheckCircle2,
    label: "Approved",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  },
  comments: {
    key: "comments",
    icon: FileDiff,
    label: "Approved w/ comments",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  },
  changes: {
    key: "changes",
    icon: XCircle,
    label: "Changes requested",
    className: "border-red-500/25 bg-red-500/10 text-red-500",
  },
};

function extractVerdict(
  analysis: string | undefined
): Verdict | null {
  if (!analysis) return null;
  if (analysis.includes("❌")) return VERDICTS.changes;
  if (analysis.includes("⚠️") || analysis.includes("⚠")) return VERDICTS.comments;
  if (analysis.includes("✅")) return VERDICTS.approved;
  return null;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-red-400",
  warning: "text-amber-400",
  suggestion: "text-sky-400",
};

/**
 * Markdown renderer tuned to Codeium's review format:
 * ### Summary / ### Findings / ### Positive Notes / ### Verdict
 */
function ReviewMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h3: ({ children }) => (
          <h4 className="mb-2 mt-4 first:mt-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="my-2 text-sm leading-relaxed text-muted-foreground first:mt-0 last:mb-0">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-2 space-y-2">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="border-l-2 border-border/60 pl-3 text-sm leading-relaxed text-muted-foreground marker:hidden">
            {children}
          </li>
        ),
        strong: ({ children }) => {
          const raw = String(children);
          const sevMatch = raw.match(/^\[(critical|warning|suggestion)\]/);
          if (sevMatch) {
            const sev = sevMatch[1];
            const rest = raw.slice(sevMatch[0].length);
            return (
              <span>
                <span
                  className={cn(
                    "mr-1.5 inline-block rounded-md border border-border/50 bg-muted/40 px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold uppercase tracking-wider",
                    SEVERITY_STYLES[sev]
                  )}
                >
                  {sev}
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {rest}
                </span>
              </span>
            );
          }
          return <strong className="font-semibold text-foreground">{children}</strong>;
        },
        code: ({ children, className }) => {
          const isBlock = typeof className === "string" && className.includes("language-");
          if (isBlock) {
            return (
              <code className="block whitespace-pre font-mono text-xs leading-relaxed">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-primary">
              {children}
            </code>
          );
        },
        pre: ({ children }) => {
          // Intercept mermaid blocks and render as diagrams
          const child = (
            Array.isArray(children) ? children[0] : children
          ) as React.ReactElement<{
            className?: string;
            children?: React.ReactNode;
          }> | undefined;

          if (child?.props?.className?.includes("language-mermaid")) {
            return <Mermaid chart={String(child.props.children).trim()} />;
          }

          return (
            <pre className="my-2 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-3">
              {children}
            </pre>
          );
        },
        hr: () => <hr className="my-3 border-border/40" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/5 md:p-5">
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight md:text-3xl">
            {value}
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {label}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl md:size-12",
            accentClass
          )}
        >
          <Icon className="size-5 md:size-6" />
        </div>
      </div>
    </div>
  );
}

function FilterTabs({
  current,
  onChange,
  counts,
}: {
  current: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: "Completed" },
    { key: "processing", label: "Processing" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all md:px-4 md:py-2",
            current === tab.key
              ? "border border-border/50 bg-background text-foreground shadow-sm"
              : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {tab.label}
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
              current === tab.key
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground/50"
            )}
          >
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const TypeIcon =
    review.type === "pull_request" ? GitPullRequestArrow : GitCommitHorizontal;

  const verdict = useMemo(
    () =>
      review.status === "completed" ? extractVerdict(review.summary) : null,
    [review.status, review.summary]
  );

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/5">
      {/* Status accent rail */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          review.status === "completed" && "bg-emerald-500/70",
          review.status === "processing" && "bg-amber-500/70",
          review.status === "failed" && "bg-red-500/70"
        )}
      />

      <div className="flex flex-1 flex-col p-4 pl-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                review.type === "pull_request"
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-border/50 bg-muted/60 text-muted-foreground"
              )}
            >
              <TypeIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-mono text-sm font-semibold">
                  {review.repo}
                </span>
                <span className="shrink-0 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {review.type === "pull_request" ? "PR" : "push"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground/50">
                <Clock className="size-3" />
                <span className="font-mono text-xs">
                  {timeAgo(review._creationTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {verdict && (
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
                  verdict.className
                )}
              >
                <verdict.icon className="size-3" />
                {verdict.label}
              </span>
            )}
            <StatusBadge status={review.status} />
          </div>
        </div>

        {/* Body */}
        <div className="mt-3 flex-1">
          {review.status === "processing" && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <Loader2 className="size-4 animate-spin text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Analyzing changes...
              </span>
              <div className="ml-auto flex gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-500/50" />
                <span className="size-1.5 animate-pulse rounded-full bg-amber-500/70 [animation-delay:0.2s]" />
                <span className="size-1.5 animate-pulse rounded-full bg-amber-500/90 [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {review.status === "failed" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Review failed
                </span>
              </div>
              <p className="pl-6 font-mono text-xs leading-relaxed text-destructive/80">
                {review.error}
              </p>
            </div>
          )}

          {review.status === "completed" && review.summary && (
            <Accordion
              multiple
              defaultValue={
                review.summary.length <= 400 ? [`sum-${review._id}`] : []
              }
            >
              <AccordionItem
                value={`sum-${review._id}`}
                className="rounded-xl border border-border/40 bg-muted/20 px-4 py-0"
              >
                <AccordionTrigger className="py-2 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:no-underline [&>svg]:size-4">
                  Review summary
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-4">
                  <ReviewMarkdown>{review.summary}</ReviewMarkdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        {/* Footer — pinned to card bottom */}
        <div className="mt-auto pt-3">
          {review.githubUrl && review.status !== "processing" && (
            <div className="flex items-center justify-end border-t border-border/40 pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary hover:bg-primary/10 hover:text-primary"
                render={
                  <a href={review.githubUrl} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink className="size-3.5" />
                View on GitHub
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewsBoard({ installationId }: { installationId: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const reviews = useQuery(api.reviews.listByInstallation, { installationId });

  if (reviews === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="size-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card p-5 pl-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-20 w-full rounded-xl" />
              <Skeleton className="mt-4 h-8 w-32 self-end rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    total: reviews.length,
    completed: reviews.filter((r) => r.status === "completed").length,
    processing: reviews.filter((r) => r.status === "processing").length,
    failed: reviews.filter((r) => r.status === "failed").length,
  };

  const counts: Record<Filter, number> = {
    all: stats.total,
    completed: stats.completed,
    processing: stats.processing,
    failed: stats.failed,
  };

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  if (reviews.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 bg-card/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#cc785c08,transparent)]"
        />
        <Empty className="relative py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl border border-primary/20">
                <Inbox className="size-7" />
              </span>
            </EmptyMedia>
            <EmptyTitle className="text-xl font-bold">No reviews yet</EmptyTitle>
            <EmptyDescription className="max-w-md text-sm leading-relaxed">
              Push a commit or open a pull request and it will show up here the
              moment Codeium reviews it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total reviews"
          value={stats.total}
          icon={Activity}
          accentClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          accentClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={Loader2}
          accentClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={XCircle}
          accentClass="bg-red-500/10 text-red-600 dark:text-red-400"
        />
      </div>

      {/* Filters + count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs current={filter} onChange={setFilter} counts={counts} />
        <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground/50 sm:flex">
          <FileDiff className="size-3.5" />
          {filtered.length} of {stats.total} shown
        </span>
      </div>

      {/* List — single column, compact */}
      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <ReviewCard key={r._id} review={r} />
        ))}
        {reviews.length >= 50 && (
          <p className="text-muted-foreground/60 pt-4 text-center font-mono text-xs">
            showing latest 50 reviews
          </p>
        )}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
              No {filter} reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
}