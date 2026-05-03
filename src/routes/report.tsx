import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Printer, ArrowLeft, CheckCircle2, AlertCircle, Save, Eye, FileSpreadsheet, Gauge, ChevronDown } from "lucide-react";
import { ReferenceBubble, WarningBanner, WhyCard, LearningMoment } from "@/components/InfoCards";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { useSelection } from "@/lib/SelectionContext";
import { saveSelection } from "@/lib/selectionState";
import { runSizing, evaluateAgainstValve } from "@/lib/sizing";
import { toast } from "sonner";
// @ts-ignore - datasheetUtils is a JS module
import { generatePdfHtml, exportDatasheetToExcel } from "@/lib/datasheetUtils";

function MSection({ title, icon, badge, defaultOpen = true, children }: { title: React.ReactNode; icon?: React.ReactNode; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader
        className="flex-row items-center gap-2 space-y-0 cursor-pointer md:cursor-default"
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <CardTitle className="text-base flex-1">{title}</CardTitle>
        {badge}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform md:hidden ${open ? "rotate-180" : ""}`} />
      </CardHeader>
      <CardContent className={`${open ? "block" : "hidden"} md:block`}>{children}</CardContent>
    </Card>
  );
}

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
  const { input, result, asmeWarning, asmeRec, engineResult } = useSelectionResult();
  const { update } = useSelection();
  const [previewOpen, setPreviewOpen] = useState(false);

  const datasheetHtml = useMemo(
    () => generatePdfHtml({ ...input, ...result, status: "Issued for Review" }) as string,
    [input, result],
  );

  const sizing = useMemo(() => {
    if (input.valveFunction !== "Throttling / Control") return null;
    if (!input.sizingFlow || !input.sizingDp) return null;
    const phase = input.sizingPhase ?? (input.fluidType?.toLowerCase().includes("gas") || input.fluidType === "Steam" ? "gas" : "liquid");
    const s = runSizing({
      phase,
      inletPressureBarg: parseFloat(input.sizingInletP ?? input.operatingPressure ?? input.designPressure ?? ""),
      pressureDropBar: parseFloat(input.sizingDp),
      temperatureC: parseFloat(input.sizingTemp ?? input.operatingTemp ?? input.designTemp ?? ""),
      flowRate_m3h: phase === "liquid" ? parseFloat(input.sizingFlow) : undefined,
      flowRate_Nm3h: phase === "gas" ? parseFloat(input.sizingFlow) : undefined,
      specificGravity: phase === "liquid" ? parseFloat(input.sizingSG ?? "1") : undefined,
      vaporPressureBara: phase === "liquid" ? parseFloat(input.sizingPv ?? "0") : undefined,
      gasSG: phase === "gas" ? parseFloat(input.sizingSG ?? "0.65") : undefined,
      k: phase === "gas" ? parseFloat(input.sizingK ?? "1.3") : undefined,
      selectedValveType: result.valveType,
    });
    const v = evaluateAgainstValve(s, result.valveType, input.valveSize || input.pipeSize);
    return { s, v };
  }, [input, result.valveType, result.valveSubtype, input.pipeSize, input.valveSize]);

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
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(datasheetHtml);
      w.document.close();
      setTimeout(() => w.print(), 400);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([datasheetHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ValveDatasheet_${input.tagNumber || "draft"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    exportDatasheetToExcel({ ...input, ...result, status: "Issued for Review" });
    toast.success("Excel datasheet downloaded");
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
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" /> View Datasheet
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            <Download className="h-4 w-4" /> Download HTML
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button size="sm" className="bg-gradient-accent text-primary-foreground shadow-glow" onClick={exportPdf}>
            <Printer className="h-4 w-4" /> Export PDF
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
            <p className="mt-1 text-sm font-mono">Line {input.pipeSize}{input.valveSize && input.valveSize !== input.pipeSize ? ` · Valve ${input.valveSize}` : ""} · {input.pressureClass}</p>
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
          <MSection
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            title="Selected valve specification"
            badge={<Badge className="border-success/40 bg-success/10 text-success" variant="outline">Recommended</Badge>}
          >
            <dl className="divide-y divide-border">
              {spec.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-right text-sm font-medium font-mono">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </MSection>

          {sizing && (
            <MSection
              icon={<Gauge className="h-5 w-5 text-primary" />}
              title="Control valve sizing (IEC 60534)"
              badge={
                <Badge
                  className={
                    sizing.v.verdict === "PASS" ? "border-success/40 bg-success/10 text-success"
                    : sizing.v.verdict === "REVIEW" ? "border-warning/40 bg-warning/10 text-warning"
                    : sizing.v.verdict === "UNDERSIZED" ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border bg-muted text-muted-foreground"
                  }
                  variant="outline"
                >
                  {sizing.v.verdict}
                </Badge>
              }
            >
              {!sizing.s.ok ? (
                <p className="text-sm text-muted-foreground">{sizing.s.errors.join(" ")}</p>
              ) : (
                <dl className="divide-y divide-border">
                  <div className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">Required Cv</dt>
                    <dd className="text-right text-sm font-medium font-mono">{sizing.s.requiredCv.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">Required Kv</dt>
                    <dd className="text-right text-sm font-medium font-mono">{sizing.s.requiredKv.toFixed(2)}</dd>
                  </div>
                  {sizing.v.typicalCv !== undefined && (
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-muted-foreground">Typical full-open Cv ({result.valveType} {input.valveSize || input.pipeSize})</dt>
                      <dd className="text-right text-sm font-medium font-mono">{sizing.v.typicalCv}</dd>
                    </div>
                  )}
                  {sizing.v.openingPct !== undefined && (
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-muted-foreground">Estimated valve opening</dt>
                      <dd className="text-right text-sm font-medium font-mono">{sizing.v.openingPct.toFixed(0)} %</dd>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">Choked flow</dt>
                    <dd className="text-right text-sm font-medium font-mono">{sizing.s.choked ? `Yes — ΔP ≥ ${sizing.s.chokedDpBar?.toFixed(2)} bar` : "No"}</dd>
                  </div>
                </dl>
              )}
              <p className="mt-3 rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {sizing.v.verdictNote}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Per IEC 60534-2-1 / ISA 75.01. Preliminary check — vendor sizing software required for final selection.
              </p>
            </MSection>
          )}

          {result.alternatives?.length > 0 && (
            <MSection
              icon={<AlertCircle className="h-4 w-4 text-warning" />}
              title="Alternatives & rejected options"
              defaultOpen={false}
            >
              <div className="space-y-2">
                {result.alternatives.map((a, i) => (
                  <div key={i} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                    <p className="text-sm font-medium">{a.type}</p>
                    <p className="text-xs text-muted-foreground">{a.reason}</p>
                  </div>
                ))}
              </div>
            </MSection>
          )}

          <MSection
            icon={<FileText className="h-4 w-4 text-info" />}
            title="Engineering rationale"
            defaultOpen={false}
          >
            <div className="space-y-3">
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
            </div>
          </MSection>
        </div>

        <div className="space-y-4">
          {asmeRec && (
            <>
              <WhyCard>
                <strong className="text-foreground">ASME B16.5 P-T check: </strong>
                {asmeRec.note}
              </WhyCard>
              <LearningMoment>
                The recommended class comes from cross-referencing your design pressure against the B16.5
                P-T curve at design temperature, plus a margin for upset. Going one class higher gives
                headroom but adds cost and weight; going lower risks derating below operating conditions.
              </LearningMoment>
            </>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl p-0 sm:rounded-lg overflow-hidden">
          <DialogHeader className="border-b px-5 py-3">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" /> Datasheet preview
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/40">
            <iframe
              title="Valve datasheet preview"
              srcDoc={datasheetHtml}
              className="h-[75vh] w-full border-0 bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
            <Button variant="outline" size="sm" onClick={downloadHtml}>
              <Download className="h-4 w-4" /> Download HTML
            </Button>
            <Button size="sm" className="bg-gradient-accent text-primary-foreground shadow-glow" onClick={exportPdf}>
              <Printer className="h-4 w-4" /> Print / Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
