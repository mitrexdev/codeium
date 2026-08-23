import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RepositoriesBoard } from "@/components/repositories-board";
import { FolderGit2 } from "lucide-react";
import { syncCurrentUser } from "@/lib/sync-user";

export default async function RepositoriesPage() {
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
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">
              Repositories
            </span>
          </div>
          {connected && (
            <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
                Synced
              </span>
            </div>
          )}
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Repositories
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              All repos under your GitHub installation. Every one of them gets
              automatic reviews on push and PR.
            </p>
          </div>

          <RepositoriesBoard />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}