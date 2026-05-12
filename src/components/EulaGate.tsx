import { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EulaContent } from "@/components/EulaContent";
import { getEulaAcceptance, setEulaAccepted } from "@/lib/eula";

interface EulaGateProps {
  children: React.ReactNode;
}

export function EulaGate({ children }: EulaGateProps) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccepted(!!getEulaAcceptance());
  }, []);

  if (accepted === null) return null;
  if (accepted) return <>{children}</>;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledToEnd(true);
    }
  };

  const canAccept = acknowledged && scrolledToEnd;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-3 backdrop-blur-sm md:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-card shadow-xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-warning" />
          <div>
            <div className="text-sm font-semibold">Before you continue</div>
            <div className="text-[11px] text-muted-foreground">
              Please review and accept the End User License Agreement to use this application.
            </div>
          </div>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-3">
          <EulaContent />
        </div>

        <div className="shrink-0 space-y-3 border-t border-border px-4 py-3">
          {!scrolledToEnd && (
            <p className="text-[11px] text-warning">
              Please scroll to the end of the agreement to enable acceptance.
            </p>
          )}
          <label className="flex cursor-pointer items-start gap-2">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(value) => setAcknowledged(value === true)}
              className="mt-0.5"
            />
            <span className="text-xs leading-relaxed text-foreground">
              I understand this app is for engineering screening and decision support only, and I
              agree to the End User License Agreement.
            </span>
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "about:blank")}
            >
              Decline &amp; Exit
            </Button>
            <Button
              size="sm"
              disabled={!canAccept}
              onClick={() => {
                setEulaAccepted();
                setAccepted(true);
              }}
            >
              I Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
