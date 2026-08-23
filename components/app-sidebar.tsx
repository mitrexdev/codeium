"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitPullRequestArrow,
  Settings,
  Blocks,
  FolderGit2,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/wordmark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Reviews", href: "/dashboard", icon: GitPullRequestArrow },
  { title: "Repositories", href: "/dashboard/repositories", icon: FolderGit2 },
  { title: "Connectors", href: "/dashboard/connectors", icon: Blocks },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header */}
      <SidebarHeader className="h-16 justify-center border-b border-border/50">
        {/* Expanded: full logo + close trigger */}
        <div className="flex items-center justify-between px-3 group-data-[collapsible=icon]:hidden">
          <Wordmark size="lg" />
          <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
            <PanelLeftClose className="size-4" />
          </SidebarTrigger>
        </div>

        {/* Collapsed: icon only, hover to open */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <button
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            className="group/logo relative flex size-8 items-center justify-center"
          >
            <span className="bg-primary flex size-8 items-center justify-center rounded-lg font-mono text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-opacity group-hover/logo:opacity-0">
              ❯
            </span>
            <span className="bg-primary absolute inset-0 flex items-center justify-center rounded-lg opacity-0 shadow-lg shadow-primary/25 transition-opacity group-hover/logo:opacity-100">
              <PanelLeftOpen className="size-4 text-primary-foreground" />
            </span>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-widest px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary rounded-lg"
                    >
                      <item.icon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <div className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <span className="text-xs text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">
            Account
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}