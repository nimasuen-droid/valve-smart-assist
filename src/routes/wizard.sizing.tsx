import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard, ReferenceBubble, WarningBanner } from "@/components/InfoCards";
import { Badge } from "@/components/ui/badge";
import { useSelection } from "@/lib/SelectionContext";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { runSizing, evaluateAgainstValve } from "@/lib/sizing";

export const Route = createFileRoute("/wizard/sizing")({
  head: () => ({ meta: [{ title: "Control Valve Sizing — Valve Selection Guide" }] }),
  component: SizingStep,
});

function SizingStep() {
  const { input, update } = useSelection();
  const { result } = useSelectionResult();
  const u = (patch: Partial<typeof input>) => update(patch);

  const isThrottling = input.valveFunction === "Throttling / Control";
  const phase = input.sizingPhase ?? (input.fluidType?.toLowerCase().includes("gas") || input.fluidType === "Steam" ? "gas" : "liquid");

  const sizing = useMemo(() => {
    return runSizing({
      phase,
      inletPressureBarg: parseFloat(input.sizingInletP ?? input.operatingPressure ?? input.designPressure ?? ""),
      pressureDropBar: parseFloat(input.sizingDp ?? ""),
      temperatureC: parseFloat(input.sizingTemp ?? input.operatingTemp ?? input.designTemp ?? ""),
      flowRate_m3h: phase === "liquid" ? parseFloat(input.sizingFlow ?? "") : undefined,
      flowRate_Nm3h: phase === "gas" ? parseFloat(input.sizingFlow ?? "") : undefined,
      specificGravity: phase === "liquid" ? parseFloat(input.sizingSG ?? "1") : undefined,
      vaporPressureBara: phase === "liquid" ? parseFloat(input.sizingPv ?? "0") : undefined,
      gasSG: phase === "gas" ? parseFloat(input.sizingSG ?? "0.65") : undefined,
      k: phase === "gas" ? parseFloat(input.sizingK ?? "1.3") : undefined,
      selectedValveType: result.valveType,
    });
  }, [input, phase, result.valveType]);

  const verdict = useMemo(() => evaluateAgainstValve(sizing, result.valveType, input.pipeSize), [sizing, result.valveType, input.pipeSize]);

  const verdictColor =
    verdict.verdict === "PASS" ? "border-success/40 bg-success/10 text-success"
    : verdict.verdict === "REVIEW" ? "border-warning/40 bg-warning/10 text-warning"
    : verdict.verdict === "UNDERSIZED" ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-border bg-muted text-muted-foreground";

  return (
    <StepShell
      step="/wizard/sizing"
      title="Control Valve Sizing (IEC 60534)"
      subtitle="Optional Cv calculation that validates the recommended valve type for throttling service. Skip if isolation only."
      aside={
        <>
          {!isThrottling && (
            <WarningBanner title="Not throttling service">
              Sizing is informational for non-throttling valves. The selected function is &quot;{input.valveFunction}&quot;.
              Continue without entering sizing data unless you want a Cv check.
            </WarningBanner>
          )}
          <GuidanceCard title="What gets validated">
            Required Cv is computed and compared against typical full-open Cv for the recommended valve type
            and pipe size. The verdict flags under-/over-sizing and confirms whether a Globe valve is correct
            vs. a rotary alternative.
          </GuidanceCard>
          <ReferenceBubble standard="IEC 60534-2-1" note="Sizing equations for incompressible & compressible flow." />
          <ReferenceBubble standard="ISA 75.01" note="Flow equations for sizing control valves." />
          <ReferenceBubble standard="API 615" note="§6.5 — control valve selection." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Fluid phase" helper="Drives the IEC 60534 equation set used.">
          <Select value={phase} onValueChange={(v) => u({ sizingPhase: v as "liquid" | "gas" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="liquid">Liquid (incompressible)</SelectItem>
              <SelectItem value="gas">Gas / Vapor (compressible)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>

        <HelperField
          label={phase === "liquid" ? "Flow rate (m³/h)" : "Flow rate (Nm³/h)"}
          helper={phase === "liquid" ? "Volumetric flow at flowing conditions." : "Standard volumetric flow @ 0 °C, 1 atm."}
        >
          <Input type="number" value={input.sizingFlow ?? ""} onChange={(e) => u({ sizingFlow: e.target.value })} placeholder={phase === "liquid" ? "e.g. 120" : "e.g. 50000"} />
        </HelperField>

        <HelperField label="Inlet pressure P₁ (barg)" helper="Upstream pressure at the valve inlet. Defaults to operating pressure.">
          <Input type="number" value={input.sizingInletP ?? input.operatingPressure ?? ""} onChange={(e) => u({ sizingInletP: e.target.value })} placeholder="e.g. 70" />
        </HelperField>

        <HelperField label="Pressure drop ΔP (bar)" helper="Allocated pressure drop across the valve at design flow.">
          <Input type="number" value={input.sizingDp ?? ""} onChange={(e) => u({ sizingDp: e.target.value })} placeholder="e.g. 3" />
        </HelperField>

        <HelperField label="Flowing temperature (°C)" helper="Temperature at the valve inlet.">
          <Input type="number" value={input.sizingTemp ?? input.operatingTemp ?? ""} onChange={(e) => u({ sizingTemp: e.target.value })} placeholder="e.g. 45" />
        </HelperField>

        <HelperField
          label={phase === "liquid" ? "Specific gravity (water = 1)" : "Gas specific gravity (air = 1)"}
          helper={phase === "liquid" ? "Water 1.0, crude ~0.85, condensate ~0.7." : "Methane 0.55, natural gas ~0.65, air 1.0."}
        >
          <Input type="number" step="0.01" value={input.sizingSG ?? (phase === "liquid" ? "1" : "0.65")} onChange={(e) => u({ sizingSG: e.target.value })} />
        </HelperField>

        {phase === "liquid" && (
          <HelperField label="Vapor pressure Pv (bara)" helper="At flowing temperature. Used for choked-flow / cavitation check. Leave 0 if subcooled.">
            <Input type="number" step="0.01" value={input.sizingPv ?? "0"} onChange={(e) => u({ sizingPv: e.target.value })} />
          </HelperField>
        )}

        {phase === "gas" && (
          <HelperField label="Specific heat ratio k (Cp/Cv)" helper="Methane ~1.31, natural gas ~1.27, air 1.4, steam ~1.30.">
            <Input type="number" step="0.01" value={input.sizingK ?? "1.3"} onChange={(e) => u({ sizingK: e.target.value })} />
          </HelperField>
        )}
      </div>

      {/* Results */}
      <div className="mt-6 rounded-md border border-border bg-card/40 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Sizing Result</h3>
          <Badge variant="outline" className={verdictColor}>
            {verdict.verdict}
          </Badge>
        </div>

        {!sizing.ok ? (
          <p className="text-sm text-muted-foreground">{sizing.errors.join(" ")}</p>
        ) : (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <Row label="Required Cv" value={sizing.requiredCv.toFixed(2)} />
            <Row label="Required Kv" value={sizing.requiredKv.toFixed(2)} />
            <Row label="Selected valve type" value={`${result.valveType}${result.valveSubtype ? ` (${result.valveSubtype})` : ""}`} />
            <Row label="Pipe size" value={input.pipeSize} />
            {verdict.typicalCv !== undefined && <Row label="Typical full-open Cv" value={String(verdict.typicalCv)} />}
            {verdict.openingPct !== undefined && <Row label="Estimated valve opening" value={`${verdict.openingPct.toFixed(0)} %`} />}
            <Row label="Choked flow" value={sizing.choked ? `Yes — choked at ΔP ≥ ${sizing.chokedDpBar?.toFixed(2)} bar` : "No"} />
            {sizing.expansionY !== undefined && <Row label="Expansion factor Y" value={sizing.expansionY.toFixed(3)} />}
            <Row label="Assumed xT" value={sizing.assumedXt.toFixed(2)} />
          </div>
        )}

        <p className="mt-4 rounded border border-border bg-background/60 p-3 text-xs text-muted-foreground">
          {verdict.verdictNote}
        </p>
        {sizing.choked && (
          <p className="mt-2 text-xs text-warning">
            ⚠ Choked flow detected — risk of cavitation (liquid) or sonic noise (gas). Consider anti-cavitation
            trim, multi-stage pressure reduction, or downstream silencer.
          </p>
        )}
      </div>
    </StepShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}
