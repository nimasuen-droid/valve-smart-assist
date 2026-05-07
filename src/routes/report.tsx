import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Download,
  FileText,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  FileSpreadsheet,
  Gauge,
  ChevronDown,
  Star,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReferenceBubble, WarningBanner, WhyCard, LearningMoment } from "@/components/InfoCards";
import { GovernanceBanner } from "@/components/GovernanceNotice";
import { PRESSURE_CLASSES, PIPE_SIZES } from "@/lib/valveSelectionEngine";
import { useSelectionResult } from "@/lib/useSelectionResult";
import { useSelection } from "@/lib/SelectionContext";
import { saveSelection } from "@/lib/selectionState";
import { getIssueReadinessStatus, getOverrideIssues } from "@/lib/issueReadiness";
import { runSizing, evaluateAgainstValve } from "@/lib/sizing";
import { APP_GOVERNANCE, USER_RESPONSIBILITY_NOTICE } from "@/lib/governance";
import { toast } from "sonner";
// @ts-expect-error - datasheetUtils is a JS module
import { generatePdfHtml, exportDatasheetToExcel, safeExportFilename } from "@/lib/datasheetUtils";

function MSection({
  title,
  icon,
  badge,
  defaultOpen = true,
  children,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
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
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform md:hidden ${open ? "rotate-180" : ""}`}
        />
      </CardHeader>
      <CardContent className={`${open ? "block" : "hidden"} md:block`}>{children}</CardContent>
    </Card>
  );
}

type OverrideSpec = {
  key: string;
  label: string;
  recommended: string;
  selected: string;
  inputKey: string;
};

function OverridesSummary({
  input,
  engineResult,
  result,
}: {
  input: ReturnType<typeof useSelection>["input"];
  engineResult: ReturnType<typeof useSelectionResult>["engineResult"];
  result: ReturnType<typeof useSelectionResult>["result"];
}) {
  const reasons = input.overrideReasons ?? {};
  const fields: OverrideSpec[] = [
    {
      key: "valveType",
      label: "Valve type",
      recommended: engineResult.valveType,
      selected: result.valveType,
      inputKey: "valveTypeOverride",
    },
    {
      key: "boreOverride",
      label: "Bore",
      recommended: "Reduced Bore",
      selected: input.boreOverride || "Reduced Bore",
      inputKey: "boreOverride",
    },
    {
      key: "bodyMaterial",
      label: "Body material",
      recommended: engineResult.bodyMaterial,
      selected: result.bodyMaterial,
      inputKey: "bodyMaterialOverride",
    },
    {
      key: "bodyMaterialSpec",
      label: "Body material spec",
      recommended: engineResult.bodyMaterialSpec,
      selected: result.bodyMaterialSpec,
      inputKey: "bodyMaterialSpecOverride",
    },
    {
      key: "seatMaterial",
      label: "Seat material",
      recommended: engineResult.seatMaterial,
      selected: result.seatMaterial,
      inputKey: "seatMaterialOverride",
    },
    {
      key: "discBallMaterial",
      label: "Disc / Ball material",
      recommended: engineResult.discBallMaterial,
      selected: result.discBallMaterial,
      inputKey: "discBallMaterialOverride",
    },
    {
      key: "stemMaterial",
      label: "Stem material",
      recommended: engineResult.stemMaterial,
      selected: result.stemMaterial,
      inputKey: "stemMaterialOverride",
    },
    {
      key: "gasket",
      label: "Gasket",
      recommended: engineResult.gasket,
      selected: result.gasket,
      inputKey: "gasketOverride",
    },
    {
      key: "packing",
      label: "Packing",
      recommended: engineResult.packing,
      selected: result.packing,
      inputKey: "packingOverride",
    },
    {
      key: "endConnection",
      label: "End connection",
      recommended: engineResult.endConnection,
      selected: result.endConnection,
      inputKey: "endConnectionOverride",
    },
    {
      key: "operator",
      label: "Operator",
      recommended: engineResult.operator,
      selected: result.operator,
      inputKey: "operatorOverride",
    },
  ];

  const overridden = fields.filter(
    (f) => f.selected && f.recommended && f.selected !== f.recommended,
  );

  return (
    <MSection
      icon={
        overridden.length ? (
          <AlertTriangle className="h-5 w-5 text-warning" />
        ) : (
          <Star className="h-5 w-5 fill-success text-success" />
        )
      }
      title="Overrides summary"
      badge={
        overridden.length ? (
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
            {overridden.length} override{overridden.length > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            All recommended
          </Badge>
        )
      }
      defaultOpen={overridden.length > 0}
    >
      {overridden.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No engineering recommendations have been overridden. The selected specification matches
          the engine output.
        </p>
      ) : (
        <div className="space-y-3">
          {overridden.map((f) => {
            const reason = reasons[f.inputKey]?.trim();
            return (
              <div key={f.key} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                  {f.label}
                </p>
                <dl className="mt-1 grid gap-1 text-xs sm:grid-cols-2">
                  <div className="flex items-baseline gap-2">
                    <dt className="text-muted-foreground">Recommended:</dt>
                    <dd className="inline-flex items-center gap-1 font-mono text-success">
                      <Star className="h-3 w-3 fill-success text-success" />
                      {f.recommended}
                    </dd>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <dt className="text-muted-foreground">Selected:</dt>
                    <dd className="font-mono text-warning">{f.selected}</dd>
                  </div>
                </dl>
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">Override status: </span>
                  <span className="font-medium text-warning">Yes</span>
                </p>
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">Override reason: </span>
                  {reason ? (
                    <span className="text-foreground">{reason}</span>
                  ) : (
                    <span className="text-destructive">
                      Not provided - required for traceability.
                    </span>
                  )}
                </p>
              </div>
            );
          })}
          <p className="rounded border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            Engineering note: Final selection must be validated against applicable codes, standards,
            and project specifications.
          </p>
        </div>
      )}
    </MSection>
  );
}

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Recommendation Report - Valve Selection Guide" },
      {
        name: "description",
        content:
          "Recommended valve specification with rationale, alternatives, ASME B16.5 checks, warnings and references.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { input, result, asmeWarning, asmeRec, b1634Check, materialRatingGroup, engineResult } =
    useSelectionResult();
  const { update } = useSelection();
  const [previewOpen, setPreviewOpen] = useState(false);
  const overrideIssues = useMemo(
    () => getOverrideIssues({ input, result, engineResult, asmeRec }),
    [input, result, engineResult, asmeRec],
  );
  const issueReadiness = useMemo(() => getIssueReadinessStatus(overrideIssues), [overrideIssues]);
  const [generatedAt, setGeneratedAt] = useState("Pending client timestamp");

  useEffect(() => {
    setGeneratedAt(new Date().toISOString());
  }, []);

  const datasheetHtml = useMemo(
    () =>
      generatePdfHtml({
        ...input,
        ...result,
        status: issueReadiness.status,
        generatedAt,
        materialRatingGroup,
      }) as string,
    [input, result, issueReadiness.status, generatedAt, materialRatingGroup],
  );

  const sizing = useMemo(() => {
    if (input.valveFunction !== "Throttling / Control") return null;
    if (!input.sizingFlow || !input.sizingDp) return null;
    const phase =
      input.sizingPhase ??
      (input.fluidType?.toLowerCase().includes("gas") || input.fluidType === "Steam"
        ? "gas"
        : "liquid");
    const s = runSizing({
      phase,
      inletPressureBarg: parseFloat(
        input.sizingInletP ?? input.operatingPressure ?? input.designPressure ?? "",
      ),
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
  }, [input, result.valveType]);

  const spec: [string, string][] = [
    ["Valve type", result.valveType],
    ["Valve subtype", result.valveSubtype],
    ["Body material", result.bodyMaterial],
    ["Body material spec", result.bodyMaterialSpec],
    ["ASME material group", materialRatingGroup?.label ?? "Verify against material grade"],
    ["B16.5 rating table", materialRatingGroup?.b165Table ?? "Verify"],
    ["B16.34 body basis", materialRatingGroup?.b1634Table ?? "Verify"],
    ["Rating dataset", materialRatingGroup?.dataset?.datasetVersion ?? "Bundled draft"],
    ["App version", APP_GOVERNANCE.appVersion],
    ["Release ID", APP_GOVERNANCE.releaseId],
    ["Readiness", APP_GOVERNANCE.defaultReadiness],
    ["Generated at", generatedAt],
    ["Seat material", result.seatMaterial],
    ["Disc / Ball material", result.discBallMaterial],
    ["Stem material", result.stemMaterial],
    ["End connection", result.endConnection],
    ["End connection std", result.endConnectionStd],
    ["Operator", result.operator],
    ["Gasket", result.gasket],
    ["Packing", result.packing],
    ["Fire safe", result.fireSafe ? "Yes - API 607" : "No / N/A"],
    ["Valve standard", result.valveStandard],
    ["Face-to-face", result.faceToFaceStd],
    ["Flange standard", result.flangeStandard],
    ["Testing standard", result.testingStandard],
  ];
  const ratingDataset = materialRatingGroup?.dataset;
  const ratingDatasetNote =
    ratingDataset?.verificationStatus === "USER_APPROVED"
      ? `${ratingDataset.datasetVersion}; user-approved licensed table set.`
      : `${ratingDataset?.datasetVersion ?? "Bundled draft"}; draft screening basis only - verify against licensed/current ASME tables.`;

  const guardIssueAction = (actionName: string, fn: () => void) => {
    if (!issueReadiness.canIssue) {
      toast.error(`${actionName} blocked: override justification required`, {
        description: issueReadiness.missing.map((m) => m.label).join(", "),
      });
      return;
    }
    fn();
  };

  const exportPdf = () => {
    guardIssueAction("Export PDF", () => {
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.opener = null;
        w.document.write(datasheetHtml);
        w.document.close();
        setTimeout(() => w.print(), 400);
      }
    });
  };

  const downloadHtml = () => {
    guardIssueAction("Download HTML", () => {
      const blob = new Blob([datasheetHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ValveDatasheet_${safeExportFilename(input.tagNumber, "draft")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportExcel = () => {
    guardIssueAction("Export Excel", () => {
      exportDatasheetToExcel({
        ...input,
        ...result,
        status: issueReadiness.status,
        generatedAt,
        materialRatingGroup,
      });
      toast.success("Excel datasheet downloaded");
    });
  };

  const onSave = () => {
    const saved = saveSelection({
      input,
      result,
      issueStatus: issueReadiness.status,
      overrideIssues,
    });
    toast.success(`Saved as ${saved.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Output</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Recommendation Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated live from your inputs by the API 615 selection engine.
          </p>
          {!issueReadiness.canIssue && (
            <p className="mt-2 max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              Issue/export blocked until override reasons are completed for:{" "}
              {issueReadiness.missing.map((m) => m.label).join(", ")}.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/wizard/project">
              <ArrowLeft className="h-4 w-4" /> Inputs
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
          >
            <Eye className="h-4 w-4" /> View Datasheet
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            <Download className="h-4 w-4" /> Download HTML
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button
            size="sm"
            className="bg-gradient-accent text-primary-foreground shadow-glow"
            onClick={exportPdf}
          >
            <Printer className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-surface shadow-elevated">
        <CardContent className="grid gap-6 p-6 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Project</p>
            <p className="mt-1 font-medium">{input.projectName || "-"}</p>
            <p className="text-xs text-muted-foreground font-mono">Tag: {input.tagNumber || "-"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Service</p>
            <p className="mt-1 text-sm">{input.serviceType}</p>
            <p className="text-xs text-muted-foreground">{input.fluidType}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Size / Class
            </p>
            <p className="mt-1 text-sm font-mono">
              Line {input.pipeSize}
              {input.valveSize && input.valveSize !== input.pipeSize
                ? ` | Valve ${input.valveSize}`
                : ""}{" "}
              | {input.pressureClass}
            </p>
            <p className="text-xs text-muted-foreground">{input.valveFunction}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Design</p>
            <p className="mt-1 text-sm font-mono">
              {input.designPressure} barg @ {input.designTemp} deg C
            </p>
            <p className="text-xs text-muted-foreground">{input.installationLocation}</p>
          </div>
        </CardContent>
      </Card>

      <GovernanceBanner />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <MSection
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            title="Selected valve specification"
            badge={
              <Badge className="border-success/40 bg-success/10 text-success" variant="outline">
                Recommended
              </Badge>
            }
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Pressure class (override)
                </p>
                <Select
                  value={input.pressureClass}
                  onValueChange={(v) => update({ pressureClass: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(PRESSURE_CLASSES as string[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {asmeRec && asmeRec.recommendedClass !== input.pressureClass && (
                  <p className="mt-1 text-[11px] text-warning">
                    Recommended: {asmeRec.recommendedClass}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Pipe size (override)
                </p>
                <Select value={input.pipeSize} onValueChange={(v) => update({ pipeSize: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {(PIPE_SIZES as string[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <dl className="divide-y divide-border">
              {spec.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-right text-sm font-medium font-mono">{v || "-"}</dd>
                </div>
              ))}
            </dl>
          </MSection>

          <OverridesSummary input={input} engineResult={engineResult} result={result} />

          {sizing && (
            <MSection
              icon={<Gauge className="h-5 w-5 text-primary" />}
              title="Control valve sizing (IEC 60534)"
              badge={
                <Badge
                  className={
                    sizing.v.verdict === "PASS"
                      ? "border-success/40 bg-success/10 text-success"
                      : sizing.v.verdict === "REVIEW"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : sizing.v.verdict === "UNDERSIZED"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
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
                    <dd className="text-right text-sm font-medium font-mono">
                      {sizing.s.requiredCv.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">Required Kv</dt>
                    <dd className="text-right text-sm font-medium font-mono">
                      {sizing.s.requiredKv.toFixed(2)}
                    </dd>
                  </div>
                  {sizing.v.typicalCv !== undefined && (
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-muted-foreground">
                        Typical full-open Cv ({result.valveType} {input.valveSize || input.pipeSize}
                        )
                      </dt>
                      <dd className="text-right text-sm font-medium font-mono">
                        {sizing.v.typicalCv}
                      </dd>
                    </div>
                  )}
                  {sizing.v.openingPct !== undefined && (
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-muted-foreground">Estimated valve opening</dt>
                      <dd className="text-right text-sm font-medium font-mono">
                        {sizing.v.openingPct.toFixed(0)} %
                      </dd>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">Choked flow</dt>
                    <dd className="text-right text-sm font-medium font-mono">
                      {sizing.s.choked
                        ? `Yes - DeltaP >= ${sizing.s.chokedDpBar?.toFixed(2)} bar`
                        : "No"}
                    </dd>
                  </div>
                </dl>
              )}
              <p className="mt-3 rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {sizing.v.verdictNote}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Per IEC 60534-2-1 / ISA 75.01. Preliminary check - vendor sizing software required
                for final selection.
              </p>
            </MSection>
          )}

          {(engineResult.alternatives?.length > 0 || input.valveTypeOverride) && (
            <MSection
              icon={<AlertCircle className="h-4 w-4 text-warning" />}
              title="Alternatives & rejected options"
              badge={
                input.valveTypeOverride ? (
                  <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                    Override active
                  </Badge>
                ) : undefined
              }
              defaultOpen={false}
            >
              <p className="mb-3 text-xs text-muted-foreground">
                Click an alternative to override the engine recommendation. The report and datasheet
                will regenerate using your choice.
              </p>
              <div className="space-y-2">
                {engineResult.valveType &&
                  input.valveTypeOverride &&
                  input.valveTypeOverride !== engineResult.valveType && (
                    <div className="flex items-start justify-between gap-3 rounded-md border border-success/30 bg-success/5 p-3">
                      <div>
                        <p className="text-sm font-medium">
                          {engineResult.valveType}{" "}
                          <span className="text-xs text-muted-foreground">
                            (engine recommendation)
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Restore the original engine pick.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update({ valveTypeOverride: "" })}
                      >
                        Restore
                      </Button>
                    </div>
                  )}
                {engineResult.alternatives.map((a, i) => {
                  const active = input.valveTypeOverride === a.type;
                  return (
                    <div
                      key={i}
                      className={`flex items-start justify-between gap-3 rounded-md border p-3 ${active ? "border-warning bg-warning/10" : "border-warning/30 bg-warning/5"}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.type}</p>
                        <p className="text-xs text-muted-foreground">{a.reason}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={active ? "default" : "outline"}
                        onClick={() => update({ valveTypeOverride: active ? "" : a.type })}
                      >
                        {active ? "Selected" : "Use this"}
                      </Button>
                    </div>
                  );
                })}
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {key}
                  </p>
                  <p className="mt-1 text-sm text-foreground/90">{r.reason}</p>
                  {r.rule && (
                    <p className="mt-2 text-xs text-muted-foreground border-l-2 border-primary/40 pl-2">
                      <span className="font-semibold text-foreground">Rule: </span>
                      {r.rule}
                    </p>
                  )}
                  {r.refs && r.refs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.refs.map((ref, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-mono text-info"
                        >
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
                The recommended class comes from cross-referencing your design pressure against the
                B16.5 P-T curve at design temperature, plus a margin for upset. Going one class
                higher gives headroom but adds cost and weight; going lower risks derating below
                operating conditions.
              </LearningMoment>
            </>
          )}
          {asmeWarning && (
            <WarningBanner
              title={
                asmeWarning.type === "caution" ? "ASME B16.5 caution" : "ASME B16.5 rating exceeded"
              }
            >
              {asmeWarning.warning}
            </WarningBanner>
          )}
          {b1634Check && (
            <WarningBanner
              title={b1634Check.type === "ok" ? "ASME B16.34 body check" : "ASME B16.34 caution"}
            >
              {b1634Check.warning}
            </WarningBanner>
          )}
          {materialRatingGroup && (
            <ReferenceBubble
              standard={materialRatingGroup.label}
              note={`${materialRatingGroup.b165Table}; ${materialRatingGroup.b1634Table}. ${ratingDatasetNote}`}
            />
          )}
          {result.warnings.map((w, i) => (
            <WarningBanner key={i} title="Engineering warning">
              {w}
            </WarningBanner>
          ))}
          <WarningBanner title="User responsibility">{USER_RESPONSIBILITY_NOTICE}</WarningBanner>
          <ReferenceBubble
            standard="API 615"
            note="Short reference used for screening logic. Verify final selection against the licensed/current standard and project specification."
          />
          <ReferenceBubble
            standard="API 598"
            note="Short reference for inspection and test basis. Verify test requirements against the licensed/current standard and project specification."
          />
          <ReferenceBubble
            standard="ASME B16.34"
            note="Short reference for valve body rating checks. Verify material grade and pressure-temperature rating against licensed/current tables."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2 border-t pt-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/wizard/project">
            <ArrowLeft className="h-4 w-4" /> Inputs
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button
          size="sm"
          onClick={() => setPreviewOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
        >
          <Eye className="h-4 w-4" /> View Datasheet
        </Button>
        <Button variant="outline" size="sm" onClick={downloadHtml}>
          <Download className="h-4 w-4" /> Download HTML
        </Button>
        <Button variant="outline" size="sm" onClick={exportExcel}>
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </Button>
        <Button
          size="sm"
          className="bg-gradient-accent text-primary-foreground shadow-glow"
          onClick={exportPdf}
        >
          <Printer className="h-4 w-4" /> Export PDF
        </Button>
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
              sandbox=""
              className="h-[75vh] w-full border-0 bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
            <Button variant="outline" size="sm" onClick={downloadHtml}>
              <Download className="h-4 w-4" /> Download HTML
            </Button>
            <Button
              size="sm"
              className="bg-gradient-accent text-primary-foreground shadow-glow"
              onClick={exportPdf}
            >
              <Printer className="h-4 w-4" /> Print / Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
