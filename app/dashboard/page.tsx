import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReviewsBoard } from "@/components/reviews-board";
import { GitPullRequestArrow, Zap, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncCurrentUser } from "@/lib/sync-user";

export default async function DashboardPage() {
  const userId = await syncCurrentUser();
  const user = await fetchQuery(api.users.getMyUser, { clerkUserId: userId });
  const connected = !!user?.githubInstallationId;
  const slug = process.env.GITHUB_APP_SLUG;
  const installUrl = slug
    ? `https://github.com/apps/${slug}/installations/new`
    : null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <GitPullRequestArrow className="size-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Reviews</span>
          </div>
          {connected && (
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground/50">
                <Shield className="size-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-widest">Secure</span>
              </div>
            </div>
          )}
        </header>

        {!connected && (
          <div className="relative flex-1 border-b border-border/50">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#cc785c12,transparent)]"
            />
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="bg-primary/10 text-primary mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                <svg role="img" viewBox="0 0 24 24" className="size-8" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Connect your GitHub account</h1>
              <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
                Install the Codeium GitHub App on the repos you want
                reviewed. Your first review lands on your next push.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  className="gap-2 font-semibold shadow-lg shadow-primary/25"
                  render={<a href="/dashboard/connectors" />}
                >
                  <Zap className="size-4" />
                  Connect a provider
                  <ArrowRight className="size-4" />
                </Button>
                <p className="text-muted-foreground/60 text-xs">
                  Read-only access to selected repos only
                </p>
              </div>
            </div>
          </div>
        )}

        {connected && (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                Review activity
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Every push and pull request, reviewed as it happens.
              </p>
            </div>
            <ReviewsBoard installationId={user!.githubInstallationId!} />
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}