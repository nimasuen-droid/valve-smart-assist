import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Workflow, Save, BookOpen, Settings } from "lucide-react";

const TABS = [
  { url: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { url: "/wizard/project", label: "Selection", icon: Workflow, match: (p: string) => p.startsWith("/wizard") || p === "/report" },
  { url: "/saved", label: "Saved", icon: Save, match: (p: string) => p.startsWith("/saved") },
  { url: "/references", label: "Reference", icon: BookOpen, match: (p: string) => p.startsWith("/references") },
  { url: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = t.match(path);
          const Icon = t.icon;
          return (
            <li key={t.url}>
              <Link
                to={t.url}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
