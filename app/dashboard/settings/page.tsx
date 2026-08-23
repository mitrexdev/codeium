import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SettingsBoard } from "@/components/settings-board";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Settings } from "lucide-react";
import { syncCurrentUser } from "@/lib/sync-user";

export default async function SettingsPage() {
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
            <Settings className="size-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Settings</span>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Settings
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Configure your AI provider and manage your profile.
            </p>
          </div>

          <SettingsBoard
            user={{
              clerkUserId: userId,
              email: user?.email ?? null,
              firstName: user?.firstName ?? null,
              lastName: user?.lastName ?? null,
              imageUrl: user?.imageUrl ?? null,
              aiBaseUrl: user?.aiBaseUrl ?? null,
              aiApiKey: user?.aiApiKey ?? null,
              aiModel: user?.aiModel ?? null,
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}