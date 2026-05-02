import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceBubble, WhyCard } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/materials")({
  head: () => ({ meta: [{ title: "Body / Trim / Seat — Valve Selection Guide" }] }),
  component: MaterialsStep,
});

function MaterialsStep() {
  return (
    <StepShell
      step="/wizard/materials"
      title="Body, Trim & Seat Materials"
      subtitle="Materials follow line class, but verify against fluid corrosivity, temperature limits and sour-service rules."
      aside={
        <>
          <WhyCard>
            ASTM A105 carbon steel body is acceptable down to −29 °C; below that an A350 LF2
            body with impact-tested bolting is required. 13Cr trim is the default for hydrocarbon
            isolation duty.
          </WhyCard>
          <ReferenceBubble standard="ASTM A350 LF2" note="Low-temperature carbon-steel forgings, impact tested at −46 °C." />
          <ReferenceBubble standard="NACE MR0175" note="Sour service hardness limits — applies to body, trim, bolting." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Body material" helper="Bulk pressure-containing forging or casting.">
          <Select defaultValue="a105">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="a105">ASTM A105 — Carbon steel forging</SelectItem>
              <SelectItem value="a350">ASTM A350 LF2 — Low-temp CS</SelectItem>
              <SelectItem value="a182f316">ASTM A182 F316 — Stainless</SelectItem>
              <SelectItem value="a182f51">ASTM A182 F51 — Duplex 22Cr</SelectItem>
              <SelectItem value="a352lcc">ASTM A352 LCC — Cryogenic CS casting</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Trim material" helper="Stem, ball/disc, seat — exposed to flowing fluid.">
          <Select defaultValue="13cr">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="13cr">13Cr (410 SS) — General hydrocarbon</SelectItem>
              <SelectItem value="316">316 SS — Mild corrosion</SelectItem>
              <SelectItem value="duplex">Duplex 2205 — Chloride / sour</SelectItem>
              <SelectItem value="inconel">Inconel 625 overlay — Aggressive</SelectItem>
              <SelectItem value="stellite">Stellite-faced — High wear / steam</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Seat type" helper="Soft seat = bubble-tight & lower torque; metal seat = high temp & abrasive duty.">
          <Select defaultValue="ptfe">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ptfe">PTFE (soft) — up to 200 °C</SelectItem>
              <SelectItem value="rptfe">RPTFE / 25% glass-filled — up to 230 °C</SelectItem>
              <SelectItem value="peek">PEEK — up to 260 °C, abrasion resistant</SelectItem>
              <SelectItem value="metal">Metal-to-metal — high temp / dirty</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Bonnet type" helper="Bolted bonnet is the industry default; pressure-seal at high class & temperature." reference="API 600">
          <Select defaultValue="bolted">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bolted">Bolted bonnet</SelectItem>
              <SelectItem value="welded">Welded bonnet</SelectItem>
              <SelectItem value="pressure">Pressure-seal bonnet (≥ CL900)</SelectItem>
              <SelectItem value="extended">Extended bonnet (cryogenic)</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
