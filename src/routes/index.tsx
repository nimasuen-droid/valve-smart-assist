import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ClipboardList,
  Sparkles,
  FileDown,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Activity,
  Droplet,
  Flame,
  Snowflake,
} from "lucide-react";
import { ReferenceBubble, WarningBanner } from "@/components/InfoCards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Valve Selection Guide" },
      { name: "description", content: "Start a new valve selection or review saved projects." },
    ],
  }),
  component: Dashboard,
});

const recentProjects = [
  { id: "P-2041", name: "HP Steam Header — Block Valve", service: "Saturated Steam", size: 'NPS 8 · CL900', updated: "2h ago", state: "In progress" },
  { id: "P-2039", name: "Amine Regen Bottoms", service: "Lean Amine, sour", size: 'NPS 4 · CL300', updated: "Yesterday", state: "Recommendation ready" },
  { id: "P-2034", name: "LNG Loading Line ESDV", service: "LNG, cryogenic", size: 'NPS 16 · CL300', updated: "3 days ago", state: "Review needed" },
  { id: "P-2027", name: "Cooling Water Isolation", service: "Treated water", size: 'NPS 12 · CL150', updated: "Last week", state: "Exported" },
];

const cautions = [
  { icon: Flame, title: "Fire-safe required", body: "Hydrocarbon service above 0.5 barg should default to API 607 / 6FA fire-tested designs." },
  { icon: Snowflake, title: "Cryogenic temperature", body: "Below −46 °C use extended bonnet, ASTM A352 LCC body, and qualified low-temp trim." },
  { icon: Droplet, title: "Sour service", body: "Confirm NACE MR0175 / ISO 15156 hardness limits on all wetted parts and bolting." },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 shadow-elevated md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <Badge variant="outline" className="mb-3 border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="mr-1 h-3 w-3" /> Engineering Decision Support
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Choose the right valve, with the rationale behind it.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            A guided workflow for process, mechanical and piping engineers. Capture service
            conditions, valve duty and special service flags — get a defensible recommendation
            with references, alternatives, and engineering cautions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-accent text-primary-foreground shadow-glow hover:opacity-95">
              <Link to="/wizard/project">
                <Play className="h-4 w-4" /> Start Selection
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/report">
                <FileDown className="h-4 w-4" /> View Last Report
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick workflow */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Play, label: "Start Selection", to: "/wizard/project", desc: "Project & line data" },
          { icon: ClipboardList, label: "Review Inputs", to: "/wizard/conditions", desc: "Service conditions" },
          { icon: Sparkles, label: "Generate Recommendation", to: "/report", desc: "Run the engine" },
          { icon: FileDown, label: "Export Report", to: "/report", desc: "PDF / printable" },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="group">
            <Card className="h-full border-border transition-all hover:border-primary/50 hover:shadow-glow">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent selections</CardTitle>
              <CardDescription>Local sample data — wire up to your project store later.</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.id} · {p.service}</p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground">{p.size}</span>
                  <Badge
                    variant="outline"
                    className={
                      p.state === "Recommendation ready"
                        ? "border-success/40 bg-success/10 text-success"
                        : p.state === "Review needed"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-border text-muted-foreground"
                    }
                  >
                    {p.state}
                  </Badge>
                  <span className="w-20 text-right text-xs text-muted-foreground">{p.updated}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Engineering cautions
            </CardTitle>
            <CardDescription>Common service traps to verify before issuing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cautions.map((c) => (
              <div key={c.title} className="flex gap-3 rounded-md border border-border bg-card/40 p-3">
                <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-info" /> Reference standards
            </CardTitle>
            <CardDescription>Used by the selection logic and shown in the recommendation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ReferenceBubble standard="API 600" note="Bolted-bonnet steel gate valves for petroleum / NG industries." />
            <ReferenceBubble standard="API 602" note="Compact steel gate, globe and check valves for sizes ≤ NPS 4." />
            <ReferenceBubble standard="API 6D" note="Pipeline ball, plug, gate and check valve specification." />
            <ReferenceBubble standard="API 607 / 6FA" note="Fire test for quarter-turn / soft-seated valves." />
            <ReferenceBubble standard="ASME B16.34" note="Pressure-temperature ratings for flanged, threaded, welded valves." />
            <ReferenceBubble standard="NACE MR0175" note="Materials for use in H₂S-containing environments (sour service)." />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <WarningBanner title="Decision-support tool only">
            All outputs are screening aids. Verify against project specs, latest standards, and a
            qualified piping engineer before issuing for procurement or fabrication.
          </WarningBanner>
        </div>
      </section>
    </div>
  );
}
