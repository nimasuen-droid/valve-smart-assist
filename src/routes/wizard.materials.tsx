import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { Card, CardContent } from "@/components/ui/card";
import { ReferenceBubble, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";

export const Route = createFileRoute("/wizard/materials")({
  head: () => ({ meta: [{ title: "Body / Trim / Seat — Valve Selection Guide" }] }),
  component: MaterialsStep,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium font-mono">{value || "—"}</dd>
    </div>
  );
}

function MaterialsStep() {
  const { result } = useSelectionResult();
  const refs = [
    ...(result.rationale.bodyMaterial?.refs || []),
    ...(result.rationale.trim?.refs || []),
  ];
  return (
    <StepShell
      step="/wizard/materials"
      title="Body, Trim & Seat Materials"
      subtitle="Materials derived from your service type, temperature and pressure class per ASME B16.34 and API 615."
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
            <Row label="Body material" value={result.bodyMaterial} />
            <Row label="Body material specification" value={result.bodyMaterialSpec} />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trim</p>
          <dl>
            <Row label="Seat material" value={result.seatMaterial} />
            <Row label="Disc / Ball material" value={result.discBallMaterial} />
            <Row label="Stem material" value={result.stemMaterial} />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sealing</p>
          <dl>
            <Row label="Gasket" value={result.gasket} />
            <Row label="Packing" value={result.packing} />
          </dl>
        </CardContent>
      </Card>
    </StepShell>
  );
}
