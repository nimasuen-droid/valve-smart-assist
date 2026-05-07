import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { OverrideField } from "@/components/OverrideField";
import { ReferenceBubble, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";

export const Route = createFileRoute("/wizard/materials")({
  head: () => ({ meta: [{ title: "Body / Trim / Seat — Valve Selection Guide" }] }),
  component: MaterialsStep,
});

const OPTIONS = {
  bodyMaterialOverride: [
    "Carbon Steel",
    "Carbon Steel (NACE)",
    "Carbon Steel (PWHT)",
    "Carbon Steel (H2 Service)",
    "Low Temperature Carbon Steel",
    "Stainless Steel 316",
    "Stainless Steel 316 (O2 Cleaned)",
    "Stainless Steel 347",
    "Alloy Steel (Cr-Mo)",
    "Alloy 20 / Duplex SS",
    "Inconel 625",
    "Monel 400",
    "Hastelloy C-276",
  ],
  bodyMaterialSpecOverride: [
    "ASTM A216 WCB",
    "ASTM A216 WCC",
    "ASTM A352 LCB / LCC",
    "ASTM A351 CF8M",
    "ASTM A351 CF8C",
    "ASTM A351 CN7M / A995 CD3MN",
    "ASTM A217 WC6",
    "ASTM A217 WC9",
    "ASTM A352 LCC / A216 WCC (HIC/SSC tested)",
    "ASTM A216 WCB (Nelson Curve verified)",
    "ASTM A216 WCB (PWHT required)",
    "ASTM A494 N7M (Hastelloy)",
    "ASTM B564 N06625 (Inconel 625)",
  ],
  seatMaterialOverride: [
    "PTFE / RPTFE",
    "PTFE (O2 compatible)",
    "PTFE / DEVLON",
    "PTFE Sleeve / Lubricated",
    "PTFE / RTFE Laminated",
    "PEEK",
    "Metal Seat (Stellite 6 overlay)",
    "Metal-to-Metal (Stellite)",
    "Stellite 6 Hardfaced",
    "Stellite 6 / SS 316 Lapped",
    "SS 316",
  ],
  discBallMaterialOverride: [
    "SS 316",
    "SS 316 + ENP",
    "SS 316 (O2 cleaned)",
    "SS 316 + ENP / Stellite overlay",
    "CF8M (SS 316 Cast)",
    "CF8M + Stellite Overlay",
    "Stellite 6 Hardfaced Wedge",
    "Stellite 6 Disc/Plug",
    "Stellite 6 Hardfaced Disc",
    "SS 316 Plug",
    "SS 316 / Stellite",
  ],
  stemMaterialOverride: [
    "SS 316",
    "SS 316 / 17-4 PH",
    "AISI 410 / F6a",
    "AISI 410",
    "Inconel 718",
    "Monel K-500",
    "Duplex SS (UNS S31803)",
    "N/A (Hinge Pin: SS 316)",
  ],
  gasketOverride: [
    "Spiral Wound (SS316 + Graphite)",
    "Spiral Wound with Inner Ring",
    "Ring Type Joint (Soft Iron)",
    "Ring Type Joint (SS 316)",
    "Ring Type Joint (Inconel 625)",
    "Kammprofile (SS316 + Graphite)",
    "PTFE Envelope",
    "Flexible Graphite",
  ],
  packingOverride: [
    "Graphite (Die-Formed Rings)",
    "Flexible Graphite + Carbon End Rings",
    "PTFE V-Rings",
    "PTFE / Graphite Composite",
    "Live-Loaded Graphite (Low Emission)",
    "Low Emission (ISO 15848-1 Class A)",
    "Aramid / PTFE Braided",
  ],
} as const;

function MaterialsStep() {
  const { result, engineResult, b1634Check, materialRatingGroup } = useSelectionResult();
  const refs = [
    ...(result.rationale.bodyMaterial?.refs || []),
    ...(result.rationale.trim?.refs || []),
    materialRatingGroup?.b165Table,
    materialRatingGroup?.b1634Table,
  ];
  const bodyReason = result.rationale.bodyMaterial?.reason;
  const trimReason = result.rationale.trim?.reason;

  return (
    <StepShell
      step="/wizard/materials"
      title="Body, Trim & Seat Materials"
      subtitle="Materials derived from your service type, temperature and pressure class per ASME B16.34 and API 615. Each field is locked to the engineering recommendation — click ‘Override recommendation’ to change it."
      aside={
        <>
          {bodyReason && (
            <>
              <WhyCard>
                <p className="mb-2">
                  <strong className="text-foreground">Body: </strong>
                  {bodyReason}
                </p>
              </WhyCard>
              <LearningMoment>
                Body material is set by <strong>fluid + temperature</strong>: WCB carbon steel
                covers most hydrocarbons from −29 °C to 425 °C; LCC/LCB for low-temp service; CF8M
                (316SS) for corrosives and cryogenic; chrome-moly (WC6/WC9) above 425 °C. Sour
                service adds NACE MR0175/ISO 15156 hardness limits.
              </LearningMoment>
            </>
          )}
          {trimReason && (
            <WhyCard>
              <p>
                <strong className="text-foreground">Trim: </strong>
                {trimReason}
              </p>
            </WhyCard>
          )}
          {materialRatingGroup && (
            <LearningMoment title="Rating basis">
              <strong>{materialRatingGroup.label}</strong> selected from the body material and ASTM
              grade. B16.5 pressure class is screened against {materialRatingGroup.b165Table}; valve
              body material suitability is screened against {materialRatingGroup.b1634Table}.
            </LearningMoment>
          )}
          {b1634Check && (
            <WhyCard>
              <p>
                <strong className="text-foreground">ASME B16.34 body check: </strong>
                {b1634Check.warning}
              </p>
            </WhyCard>
          )}
          {Array.from(new Set(refs))
            .filter(Boolean)
            .slice(0, 4)
            .map((ref) => (
              <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
            ))}
        </>
      }
    >
      <Card>
        <CardContent className="space-y-5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Body
          </p>
          <OverrideField
            label="Body material"
            recommended={engineResult.bodyMaterial}
            overrideKey="bodyMaterialOverride"
            options={[...OPTIONS.bodyMaterialOverride]}
            reasoning={
              bodyReason ||
              "Based on fluid, temperature and pressure class per ASME B16.34 / API 615."
            }
            warning="Selected material may not meet design temperature, pressure or service compatibility. Re-check P-T rating and corrosion allowance."
          />
          <OverrideField
            label="Body material specification"
            recommended={engineResult.bodyMaterialSpec}
            overrideKey="bodyMaterialSpecOverride"
            options={[...OPTIONS.bodyMaterialSpecOverride]}
            reasoning="ASTM grade aligned with body material and service (NACE / sour / low-temp variants where applicable)."
            warning="Verify ASTM grade matches selected body material and is permitted for the service category."
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trim
          </p>
          <OverrideField
            label="Seat material"
            recommended={engineResult.seatMaterial}
            overrideKey="seatMaterialOverride"
            options={[...OPTIONS.seatMaterialOverride]}
            reasoning={
              trimReason ||
              "Soft seats (PTFE/PEEK) for tight shutoff at moderate temperatures; metal seats for high-temp / abrasive service."
            }
            warning="Check seat temperature limit and shutoff class against design conditions."
          />
          <OverrideField
            label="Disc / Ball material"
            recommended={engineResult.discBallMaterial}
            overrideKey="discBallMaterialOverride"
            options={[...OPTIONS.discBallMaterialOverride]}
            reasoning="Trim hardness/coating selected for erosion, throttling and corrosion resistance."
            warning="May impact erosion life and shutoff performance — confirm with vendor."
          />
          <OverrideField
            label="Stem material"
            recommended={engineResult.stemMaterial}
            overrideKey="stemMaterialOverride"
            options={[...OPTIONS.stemMaterialOverride]}
            reasoning="Stem grade chosen for strength, galling and corrosion resistance vs. body/packing."
            warning="Check galvanic compatibility with body and packing; verify NACE compliance for sour service."
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sealing
          </p>
          <OverrideField
            label="Gasket"
            recommended={engineResult.gasket}
            overrideKey="gasketOverride"
            options={[...OPTIONS.gasketOverride]}
            reasoning="Gasket type matched to flange facing, pressure class and service (RTJ for high-pressure, spiral-wound elsewhere)."
            warning="Ensure gasket type matches flange facing (RF/RTJ/FF) and pressure class."
          />
          <OverrideField
            label="Packing"
            recommended={engineResult.packing}
            overrideKey="packingOverride"
            options={[...OPTIONS.packingOverride]}
            reasoning="Packing chosen for fugitive-emissions class and temperature; live-loaded graphite for low-emission service."
            warning="Verify packing meets project fugitive emission requirement (e.g. ISO 15848-1)."
          />
        </CardContent>
      </Card>
    </StepShell>
  );
}
