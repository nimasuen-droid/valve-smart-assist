import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReferenceBubble, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { useSelection, type SelectionInput } from "@/lib/SelectionContext";

export const Route = createFileRoute("/wizard/materials")({
  head: () => ({ meta: [{ title: "Body / Trim / Seat — Valve Selection Guide" }] }),
  component: MaterialsStep,
});

type OverrideKey =
  | "bodyMaterialOverride"
  | "bodyMaterialSpecOverride"
  | "seatMaterialOverride"
  | "discBallMaterialOverride"
  | "stemMaterialOverride"
  | "gasketOverride"
  | "packingOverride";

const OPTIONS: Record<OverrideKey, string[]> = {
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
};

function OverrideRow({
  label,
  recommended,
  overrideKey,
}: {
  label: string;
  recommended: string;
  overrideKey: OverrideKey;
}) {
  const { input, update } = useSelection();
  const current = (input[overrideKey] as string | undefined) ?? "";
  const isOverridden = !!current && current !== recommended;
  const effective = isOverridden ? current : recommended;

  // Merge recommended into options if missing
  const opts = Array.from(new Set([recommended, ...OPTIONS[overrideKey]].filter(Boolean)));

  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-right text-xs">
          {isOverridden ? (
            <span className="text-warning font-medium">User Override</span>
          ) : (
            <span className="text-muted-foreground">Recommended</span>
          )}
        </dd>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Select
          value={effective}
          onValueChange={(v) => {
            if (v === recommended) update({ [overrideKey]: "" } as Partial<SelectionInput>);
            else update({ [overrideKey]: v } as Partial<SelectionInput>);
          }}
        >
          <SelectTrigger className="h-9 flex-1 font-mono text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
                {o === recommended ? "  (recommended)" : ""}
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
        <p className="mt-1 text-[11px] text-warning">
          Manual override — engineering review required.
        </p>
      )}
    </div>
  );
}

function MaterialsStep() {
  const { result, engineResult } = useSelectionResult();
  const refs = [
    ...(result.rationale.bodyMaterial?.refs || []),
    ...(result.rationale.trim?.refs || []),
  ];
  return (
    <StepShell
      step="/wizard/materials"
      title="Body, Trim & Seat Materials"
      subtitle="Materials derived from your service type, temperature and pressure class per ASME B16.34 and API 615. Pick from the dropdown to override the engine recommendation."
      aside={
        <>
          {result.rationale.bodyMaterial && (
            <>
              <WhyCard>
                <p className="mb-2"><strong className="text-foreground">Body: </strong>{result.rationale.bodyMaterial.reason}</p>
              </WhyCard>
              <LearningMoment>
                Body material is set by <strong>fluid + temperature</strong>: WCB carbon steel covers most
                hydrocarbons from −29 °C to 425 °C; LCC/LCB for low-temp service; CF8M (316SS) for corrosives
                and cryogenic; chrome-moly (WC6/WC9) above 425 °C. Sour service adds NACE MR0175/ISO 15156 hardness limits.
              </LearningMoment>
            </>
          )}
          {result.rationale.trim && (
            <>
              <WhyCard>
                <p><strong className="text-foreground">Trim: </strong>{result.rationale.trim.reason}</p>
              </WhyCard>
              <LearningMoment>
                Trim (seat, disc, stem) handles the actual flow shear. It&apos;s typically harder than the
                body — Stellite overlay or hardened 410SS resists erosion in throttling and high-velocity
                service. Soft seats (PTFE/PEEK) give bubble-tight shutoff but cap the temperature rating.
              </LearningMoment>
            </>
          )}
          {Array.from(new Set(refs)).slice(0, 4).map((ref) => (
            <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
          ))}
        </>
      }
    >
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body</p>
          <dl>
            <OverrideRow label="Body material" recommended={engineResult.bodyMaterial} overrideKey="bodyMaterialOverride" />
            <OverrideRow label="Body material specification" recommended={engineResult.bodyMaterialSpec} overrideKey="bodyMaterialSpecOverride" />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trim</p>
          <dl>
            <OverrideRow label="Seat material" recommended={engineResult.seatMaterial} overrideKey="seatMaterialOverride" />
            <OverrideRow label="Disc / Ball material" recommended={engineResult.discBallMaterial} overrideKey="discBallMaterialOverride" />
            <OverrideRow label="Stem material" recommended={engineResult.stemMaterial} overrideKey="stemMaterialOverride" />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sealing</p>
          <dl>
            <OverrideRow label="Gasket" recommended={engineResult.gasket} overrideKey="gasketOverride" />
            <OverrideRow label="Packing" recommended={engineResult.packing} overrideKey="packingOverride" />
          </dl>
        </CardContent>
      </Card>
    </StepShell>
  );
}
