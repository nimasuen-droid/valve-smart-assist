import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { WhyCard } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/type")({
  head: () => ({ meta: [{ title: "Valve Type Selection — Valve Selection Guide" }] }),
  component: TypeStep,
});

const candidates = [
  { name: "Ball valve — Trunnion mounted", verdict: "best", reason: "Tight shut-off, fire-safe options, low operating torque, suits frequent cycling and ESD duty." },
  { name: "Gate valve — Through-conduit", verdict: "alt", reason: "Acceptable for isolation but heavier, slower to operate. Consider for pigging applications." },
  { name: "Globe valve", verdict: "reject", reason: "Designed for throttling, not bidirectional isolation. High pressure drop." },
  { name: "Butterfly valve — High performance", verdict: "alt", reason: "Cost-effective in larger sizes ≥ NPS 6 and lower pressure classes; verify shut-off class." },
  { name: "Plug valve — Lubricated", verdict: "reject", reason: "Maintenance burden in clean hydrocarbon service; superseded by trunnion ball." },
];

const verdictMap = {
  best: { Icon: CheckCircle2, label: "Recommended", cls: "border-success/40 bg-success/5 text-success" },
  alt: { Icon: AlertCircle, label: "Alternative", cls: "border-warning/40 bg-warning/5 text-warning" },
  reject: { Icon: XCircle, label: "Rejected", cls: "border-destructive/40 bg-destructive/5 text-destructive" },
} as const;

function TypeStep() {
  return (
    <StepShell
      step="/wizard/type"
      title="Valve Type Selection"
      subtitle="Candidates ranked from your inputs. Rationale shown for each — review before accepting."
      aside={
        <WhyCard>
          Ranking weighs duty, leakage class, cycle frequency, fluid cleanliness, and the
          economic envelope of size & class. Trunnion ball wins in clean hydrocarbon isolation
          at moderate-to-high pressure.
        </WhyCard>
      }
    >
      <div className="space-y-3">
        {candidates.map((c) => {
          const v = verdictMap[c.verdict as keyof typeof verdictMap];
          return (
            <Card key={c.name} className={`border ${v.cls}`}>
              <CardContent className="flex gap-3 p-4">
                <v.Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{v.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.reason}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StepShell>
  );
}
