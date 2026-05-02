import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import { SelectionProvider } from "@/lib/SelectionContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Valve Selection Guide — Engineering Decision Support" },
      { name: "description", content: "Practical valve selection support for process piping applications. Body, trim, seat, end-connection and special service guidance." },
      { property: "og:title", content: "Valve Selection Guide" },
      { property: "og:description", content: "Practical valve selection support for process piping applications." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SelectionProvider>
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background grid-bg">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold leading-tight">Valve Selection Guide</h1>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Practical valve selection support for process piping applications
              </p>
            </div>
            <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              Decision-support · verify with PE
            </div>
          </header>
          <div
            role="note"
            aria-label="Decision-support disclaimer"
            className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-[11px] leading-snug text-warning md:px-8"
          >
            <span className="font-semibold uppercase tracking-wider">Decision-support tool only</span>
            <span className="mx-2 opacity-50">·</span>
            <span className="text-warning/90">
              All outputs are screening aids. Verify against project specs, latest standards, and a
              qualified piping engineer before issuing for procurement or fabrication.
            </span>
          </div>
          <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
      <Toaster />
    </SidebarProvider>
    </SelectionProvider>
  );
}
