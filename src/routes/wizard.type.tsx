import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { ReferenceBubble, WhyCard } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";

export const Route = createFileRoute("/wizard/type")({
  head: () => ({ meta: [{ title: "Valve Type Selection — Valve Selection Guide" }] }),
  component: TypeStep,
});

function TypeStep() {
  const { result } = useSelectionResult();
  const r = result.rationale.valveType;
  return (
    <StepShell
      step="/wizard/type"
      title="Valve Type Selection"
      subtitle="Computed live from your service, function, size and class. Rationale shown — review before accepting."
      aside={
        <>
          <WhyCard>{r?.reason || "Selection rationale will appear once inputs are complete."}</WhyCard>
          {r?.refs?.map((ref) => (
            <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
          ))}
        </>
      }
    >
      <Card className="border-success/40 bg-success/5">
        <CardContent className="flex gap-3 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{result.valveType || "—"}</p>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-success">Recommended</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{result.valveSubtype}</p>
            {r?.rule && (
              <p className="mt-2 text-xs text-muted-foreground border-l-2 border-success/40 pl-2">
                <span className="font-semibold text-foreground">Rule: </span>{r.rule}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {result.alternatives?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alternatives considered</p>
          {result.alternatives.map((a, i) => (
            <Card key={i} className="border-warning/30 bg-warning/5">
              <CardContent className="flex gap-3 p-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-medium">{a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StepShell>
  );
}
