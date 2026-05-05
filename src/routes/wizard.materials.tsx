import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-right text-sm font-medium font-mono">
          {isOverridden ? (
            <span className="text-warning">{current}</span>
          ) : (
            recommended || "—"
          )}
        </dd>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          value={current}
          placeholder={`Override (recommended: ${recommended || "—"})`}
          onChange={(e) =>
            update({ [overrideKey]: e.target.value } as Partial<SelectionInput>)
          }
          className="h-8 text-xs"
        />
        {isOverridden && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
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
      subtitle="Materials derived from your service type, temperature and pressure class per ASME B16.34 and API 615. Override any value below if your project specification requires it."
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
