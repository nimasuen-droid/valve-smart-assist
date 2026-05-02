import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WarningBanner, ReferenceBubble } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/special")({
  head: () => ({ meta: [{ title: "Special Service Checks — Valve Selection Guide" }] }),
  component: SpecialStep,
});

const checks = [
  { id: "fs", label: "Fire-safe required", desc: "API 607 / 6FA / ISO 10497 fire test certification." },
  { id: "sour", label: "Sour service (NACE)", desc: "H₂S present — NACE MR0175 / ISO 15156 hardness control." },
  { id: "pig", label: "Pigging / cleaning required", desc: "Full-bore through-conduit valve, no port reductions." },
  { id: "cryo", label: "Cryogenic service", desc: "Service below −46 °C; extended bonnet & low-temp materials." },
  { id: "oxy", label: "Oxygen service", desc: "Cleaning to BS EN 12300; PTFE-free or qualified seats." },
  { id: "h2", label: "Hydrogen service", desc: "API 941 Nelson curves, hardness control, gasket selection." },
  { id: "cl2", label: "Chlorine service", desc: "Dry chlorine compatibility; Monel / Hastelloy trim." },
  { id: "slurry", label: "Slurry / abrasive", desc: "Hardened metal trim, knife-gate or full-bore ball." },
  { id: "corr", label: "Severely corrosive", desc: "Upgrade to duplex / super-duplex / nickel alloy." },
  { id: "ht", label: "High temperature (> 425 °C)", desc: "Stellite trim, graphite packing, pressure-seal bonnet." },
];

function SpecialStep() {
  return (
    <StepShell
      step="/wizard/special"
      title="Special Service Checks"
      subtitle="Tick anything that applies. Each flag adds engineering cautions and may overwrite earlier defaults."
      aside={
        <>
          <WarningBanner title="Sour service is binding">
            If H₂S partial pressure exceeds 0.0003 MPa (0.05 psi), NACE MR0175 / ISO 15156
            applies to all wetted parts. This often forces material upgrades regardless of cost.
          </WarningBanner>
          <ReferenceBubble standard="API 607 / ISO 10497" note="Fire-test for quarter-turn valves." />
          <ReferenceBubble standard="API 941" note="Steels for hydrogen service at elevated temperature & pressure." />
        </>
      }
    >
      <HelperField label="Applicable special service" helper="Check all that apply for this valve.">
        <div className="grid gap-2 md:grid-cols-2">
          {checks.map((c) => (
            <Label
              key={c.id}
              htmlFor={c.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40"
            >
              <Checkbox id={c.id} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </Label>
          ))}
        </div>
      </HelperField>
    </StepShell>
  );
}
