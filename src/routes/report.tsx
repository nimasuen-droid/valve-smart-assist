import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer, ArrowLeft, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ReferenceBubble, WarningBanner, WhyCard } from "@/components/InfoCards";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Recommendation Report — Valve Selection Guide" },
      { name: "description", content: "Recommended valve selection with rationale, alternatives, warnings and references." },
    ],
  }),
  component: ReportPage,
});

const spec = [
  ["Valve type", "Trunnion-mounted Ball Valve"],
  ["Body material", "ASTM A105N — Carbon Steel"],
  ["Trim material", "13Cr (410 SS)"],
  ["Seat type", "RPTFE, fire-safe secondary metal seat"],
  ["End connection", 'Flanged RF, NPS 8'],
  ["Pressure class", "ASME CL600"],
  ["Bonnet", "Bolted — primary stem seal"],
  ["Actuation", "Pneumatic spring-return (fail-close)"],
  ["Fire-safe", "API 607 / API 6FA certified"],
  ["NACE compliance", "MR0175 / ISO 15156 — confirmed"],
];

const alternatives = [
  { name: "Through-conduit gate valve, CL600", note: "Acceptable; preferred only if pigging is required." },
  { name: "High-performance butterfly, CL600 lugged", note: "Cost saving in larger sizes — verify Class IV shut-off." },
];

const rejected = [
  { name: "Globe valve", note: "Throttling design — inadequate as primary isolation." },
  { name: "Lubricated plug valve", note: "High maintenance burden in clean hydrocarbon service." },
];

function ReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Output</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Recommendation Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated from your inputs. Review, then export for design review or procurement package.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/wizard/special"><ArrowLeft className="h-4 w-4" /> Back to inputs</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => typeof window !== "undefined" && window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button size="sm" className="bg-gradient-accent text-primary-foreground shadow-glow">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Header summary */}
      <Card className="bg-gradient-surface shadow-elevated">
        <CardContent className="grid gap-6 p-6 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Project</p>
            <p className="mt-1 font-medium">North Sea Compression Upgrade</p>
            <p className="text-xs text-muted-foreground font-mono">JN-20458 · Unit 200</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Line tag</p>
            <p className="mt-1 font-mono text-sm">12"-PG-1042-A1A-IH</p>
            <p className="text-xs text-muted-foreground">ASME B31.3</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Service</p>
            <p className="mt-1 text-sm">Wet sour gas, 3% H₂S</p>
            <p className="text-xs text-muted-foreground">Gas phase</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Design</p>
            <p className="mt-1 text-sm font-mono">95 barg @ 180 °C</p>
            <p className="text-xs text-muted-foreground">Min −29 °C</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Selected spec */}
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
                    <dd className="text-right text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-warning" /> Alternatives considered
              </CardTitle>
              <CardDescription>Acceptable but not preferred for this duty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alternatives.map((a) => (
                <div key={a.name} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-4 w-4 text-destructive" /> Rejected with reason
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rejected.map((r) => (
                <div key={r.name} className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <WhyCard>
            Trunnion ball with fire-safe RPTFE seats, 13Cr trim and CL600 RF ends meets the
            isolation duty for wet sour gas at 95 barg / 180 °C, satisfies API 607 fire-safe,
            and complies with NACE MR0175 hardness limits for the line class.
          </WhyCard>

          <WarningBanner title="Verify before issue">
            Confirm seat material temperature limit against any upset condition above 200 °C.
            RPTFE softens above 230 °C — consider PEEK if upset analysis exceeds this.
          </WarningBanner>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-info" /> Engineering notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>· Specify double block & bleed if used as positive isolation barrier.</p>
              <p>· Pneumatic actuator sized to 1.25× max differential pressure.</p>
              <p>· Gear operator required above NPS 8 / CL600 manual.</p>
              <p>· Position transmitter for ESDV partial-stroke testing.</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <ReferenceBubble standard="API 6D" note="Pipeline valve specification — applies to isolation duty." />
            <ReferenceBubble standard="ASME B16.34" note="P-T rating verified at 95 barg / 180 °C, CL600." />
            <ReferenceBubble standard="NACE MR0175" note="Materials confirmed for sour service." />
          </div>
        </div>
      </div>
    </div>
  );
}
