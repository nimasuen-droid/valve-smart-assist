import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Printer, ArrowLeft, CheckCircle2, AlertCircle, Save, Eye } from "lucide-react";
import { ReferenceBubble, WarningBanner, WhyCard } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { saveSelection } from "@/lib/selectionState";
import { toast } from "sonner";
// @ts-ignore - datasheetUtils is a JS module
import { generatePdfHtml } from "@/lib/datasheetUtils";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Recommendation Report — Valve Selection Guide" },
      { name: "description", content: "Recommended valve specification with rationale, alternatives, ASME B16.5 checks, warnings and references." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { input, result, asmeWarning, asmeRec } = useSelectionResult();
  const [previewOpen, setPreviewOpen] = useState(false);

  const datasheetHtml = useMemo(
    () => generatePdfHtml({ ...input, ...result, status: "Issued for Review" }) as string,
    [input, result],
  );

  const spec: [string, string][] = [
    ["Valve type", result.valveType],
    ["Valve subtype", result.valveSubtype],
    ["Body material", result.bodyMaterial],
    ["Body material spec", result.bodyMaterialSpec],
    ["Seat material", result.seatMaterial],
    ["Disc / Ball material", result.discBallMaterial],
    ["Stem material", result.stemMaterial],
    ["End connection", result.endConnection],
    ["End connection std", result.endConnectionStd],
    ["Operator", result.operator],
    ["Gasket", result.gasket],
    ["Packing", result.packing],
    ["Fire safe", result.fireSafe ? "Yes — API 607" : "No / N/A"],
    ["Valve standard", result.valveStandard],
    ["Face-to-face", result.faceToFaceStd],
    ["Flange standard", result.flangeStandard],
    ["Testing standard", result.testingStandard],
  ];

  const exportPdf = () => {
    const html = generatePdfHtml({ ...input, ...result, status: "Issued for Review" }) as string;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 400);
    }
  };

  const onSave = () => {
    const saved = saveSelection({ input, result });
    toast.success(`Saved as ${saved.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Output</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Recommendation Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated live from your inputs by the API 615 selection engine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/wizard/special"><ArrowLeft className="h-4 w-4" /> Inputs</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => typeof window !== "undefined" && window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button size="sm" className="bg-gradient-accent text-primary-foreground shadow-glow" onClick={exportPdf}>
            <Download className="h-4 w-4" /> Export Datasheet
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-surface shadow-elevated">
        <CardContent className="grid gap-6 p-6 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Project</p>
            <p className="mt-1 font-medium">{input.projectName || "—"}</p>
            <p className="text-xs text-muted-foreground font-mono">Tag: {input.tagNumber || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Service</p>
            <p className="mt-1 text-sm">{input.serviceType}</p>
            <p className="text-xs text-muted-foreground">{input.fluidType}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Size / Class</p>
            <p className="mt-1 text-sm font-mono">{input.pipeSize} · {input.pressureClass}</p>
            <p className="text-xs text-muted-foreground">{input.valveFunction}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Design</p>
            <p className="mt-1 text-sm font-mono">{input.designPressure} barg @ {input.designTemp} °C</p>
            <p className="text-xs text-muted-foreground">{input.installationLocation}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle className="text-base">Selected valve specification</CardTitle>
              <Badge className="ml-auto border-success/40 bg-success/10 text-success" variant="outline">
                Recommended
              </Badge>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                {spec.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-right text-sm font-medium font-mono">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {result.alternatives?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-warning" /> Alternatives & rejected options
                </CardTitle>
                <CardDescription>Considered by the engine — accepted as alternatives or rejected with reason.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.alternatives.map((a, i) => (
                  <div key={i} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                    <p className="text-sm font-medium">{a.type}</p>
                    <p className="text-xs text-muted-foreground">{a.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-info" /> Engineering rationale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(result.rationale).map(([key, r]) => (
                <div key={key} className="rounded-md border border-border bg-card/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{key}</p>
                  <p className="mt-1 text-sm text-foreground/90">{r.reason}</p>
                  {r.rule && (
                    <p className="mt-2 text-xs text-muted-foreground border-l-2 border-primary/40 pl-2">
                      <span className="font-semibold text-foreground">Rule: </span>{r.rule}
                    </p>
                  )}
                  {r.refs && r.refs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.refs.map((ref, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-mono text-info">
                          {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {asmeRec && (
            <WhyCard>
              <strong className="text-foreground">ASME B16.5 P-T check: </strong>
              {asmeRec.note}
            </WhyCard>
          )}
          {asmeWarning && (
            <WarningBanner title={asmeWarning.type === "caution" ? "ASME B16.5 caution" : "ASME B16.5 rating exceeded"}>
              {asmeWarning.warning}
            </WarningBanner>
          )}
          {result.warnings.map((w, i) => (
            <WarningBanner key={i} title="Engineering warning">{w}</WarningBanner>
          ))}
          <ReferenceBubble standard="API 615" note="Recommended practice — drives the selection logic." />
          <ReferenceBubble standard="API 598" note="Valve inspection & testing." />
          <ReferenceBubble standard="ASME B16.34" note="P-T ratings for flanged, threaded & welded valves." />
        </div>
      </div>
    </div>
  );
}
