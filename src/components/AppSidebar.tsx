import { Link, useRouterState } from "@tanstack/react-router";
import {
  FolderKanban,
  Gauge,
  Workflow,
  ListChecks,
  Layers,
  Plug,
  ShieldAlert,
  FileText,
  BookOpen,
  LayoutDashboard,
  Wrench,
  Save,
} from "lucide-react";
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
} from "@/components/ui/sidebar";

const dashboardItem = { title: "Dashboard", url: "/", icon: LayoutDashboard };

const wizardItems = [
  { title: "Project / Line Data", url: "/wizard/project", icon: FolderKanban },
  { title: "Service Conditions", url: "/wizard/conditions", icon: Gauge },
  { title: "Valve Function", url: "/wizard/function", icon: Workflow },
  { title: "Valve Type Selection", url: "/wizard/type", icon: ListChecks },
  { title: "Body / Trim / Seat", url: "/wizard/materials", icon: Layers },
  { title: "End Connection / Rating", url: "/wizard/ends", icon: Plug },
  { title: "Special Service Checks", url: "/wizard/special", icon: ShieldAlert },
];

const outputItems = [
  { title: "Recommendation Report", url: "/report", icon: FileText },
  { title: "Saved Selections", url: "/saved", icon: Save },
  { title: "Reference Library", url: "/references", icon: BookOpen },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-accent shadow-glow">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">Valve Selection</span>
            <span className="text-xs text-muted-foreground">Engineering Guide</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(dashboardItem.url)}>
                  <Link to={dashboardItem.url}>
                    <dashboardItem.icon className="h-4 w-4" />
                    <span>{dashboardItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Selection Wizard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {wizardItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Output</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {outputItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
          v0.1 · Decision support tool
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
