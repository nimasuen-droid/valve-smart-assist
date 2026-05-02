import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard, ReferenceBubble } from "@/components/InfoCards";
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

  const isThrottling =
    input.valveFunction === "Throttling / Control" ||
    input.valveFunction === "Control / Modulating";
  const phase = input.sizingPhase ?? (input.fluidType?.toLowerCase().includes("gas") || input.fluidType === "Steam" ? "gas" : "liquid");

  // Resolve dP from either explicit dP or P1−P2
  const P1 = parseFloat(input.sizingInletP ?? input.operatingPressure ?? input.designPressure ?? "");
  const P2 = parseFloat(input.sizingOutletP ?? "");
  const dPFromOutlet = isFinite(P1) && isFinite(P2) ? P1 - P2 : NaN;
  const dPExplicit = parseFloat(input.sizingDp ?? "");
  const dPUsed = isFinite(dPExplicit) && dPExplicit > 0 ? dPExplicit : dPFromOutlet;

  const sizing = useMemo(() => {
    return runSizing({
      phase,
      inletPressureBarg: P1,
      pressureDropBar: dPUsed,
      temperatureC: parseFloat(input.sizingTemp ?? input.operatingTemp ?? input.designTemp ?? ""),
      flowRate_m3h: phase === "liquid" ? parseFloat(input.sizingFlow ?? "") : undefined,
      flowRate_Nm3h: phase === "gas" ? parseFloat(input.sizingFlow ?? "") : undefined,
      specificGravity: phase === "liquid" ? parseFloat(input.sizingSG ?? "1") : undefined,
      vaporPressureBara: phase === "liquid" ? parseFloat(input.sizingPv ?? "0") : undefined,
      criticalPressureBara: phase === "liquid" ? parseFloat(input.sizingPc ?? "0") : undefined,
      gasSG: phase === "gas" ? parseFloat(input.sizingSG ?? "0.65") : undefined,
      molecularWeight: phase === "gas" ? parseFloat(input.sizingMW ?? "") : undefined,
      compressibilityZ: phase === "gas" ? parseFloat(input.sizingZ ?? "1") : undefined,
      k: phase === "gas" ? parseFloat(input.sizingK ?? "1.3") : undefined,
      selectedValveType: result.valveType,
    });
  }, [input, phase, P1, dPUsed, result.valveType]);

  const verdict = useMemo(() => evaluateAgainstValve(sizing, result.valveType, input.pipeSize), [sizing, result.valveType, input.pipeSize]);

  const verdictColor =
    verdict.verdict === "PASS" ? "border-success/40 bg-success/10 text-success"
    : verdict.verdict === "REVIEW" ? "border-warning/40 bg-warning/10 text-warning"
    : verdict.verdict === "UNDERSIZED" ? "border-destructive/40 bg-destructive/10 text-destructive"
    : "border-border bg-muted text-muted-foreground";

  // Recommended valve type impact
  const impactNotes: string[] = [];
  if (sizing.ok && verdict.openingPct !== undefined) {
    if (verdict.openingPct > 100) impactNotes.push("Required Cv exceeds full-open Cv — increase NPS, change to higher-Cv valve type (e.g., V-port ball or butterfly), or stage pressure drop.");
    else if (verdict.openingPct < 20) impactNotes.push("Operates < 20 % open — consider reduced trim, smaller body, or change to globe with characterised plug for better rangeability.");
    else if (verdict.openingPct > 80) impactNotes.push("Operates > 80 % open — little upset margin. Consider next NPS up.");
  }
  if (sizing.cavitating) impactNotes.push("Cavitating service detected — specify anti-cavitation trim (multi-stage / cage) on the globe valve, or relocate to higher backpressure.");
  if (sizing.flashing) impactNotes.push("Flashing service detected — hardened trim (Stellite) and angle body recommended; standard ball/butterfly will erode.");
  if (sizing.expansionWarning) impactNotes.push("Gas expansion factor Y at floor (0.667) — flow is fully choked. Sonic noise / vibration likely; specify low-noise trim or downstream silencer.");

  return (
    <StepShell
      step="/wizard/sizing"
      title="Control Valve Sizing (IEC 60534)"
      subtitle="Required Cv and verdict against the recommended valve type. Required for Throttling / Control duty."
      aside={
        <>
          <GuidanceCard title="When this step appears">
            Automatically shown for Throttling and Control / Modulating service. Can also be enabled
            manually for any other valve to perform a Cv check.
          </GuidanceCard>
          <ReferenceBubble standard="IEC 60534-2-1" note="Sizing equations for incompressible & compressible flow." />
          <ReferenceBubble standard="ISA 75.01" note="Flow equations for sizing control valves." />
          <ReferenceBubble standard="API 615" note="§6.5 — control valve selection." />
        </>
      }
    >
      {/* Manual enable */}
      {!isThrottling && (
        <div className="mb-5 flex items-center justify-between rounded-md border border-border bg-card/40 p-3">
          <div>
            <p className="text-sm font-medium">Perform Cv sizing</p>
            <p className="text-xs text-muted-foreground">
              Selected valve function is &quot;{input.valveFunction}&quot;. Enable to run a sizing check anyway.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="enableSizing"
              checked={!!input.enableSizing}
              onCheckedChange={(v) => u({ enableSizing: v })}
            />
            <Label htmlFor="enableSizing" className="text-xs">Enabled</Label>
          </div>
        </div>
      )}

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

        <HelperField label="Inlet pressure P₁ (barg)" helper="Upstream pressure at the valve inlet.">
          <Input type="number" value={input.sizingInletP ?? input.operatingPressure ?? ""} onChange={(e) => u({ sizingInletP: e.target.value })} placeholder="e.g. 70" />
        </HelperField>

        <HelperField label="Outlet pressure P₂ (barg)" helper="Optional. If given, ΔP is computed as P₁ − P₂.">
          <Input type="number" value={input.sizingOutletP ?? ""} onChange={(e) => u({ sizingOutletP: e.target.value })} placeholder="e.g. 67" />
        </HelperField>

        <HelperField label="Pressure drop ΔP (bar)" helper="Used directly if non-zero, otherwise derived from P₁ − P₂.">
          <Input type="number" value={input.sizingDp ?? ""} onChange={(e) => u({ sizingDp: e.target.value })} placeholder={isFinite(dPFromOutlet) ? `auto: ${dPFromOutlet.toFixed(2)}` : "e.g. 3"} />
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

        {phase === "gas" && (
          <>
            <HelperField label="Molecular weight (kg/kmol)" helper="Optional alternative to gas SG. Overrides SG if provided. Methane 16, NG ~18.8, air 28.96.">
              <Input type="number" step="0.1" value={input.sizingMW ?? ""} onChange={(e) => u({ sizingMW: e.target.value })} placeholder="e.g. 18.8" />
            </HelperField>
            <HelperField label="Compressibility factor Z" helper="At inlet conditions. 1.0 for ideal gas. Real natural gas at HP: 0.85–0.95.">
              <Input type="number" step="0.01" value={input.sizingZ ?? "1"} onChange={(e) => u({ sizingZ: e.target.value })} />
            </HelperField>
            <HelperField label="Specific heat ratio k (Cp/Cv)" helper="Methane ~1.31, natural gas ~1.27, air 1.4, steam ~1.30.">
              <Input type="number" step="0.01" value={input.sizingK ?? "1.3"} onChange={(e) => u({ sizingK: e.target.value })} />
            </HelperField>
          </>
        )}

        {phase === "liquid" && (
          <>
            <HelperField label="Vapor pressure Pv (bara)" helper="At flowing temperature. Used for choked-flow / cavitation. Leave 0 if subcooled.">
              <Input type="number" step="0.01" value={input.sizingPv ?? "0"} onChange={(e) => u({ sizingPv: e.target.value })} />
            </HelperField>
            <HelperField label="Critical pressure Pc (bara)" helper="Of the fluid. Water 220.6, light hydrocarbons ~45–50. Defaults to 220.6 if blank.">
              <Input type="number" step="0.1" value={input.sizingPc ?? ""} onChange={(e) => u({ sizingPc: e.target.value })} placeholder="e.g. 46" />
            </HelperField>
          </>
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
            {verdict.openingPct !== undefined && (
              <Row
                label="Estimated valve opening"
                value={`${Math.max(verdict.openingPct - 10, 5).toFixed(0)}–${Math.min(verdict.openingPct + 10, 100).toFixed(0)} % (nom. ${verdict.openingPct.toFixed(0)} %)`}
              />
            )}
            <Row label="Choked flow" value={sizing.choked ? `Yes — ΔP ≥ ${sizing.chokedDpBar?.toFixed(2)} bar` : "No"} />
            {sizing.expansionY !== undefined && <Row label="Expansion factor Y" value={sizing.expansionY.toFixed(3)} />}
            <Row label="Assumed xT" value={sizing.assumedXt.toFixed(2)} />
          </div>
        )}

        <p className="mt-4 rounded border border-border bg-background/60 p-3 text-xs text-muted-foreground">
          {verdict.verdictNote}
        </p>

        {/* Warnings */}
        {(sizing.cavitating || sizing.flashing || sizing.expansionWarning || sizing.choked) && (
          <div className="mt-3 space-y-1.5 text-xs">
            {sizing.flashing && <p className="text-destructive">⚠ Flashing detected (P₂ &lt; Pv) — hardened trim required, vapor downstream.</p>}
            {sizing.cavitating && !sizing.flashing && <p className="text-warning">⚠ Cavitating service — specify anti-cavitation trim (multi-stage cage).</p>}
            {sizing.choked && phase === "gas" && <p className="text-warning">⚠ Choked gas flow — sonic noise &amp; vibration risk; consider low-noise trim.</p>}
            {sizing.expansionWarning && <p className="text-warning">⚠ Gas expansion factor Y at floor (0.667) — fully choked flow.</p>}
          </div>
        )}

        {impactNotes.length > 0 && (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Recommended valve type impact</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-foreground/80">
              {impactNotes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
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
