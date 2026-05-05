import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Star, Unlock, Lock } from "lucide-react";
import { ReferenceBubble, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { useSelection } from "@/lib/SelectionContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const [typeUnlocked, setTypeUnlocked] = useState<boolean>(isOverridden);
  const [classUnlocked, setClassUnlocked] = useState<boolean>(classMismatch);
  const [boreUnlocked, setBoreUnlocked] = useState<boolean>(!!input.boreOverride);
  const reasons = input.overrideReasons ?? {};
  const typeReason = reasons.valveTypeOverride ?? "";
  const classReason = reasons.pressureClass ?? "";
  const boreReason = reasons.boreOverride ?? "";
  const setReason = (key: string, v: string) =>
    update({ overrideReasons: { ...reasons, [key]: v } });

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
      {/* Recommended valve type — green/star, with reasoning */}
      <Card className={isOverridden ? "border-warning/50 bg-warning/5" : "border-success/40 bg-success/5"}>
        <CardContent className="flex gap-3 p-4">
          {isOverridden ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          ) : (
            <Star className="mt-0.5 h-5 w-5 fill-success text-success" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{engineResult.valveType || "—"}</p>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${
                  isOverridden ? "text-warning" : "text-success"
                }`}
              >
                {isOverridden ? <><AlertTriangle className="h-3 w-3" /> Override active</> : <><Star className="h-3 w-3 fill-success text-success" /> Recommended</>}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{engineResult.valveSubtype}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Based on input conditions and engineering logic.</p>
            {isOverridden && (
              <p className="mt-2 text-xs">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-mono font-medium text-warning">{result.valveType}</span>
                <span className="ml-1 text-[10px] uppercase tracking-wider text-warning/80">(Override)</span>
              </p>
            )}
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
              ASME B16.5 Pressure Class
            </Label>
            {classMismatch ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                <AlertTriangle className="h-3 w-3" /> Override active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <Star className="h-3 w-3 fill-success text-success" /> Recommended
              </span>
            )}
          </div>

          {asmeRec && (
            <div className="rounded-md border border-success/30 bg-success/5 p-2.5">
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 shrink-0 fill-success text-success" />
                <span className="font-mono text-sm font-medium text-success">{asmeRec.recommendedClass}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-success/70">Recommended</span>
              </div>
              <p className="mt-1 pl-5 text-[11px] text-muted-foreground">Based on input conditions and engineering logic — {asmeRec.note}</p>
            </div>
          )}

          {isCritical && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {asmeWarning!.warning}
            </p>
          )}
          {!isCritical && isCaution && (
            <p className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
              {asmeWarning!.warning}
            </p>
          )}

          {!classUnlocked && !classMismatch ? (
            <button
              type="button"
              onClick={() => setClassUnlocked(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              <Unlock className="h-3 w-3" /> Override recommendation
            </button>
          ) : (
            <div className="space-y-2 rounded-md border border-warning/30 bg-warning/5 p-3">
              <p className="text-[11px] text-warning">
                Manual override should be based on project specification, applicable codes, service conditions, or engineering judgment.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Class:</span>
                <Select value={input.pressureClass} onValueChange={(v) => update({ pressureClass: v })}>
                  <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(PRESSURE_CLASSES as string[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {asmeRec && c === asmeRec.recommendedClass ? `★ ${c} (recommended)` : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {classMismatch && asmeRec && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="font-mono font-medium text-warning">{input.pressureClass}</span>
                  <span className="ml-1 text-[10px] uppercase tracking-wider text-warning/80">(Override)</span>
                </p>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Override reason {classMismatch && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  value={classReason}
                  onChange={(e) => setReason("pressureClass", e.target.value)}
                  placeholder="e.g. Client spec, line class, vendor standardisation"
                  className="min-h-[60px] text-xs"
                />
                {classMismatch && !classReason.trim() && (
                  <p className="mt-1 text-[11px] text-destructive">A justification is required for traceability.</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                {asmeRec && classMismatch && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { update({ pressureClass: asmeRec.recommendedClass }); setReason("pressureClass", ""); setClassUnlocked(false); }}>
                    <Lock className="h-3 w-3" /> Use recommended
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        );
      })()}

      {/* Bore override — ball valves only */}
      {isBall && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bore Selection
              </Label>
              {input.boreOverride ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                  <AlertTriangle className="h-3 w-3" /> Override active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                  <Star className="h-3 w-3 fill-success text-success" /> Recommended
                </span>
              )}
            </div>
            <div className="rounded-md border border-success/30 bg-success/5 p-2.5">
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 shrink-0 fill-success text-success" />
                <span className="font-mono text-sm font-medium text-success">Reduced Bore</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-success/70">Recommended</span>
              </div>
              <p className="mt-1 pl-5 text-[11px] text-muted-foreground">
                Based on input conditions and engineering logic — cost-optimised default for ball valves.
              </p>
            </div>

            {!boreUnlocked && !input.boreOverride ? (
              <button
                type="button"
                onClick={() => setBoreUnlocked(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                <Unlock className="h-3 w-3" /> Override recommendation
              </button>
            ) : (
              <div className="space-y-2 rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="text-[11px] text-warning">
                  Switch to Full Bore only when piggable, ESD/HIPPS, subsea, or pressure-drop requirements apply.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["Reduced Bore", "Full Bore"] as const).map((b) => (
                    <Button
                      key={b}
                      size="sm"
                      variant={currentBore === b ? "default" : "outline"}
                      onClick={() => update({ boreOverride: b })}
                    >
                      {b === "Reduced Bore" ? `★ ${b}` : b}
                    </Button>
                  ))}
                </div>
                {input.boreOverride && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Selected: </span>
                    <span className="font-mono font-medium text-warning">{input.boreOverride}</span>
                    <span className="ml-1 text-[10px] uppercase tracking-wider text-warning/80">(Override)</span>
                  </p>
                )}
                <div>
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Override reason {input.boreOverride && <span className="text-destructive">*</span>}
                  </label>
                  <Textarea
                    value={boreReason}
                    onChange={(e) => setReason("boreOverride", e.target.value)}
                    placeholder="e.g. Pigging required, ESD/HIPPS, subsea tie-in, pressure-drop critical"
                    className="min-h-[60px] text-xs"
                  />
                  {input.boreOverride && !boreReason.trim() && (
                    <p className="mt-1 text-[11px] text-destructive">A justification is required for traceability.</p>
                  )}
                </div>
                <div className="flex items-center justify-end pt-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { update({ boreOverride: "" }); setReason("boreOverride", ""); setBoreUnlocked(false); }}>
                    <Lock className="h-3 w-3" /> Use recommended
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {engineResult.alternatives?.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valve type
              </Label>
              {isOverridden ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
                  <AlertTriangle className="h-3 w-3" /> Override active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                  <Star className="h-3 w-3 fill-success text-success" /> Recommended
                </span>
              )}
            </div>

            {!typeUnlocked && !isOverridden ? (
              <button
                type="button"
                onClick={() => setTypeUnlocked(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                <Unlock className="h-3 w-3" /> Override recommendation — see alternatives
              </button>
            ) : (
              <div className="space-y-3 rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="text-[11px] text-warning">
                  Manual override should be based on project specification, applicable codes, service conditions, or engineering judgment.
                </p>
                <div className="space-y-2">
                  {engineResult.alternatives.map((a, i) => {
                    const selected = input.valveTypeOverride === a.type;
                    return (
                      <Card
                        key={i}
                        className={`cursor-pointer transition-colors ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                        onClick={() => selectType(a.type)}
                      >
                        <CardContent className="flex gap-3 p-3">
                          {selected ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
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
                <div>
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Override reason {isOverridden && <span className="text-destructive">*</span>}
                  </label>
                  <Textarea
                    value={typeReason}
                    onChange={(e) => setReason("valveTypeOverride", e.target.value)}
                    placeholder="e.g. Client spec, vendor availability, operability, plant standardisation"
                    className="min-h-[60px] text-xs"
                  />
                  {isOverridden && !typeReason.trim() && (
                    <p className="mt-1 text-[11px] text-destructive">A justification is required for traceability.</p>
                  )}
                </div>
                <div className="flex items-center justify-end pt-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { update({ valveTypeOverride: "" }); setReason("valveTypeOverride", ""); setTypeUnlocked(false); }}>
                    <Lock className="h-3 w-3" /> Use recommended ({engineResult.valveType})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </StepShell>
  );
}
