import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { ReferenceBubble, WhyCard, LearningMoment, WarningBanner } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { useSelection } from "@/lib/SelectionContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRESSURE_CLASSES } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/type")({
  head: () => ({ meta: [{ title: "Valve Type Selection — Valve Selection Guide" }] }),
  component: TypeStep,
});

function TypeStep() {
  const { result, engineResult, asmeWarning, asmeRec } = useSelectionResult();
  const { input, update } = useSelection();
  const r = result.rationale.valveType;
  const isOverridden = !!input.valveTypeOverride && input.valveTypeOverride !== engineResult.valveType;
  const classMismatch = !!asmeRec && asmeRec.recommendedClass !== input.pressureClass;
  const isBall = result.valveType.includes("Ball");
  const currentBore: "Full Bore" | "Reduced Bore" = input.boreOverride
    ? input.boreOverride
    : /Full Bore/i.test(result.valveSubtype)
      ? "Full Bore"
      : "Reduced Bore";

  const selectType = (t: string) => {
    if (t === engineResult.valveType) update({ valveTypeOverride: "" });
    else update({ valveTypeOverride: t });
  };

  return (
    <StepShell
      step="/wizard/type"
      title="Valve Type Selection"
      subtitle="Computed live from your service, function, size and class. You can override the recommendation."
      aside={
        <>
          <WhyCard>{r?.reason || "Selection rationale will appear once inputs are complete."}</WhyCard>
          <LearningMoment>
            Valve type is driven by <strong>function first</strong> (isolation, throttling, check, relief),
            then refined by service, size and class. For ball valves, <strong>Reduced Bore is the cost-driven
            default</strong>; specify Full Bore only when an engineering requirement (piggable, ESD/HIPPS,
            subsea, low-dP) applies.
          </LearningMoment>
          {r?.refs?.map((ref) => (
            <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
          ))}
        </>
      }
    >
      <Card className={isOverridden ? "border-warning/50 bg-warning/5" : "border-success/40 bg-success/5"}>
        <CardContent className="flex gap-3 p-4">
          {isOverridden ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{result.valveType || "—"}</p>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isOverridden ? "text-warning" : "text-success"
                }`}
              >
                {isOverridden ? "User Override" : "Recommended"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{result.valveSubtype}</p>
            {r?.rule && (
              <p className="mt-2 text-xs text-muted-foreground border-l-2 border-muted-foreground/40 pl-2">
                <span className="font-semibold text-foreground">Rule: </span>
                {r.rule}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ASME B16.5 P-T check + pressure class override */}
      {(() => {
        const isCritical = !!asmeWarning && (asmeWarning.type === "pressure" || asmeWarning.type === "material");
        const isCaution = !!asmeWarning && asmeWarning.type === "caution";
        const showRed = isCritical || classMismatch;
        return (
      <Card className={showRed ? "border-destructive/60 bg-destructive/5" : ""}>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ASME B16.5 Pressure-Temperature Check
            </Label>
            {showRed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                Action required
              </span>
            )}
          </div>
          {isCritical && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {asmeWarning!.warning}
            </p>
          )}
          {!isCritical && classMismatch && asmeRec && (
            <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
              Selected class <strong>{input.pressureClass}</strong> differs from recommended{" "}
              <strong>{asmeRec.recommendedClass}</strong> for {input.designPressure} barg @ {input.designTemp}°C.
            </p>
          )}
          {!isCritical && !classMismatch && isCaution && (
            <p className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
              {asmeWarning!.warning}
            </p>
          )}
          {!isCritical && !classMismatch && !isCaution && asmeRec && (
            <p className="text-xs text-muted-foreground">{asmeRec.note}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Override class:</span>
            <Select value={input.pressureClass} onValueChange={(v) => update({ pressureClass: v })}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(PRESSURE_CLASSES as string[]).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {asmeRec && asmeRec.recommendedClass !== input.pressureClass && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ pressureClass: asmeRec.recommendedClass })}
              >
                Use recommended ({asmeRec.recommendedClass})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
        );
      })()}

      {/* Bore override — ball valves only */}
      {isBall && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bore Selection
            </Label>
            <div className="flex flex-wrap gap-2">
              {(["Reduced Bore", "Full Bore"] as const).map((b) => (
                <Button
                  key={b}
                  size="sm"
                  variant={currentBore === b ? "default" : "outline"}
                  onClick={() => update({ boreOverride: b })}
                >
                  {b}
                  {b === "Reduced Bore" && (
                    <span className="ml-1 text-[10px] opacity-70">(default — cost)</span>
                  )}
                </Button>
              ))}
              {input.boreOverride && (
                <Button size="sm" variant="ghost" onClick={() => update({ boreOverride: "" })}>
                  Clear override
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Reduced Bore is the cost-optimised default. Switch to Full Bore only when piggable, ESD/HIPPS,
              subsea, or pressure-drop requirements apply.
            </p>
          </CardContent>
        </Card>
      )}

      {engineResult.alternatives?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Alternatives considered — click to override
          </p>
          {isOverridden && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => update({ valveTypeOverride: "" })}
            >
              Restore recommended ({engineResult.valveType})
            </Button>
          )}
          {engineResult.alternatives.map((a, i) => {
            const selected = input.valveTypeOverride === a.type;
            return (
              <Card
                key={i}
                className={`cursor-pointer transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-warning/30 bg-warning/5 hover:bg-warning/10"
                }`}
                onClick={() => selectType(a.type)}
              >
                <CardContent className="flex gap-3 p-3">
                  {selected ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{a.type}</p>
                      {selected && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.reason}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StepShell>
  );
}
