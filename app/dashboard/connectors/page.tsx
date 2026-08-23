import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ConnectorsBoard } from "@/components/connectors-board";
import { Blocks } from "lucide-react";
import { syncCurrentUser } from "@/lib/sync-user";

export default async function ConnectorsPage() {
  const userId = await syncCurrentUser();

  const user = await fetchQuery(api.users.getMyUser, { clerkUserId: userId });
  const connected = !!user?.githubInstallationId;
  const slug = process.env.GITHUB_APP_SLUG;
  const installUrl = slug
    ? `https://github.com/apps/${slug}/installations/new`
    : null;
  const manageUrl = "https://github.com/settings/installations";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Blocks className="size-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Connectors</span>
          </div>
          {connected && (
            <div className="ml-auto flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500">
                1 active
              </span>
            </div>
          )}
        </header>

        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Connectors</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Connect your Git providers. Codeium reviews every push and pull
              request on connected repos.
            </p>
          </div>

          <ConnectorsBoard
            clerkUserId={userId}
            githubConnected={connected}
            installUrl={installUrl}
            manageUrl={manageUrl}
          />

          <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
            more connectors shipping soon
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}