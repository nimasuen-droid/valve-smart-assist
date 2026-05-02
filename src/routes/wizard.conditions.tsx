import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceBubble, WarningBanner } from "@/components/InfoCards";
import { useSelection } from "@/lib/SelectionContext";
// @ts-expect-error JS module
import { SERVICE_TYPES, FLUID_TYPES, INSTALLATION_LOCATIONS } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/conditions")({
  head: () => ({ meta: [{ title: "Service Conditions — Valve Selection Guide" }] }),
  component: ConditionsStep,
});

function ConditionsStep() {
  const { input, update } = useSelection();
  return (
    <StepShell
      step="/wizard/conditions"
      title="Service Conditions"
      subtitle="Service, fluid, pressure and temperature drive material class, ASME B16.5 P-T rating and special checks."
      aside={
        <>
          <WarningBanner title="Use design, not operating">
            Always rate the valve at design pressure and the more severe of design or upset temperature.
            ASME B16.5 ratings are validated automatically when you reach the End Connection step.
          </WarningBanner>
          <ReferenceBubble standard="ASME B16.5" note="Pressure-temperature ratings for flanges and flanged valves." />
          <ReferenceBubble standard="ASME B16.34" note="P-T ratings for flanged, threaded & welded valves." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Service type" helper="Process service category — drives material and special-service rules.">
          <Select value={input.serviceType} onValueChange={(v) => update({ serviceType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {(SERVICE_TYPES as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Fluid type / phase" helper="Liquid, gas, two-phase or slurry — affects valve type and trim.">
          <Select value={input.fluidType} onValueChange={(v) => update({ fluidType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(FLUID_TYPES as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Design pressure (barg)" helper="Maximum pressure the valve must contain at design temperature." reference="B16.5">
          <Input
            type="number"
            value={input.designPressure}
            onChange={(e) => update({ designPressure: e.target.value })}
            placeholder="e.g. 95"
          />
        </HelperField>
        <HelperField label="Design temperature (°C)" helper="Use the more severe of upset or minimum design temperature.">
          <Input
            type="number"
            value={input.designTemp}
            onChange={(e) => update({ designTemp: e.target.value })}
            placeholder="e.g. 180"
          />
        </HelperField>
        <HelperField label="Installation location" helper="Plant environment — affects coatings, materials and actuator selection.">
          <Select value={input.installationLocation} onValueChange={(v) => update({ installationLocation: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {(INSTALLATION_LOCATIONS as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
