import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard, ReferenceBubble, WarningBanner } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/conditions")({
  head: () => ({ meta: [{ title: "Service Conditions — Valve Selection Guide" }] }),
  component: ConditionsStep,
});

function ConditionsStep() {
  return (
    <StepShell
      step="/wizard/conditions"
      title="Service Conditions"
      subtitle="Fluid, pressure, temperature and phase drive material class and pressure-temperature rating."
      aside={
        <>
          <WarningBanner title="Use design, not operating">
            Always rate the valve at design pressure and the more severe of design or upset
            temperature, including any future de-rating margin.
          </WarningBanner>
          <ReferenceBubble standard="ASME B16.34" note="Pressure-temperature ratings for valves." />
          <ReferenceBubble standard="ASME B16.5" note="Flange P-T ratings; valve flange ends must match." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Fluid / service" helper="Process fluid as per stream summary or P&ID legend.">
          <Input placeholder="e.g. Wet sour gas, 3% H₂S" />
        </HelperField>
        <HelperField label="Phase" helper="Liquid, gas or two-phase — affects valve type & trim.">
          <Select defaultValue="gas">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="liquid">Liquid</SelectItem>
              <SelectItem value="gas">Gas / Vapour</SelectItem>
              <SelectItem value="two">Two-phase</SelectItem>
              <SelectItem value="slurry">Slurry / particulate</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Design pressure (barg)" helper="Maximum pressure the valve must contain at design temperature." reference="B16.34">
          <Input type="number" placeholder="e.g. 95" />
        </HelperField>
        <HelperField label="Design temperature (°C)" helper="Use the more severe of max upset or min design temperature.">
          <Input type="number" placeholder="e.g. 180" />
        </HelperField>
        <HelperField label="Operating pressure (barg)" helper="Normal operating pressure — used for noise / cavitation checks.">
          <Input type="number" placeholder="e.g. 72" />
        </HelperField>
        <HelperField label="Operating temperature (°C)" helper="Normal operating temperature.">
          <Input type="number" placeholder="e.g. 145" />
        </HelperField>
        <HelperField label="Min design temperature (°C)" helper="Drives low-temp impact testing & charpy requirement.">
          <Input type="number" placeholder="e.g. -29" />
        </HelperField>
        <HelperField label="Specific gravity / density" helper="Liquid SG or gas density at flowing conditions.">
          <Input type="number" placeholder="e.g. 0.85" />
        </HelperField>
      </div>
    </StepShell>
  );
}
