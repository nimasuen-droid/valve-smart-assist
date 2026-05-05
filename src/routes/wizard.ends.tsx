import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceBubble, WarningBanner, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelection, type SelectionInput } from "@/lib/SelectionContext";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { PIPE_SIZES, PRESSURE_CLASSES } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/ends")({
  head: () => ({ meta: [{ title: "End Connection / Rating — Valve Selection Guide" }] }),
  component: EndsStep,
});

const END_CONNECTION_OPTIONS = [
  "Flanged (RF)",
  "Flanged (RTJ)",
  "Flanged (FF)",
  "Butt Weld (BW)",
  "Socket Weld (SW)",
  "Threaded (NPT)",
  "Wafer Type",
  "Wafer / Lug Type",
  "Hub / Clamp Connector",
];

const OPERATOR_OPTIONS = [
  "Self-Actuated (No Operator)",
  "Lever Operated",
  "Handwheel",
  "Gear Operated",
  "Pneumatic Actuator",
  "Electric Actuator (MOV)",
  "Hydraulic Actuator",
  "Spring-Return Pneumatic (Fail-Safe)",
];

type OverrideKey = "endConnectionOverride" | "operatorOverride";

function OverrideDropdown({
  label,
  recommended,
  overrideKey,
  options,
}: {
  label: string;
  recommended: string;
  overrideKey: OverrideKey;
  options: string[];
}) {
  const { input, update } = useSelection();
  const current = (input[overrideKey] as string | undefined) ?? "";
  const isOverridden = !!current && current !== recommended;
  const effective = isOverridden ? current : recommended;
  const opts = Array.from(new Set([recommended, ...options].filter(Boolean)));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={`text-xs ${isOverridden ? "text-warning font-medium" : "text-muted-foreground"}`}>
          {isOverridden ? "User Override" : "Recommended"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={effective}
          onValueChange={(v) => {
            if (v === recommended) update({ [overrideKey]: "" } as Partial<SelectionInput>);
            else update({ [overrideKey]: v } as Partial<SelectionInput>);
          }}
        >
          <SelectTrigger className="h-9 flex-1 font-mono text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o} value={o}>
                {o}{o === recommended ? "  (recommended)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isOverridden && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9 px-2 text-xs"
            onClick={() => update({ [overrideKey]: "" } as Partial<SelectionInput>)}
          >
            Reset
          </Button>
        )}
      </div>
      {isOverridden && (
        <p className="text-[11px] text-warning">Manual override — engineering review required.</p>
      )}
    </div>
  );
}

function EndsStep() {
  const { input, update } = useSelection();
  const { result, engineResult, asmeWarning, asmeRec } = useSelectionResult();
  const endRefs = result.rationale.endConnection?.refs || [];
  const classMismatch = !!asmeRec && asmeRec.recommendedClass !== input.pressureClass;

  return (
    <StepShell
      step="/wizard/ends"
      title="End Connection, Size & Pressure Class"
      subtitle="Pipe size and pressure class drive ASME B16.5 P-T validation and end connection style."
      aside={
        <>
          {asmeRec && (
            <WhyCard>
              <strong className="text-foreground">ASME B16.5 recommendation: </strong>
              {asmeRec.note}
              {classMismatch && (
                <span className="mt-1 block text-warning">
                  Selected class {input.pressureClass} differs from recommended {asmeRec.recommendedClass}.
                </span>
              )}
            </WhyCard>
          )}
          <LearningMoment>
            Pressure class isn&apos;t just a number — ASME B16.5 derates allowable pressure as temperature rises.
            A Class 300 flange holding 740 psi at ambient may only hold ~600 psi at 400 °C. Always check the
            P-T table at <em>design temperature</em>, not ambient.
          </LearningMoment>
          {asmeWarning && (
            <WarningBanner title={asmeWarning.type === "caution" ? "ASME B16.5 caution" : "ASME B16.5 rating exceeded"}>
              {asmeWarning.warning}
            </WarningBanner>
          )}
          {result.rationale.endConnection && (
            <WhyCard>
              <strong className="text-foreground">End connection: </strong>
              {result.rationale.endConnection.reason}
            </WhyCard>
          )}
          {result.rationale.operator && (
            <WhyCard>
              <strong className="text-foreground">Operator: </strong>
              {result.rationale.operator.reason}
            </WhyCard>
          )}
          {endRefs.slice(0, 3).map((ref) => (
            <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
          ))}
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Pipe size (NPS)" helper="Nominal pipe size of the line.">
          <Select value={input.pipeSize} onValueChange={(v) => update({ pipeSize: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {(PIPE_SIZES as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Pressure class" helper="ASME B16.5 / B16.34 rating class." reference="B16.5">
          <div className="flex items-center gap-2">
            <Select value={input.pressureClass} onValueChange={(v) => update({ pressureClass: v })}>
              <SelectTrigger className={classMismatch ? "border-warning" : ""}><SelectValue /></SelectTrigger>
              <SelectContent>
                {(PRESSURE_CLASSES as string[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}{asmeRec && c === asmeRec.recommendedClass ? "  (recommended)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {classMismatch && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ pressureClass: asmeRec!.recommendedClass })}
              >
                Use {asmeRec!.recommendedClass}
              </Button>
            )}
          </div>
          {classMismatch && (
            <p className="mt-1 text-[11px] text-warning">
              ASME B16.5 recommends {asmeRec!.recommendedClass} for {input.designPressure} barg @ {input.designTemp}°C.
            </p>
          )}
        </HelperField>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <OverrideDropdown
            label="End Connection"
            recommended={engineResult.endConnection}
            overrideKey="endConnectionOverride"
            options={END_CONNECTION_OPTIONS}
          />
          <OverrideDropdown
            label="Operator"
            recommended={engineResult.operator}
            overrideKey="operatorOverride"
            options={OPERATOR_OPTIONS}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-card/40 p-4 text-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Computed end-connection package</p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between"><dt className="text-muted-foreground">End connection</dt><dd className="font-mono">{result.endConnection || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">End standard</dt><dd className="font-mono">{result.endConnectionStd || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Flange standard</dt><dd className="font-mono">{result.flangeStandard || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Operator</dt><dd className="font-mono">{result.operator || "—"}</dd></div>
        </dl>
      </div>
    </StepShell>
  );
}
