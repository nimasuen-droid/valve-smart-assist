import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { GuidanceCard, ReferenceBubble } from "@/components/InfoCards";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSelection } from "@/lib/SelectionContext";
import { VALVE_FUNCTIONS } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/function")({
  head: () => ({ meta: [{ title: "Valve Function — Valve Selection Guide" }] }),
  component: FunctionStep,
});

const DESCRIPTIONS: Record<string, string> = {
  "Isolation (On/Off)":
    "Block flow with tight shut-off — primary use case for ball, gate and butterfly.",
  "Throttling / Control": "Modulate flow or pressure — globe, V-port ball or TOV.",
  "Non-Return (Check)": "Prevent reverse flow — swing, dual-plate or piston check.",
  "Pressure Relief / Safety": "PSV / PRV — opens on overpressure per API 520/521.",
  Blowdown: "Rapid emergency depressurisation to flare. Fire-safe ball.",
  Sampling: "Small-bore sampling connection.",
  Drain: "Small-bore drain connection.",
  Vent: "Small-bore vent connection.",
};

function FunctionStep() {
  const { input, update } = useSelection();
  return (
    <StepShell
      step="/wizard/function"
      title="Valve Function"
      subtitle="What the valve must do. Function is the first filter on candidate valve types per API 615."
      aside={
        <>
          <GuidanceCard title="Pick the dominant duty">
            A valve can have more than one role, but design for the dominant function. Combined
            isolation + throttling almost always degrades shut-off — split into two valves.
          </GuidanceCard>
          <ReferenceBubble
            standard="API 615"
            note="§6 — selection by valve function and service."
          />
        </>
      }
    >
      <HelperField label="Primary valve function" helper="The main job of this valve in the line.">
        <RadioGroup
          value={input.valveFunction}
          onValueChange={(v) => update({ valveFunction: v })}
          className="grid gap-2 md:grid-cols-2"
        >
          {(VALVE_FUNCTIONS as string[]).map((d) => (
            <Label
              key={d}
              htmlFor={d}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40"
            >
              <RadioGroupItem value={d} id={d} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{d}</p>
                <p className="text-xs text-muted-foreground">{DESCRIPTIONS[d] || ""}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </HelperField>
    </StepShell>
  );
}
