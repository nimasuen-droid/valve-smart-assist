import { useEffect, useMemo, useState } from "react";
import { Download, MonitorDown, WifiOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InstallOutcome = "accepted" | "dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
};

const DISMISSED_KEY = "valve-smart-assist-install-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isDesktopViewport() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches;
}

export function DesktopInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateDisplayState = () => {
      setIsDesktop(isDesktopViewport());
      setIsInstalled(isStandaloneMode());
    };

    updateDisplayState();

    const desktopQuery = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine)",
    );
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    desktopQuery.addEventListener("change", updateDisplayState);
    standaloneQuery.addEventListener("change", updateDisplayState);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setOpen(false);
      localStorage.removeItem(DISMISSED_KEY);
      toast.success("Desktop app installed.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      desktopQuery.removeEventListener("change", updateDisplayState);
      standaloneQuery.removeEventListener("change", updateDisplayState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop || isInstalled || !installPrompt || localStorage.getItem(DISMISSED_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [installPrompt, isDesktop, isInstalled]);

  const status = useMemo(() => {
    if (isInstalled) return "Installed";
    if (!isDesktop) return "Desktop only";
    if (installPrompt) return "Ready to install";
    return "Preparing install prompt";
  }, [installPrompt, isDesktop, isInstalled]);

  const installApp = async () => {
    if (!installPrompt) {
      toast.info("Install prompt is not available yet.", {
        description: "Use Chrome or Edge on desktop, then reload Settings if needed.",
      });
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setOpen(false);

    if (choice.outcome === "accepted") {
      toast.success("Opening installer.");
      return;
    }

    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    toast.info("Desktop install dismissed.");
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setOpen(false);
  };

  return (
    <>
      <div className="rounded-md border border-primary/25 bg-primary/5 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <MonitorDown className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Desktop app access</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Install for offline access, faster repeat launches, and a dedicated app window.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Status: {status}</p>
            </div>
          </div>
          <Button
            className="h-10 shrink-0 justify-center md:min-w-40"
            disabled={!isDesktop || isInstalled || !installPrompt}
            onClick={() => setOpen(true)}
          >
            <Download className="h-4 w-4" />
            Install app
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install desktop app</DialogTitle>
            <DialogDescription>
              Add Valve Selection Guide to this computer for a standalone app window and cached
              offline access to the current tool.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3">
              <WifiOff className="mt-0.5 h-4 w-4 text-primary" />
              <span>Core pages and previously loaded assets are cached for offline work.</span>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3">
              <Zap className="mt-0.5 h-4 w-4 text-primary" />
              <span>Launch from the desktop, Start menu, or taskbar without a browser tab.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={dismiss}>
              Maybe later
            </Button>
            <Button disabled={!installPrompt} onClick={installApp}>
              <Download className="h-4 w-4" />
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
