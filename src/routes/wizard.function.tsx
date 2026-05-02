import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard } from "@/components/InfoCards";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/wizard/function")({
  head: () => ({ meta: [{ title: "Valve Function — Valve Selection Guide" }] }),
  component: FunctionStep,
});

const duties = [
  { id: "isolation", label: "Isolation (on/off)", desc: "Block flow with tight shut-off." },
  { id: "throttling", label: "Throttling", desc: "Modulate flow or pressure." },
  { id: "check", label: "Check (non-return)", desc: "Prevent reverse flow." },
  { id: "control", label: "Control", desc: "Automated modulation in a control loop." },
  { id: "esd", label: "Emergency shutdown (ESDV)", desc: "Fail-safe isolation on demand." },
  { id: "blowdown", label: "Blowdown", desc: "Rapid depressurisation to flare." },
  { id: "vent", label: "Drain / Vent", desc: "Small-bore relief of liquid or gas." },
];

function FunctionStep() {
  return (
    <StepShell
      step="/wizard/function"
      title="Valve Function"
      subtitle="What is this valve being asked to do? Duty is the first filter on candidate valve types."
      aside={
        <GuidanceCard title="Pick the dominant duty">
          A single valve can have more than one role, but design for the dominant function.
          Combined isolation + throttling almost always degrades shut-off — split into two valves.
        </GuidanceCard>
      }
    >
      <HelperField label="Primary duty" helper="The main job of this valve in the line.">
        <RadioGroup defaultValue="isolation" className="grid gap-2 md:grid-cols-2">
          {duties.map((d) => (
            <Label
              key={d.id}
              htmlFor={d.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40"
            >
              <RadioGroupItem value={d.id} id={d.id} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </HelperField>

      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Operating frequency" helper="How often is the valve cycled? Drives actuator and seat-life selection.">
          <Select defaultValue="rare">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rare">Rare (&lt; 1 per month)</SelectItem>
              <SelectItem value="occasional">Occasional (weekly)</SelectItem>
              <SelectItem value="frequent">Frequent (daily)</SelectItem>
              <SelectItem value="continuous">Continuous (control loop)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Leakage class required" helper="Per ANSI / FCI 70-2 or API 598 for isolation valves." reference="FCI 70-2">
          <Select defaultValue="ivd">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ii">Class II — 0.5% Cv</SelectItem>
              <SelectItem value="iii">Class III — 0.1% Cv</SelectItem>
              <SelectItem value="iv">Class IV — 0.01% Cv (metal-seated)</SelectItem>
              <SelectItem value="ivd">Class IV-D / V — tight shut-off</SelectItem>
              <SelectItem value="vi">Class VI — bubble-tight (soft-seated)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
