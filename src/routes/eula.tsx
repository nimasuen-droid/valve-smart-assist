import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EulaContent } from "@/components/EulaContent";
import { clearEulaAcceptance, getEulaAcceptance, type EulaAcceptance } from "@/lib/eula";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "EULA - Valve Selection Guide" },
      { name: "description", content: "End User License Agreement for the Valve Selection Guide." },
    ],
  }),
  component: EulaPage,
});

function EulaPage() {
  const [acceptance, setAcceptance] = useState<EulaAcceptance | null>(null);

  useEffect(() => {
    setAcceptance(getEulaAcceptance());
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          End User License Agreement
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The same agreement shown during first launch remains available here for review.
        </p>
      </div>

      {acceptance && (
        <Card className="border-success/40 bg-success/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">EULA accepted</div>
              <p className="text-xs text-muted-foreground">
                Version {acceptance.version} - Accepted{" "}
                {new Date(acceptance.acceptedAt).toLocaleString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  !confirm(
                    "Revoke EULA acceptance? You will need to accept again before continuing to use the app.",
                  )
                ) {
                  return;
                }
                clearEulaAcceptance();
                setAcceptance(null);
                window.location.reload();
              }}
            >
              Revoke Acceptance
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <EulaContent />
        </CardContent>
      </Card>
    </div>
  );
}
