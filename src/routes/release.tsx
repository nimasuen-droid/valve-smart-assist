import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/release")({
  head: () => ({
    meta: [
      { title: "Release Notes — Valve Selection Guide" },
      { name: "description", content: "Version history and release notes for the Valve Selection Guide." },
    ],
  }),
  component: ReleasePage,
});

const RELEASES = [
  {
    version: "0.4.0",
    date: "2026-05-02",
    tag: "current",
    items: [
      "Mobile UX refactor: bottom navigation, full-screen wizard steps, top progress bar, fixed Back/Next action bar.",
      "Per-step validation with smooth transitions and auto-save.",
      "Settings page with About, Release notes, EULA, and User manual links.",
      "Site-wide engineering disclaimer footer.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-04-28",
    items: [
      "Optional valve body size override (defaults to line size) on the Sizing step.",
      "Reducer note + ΔP warning when valve size differs from line size.",
      "Report header now displays both line and valve size when overridden.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-04-25",
    items: [
      "Control valve sizing per IEC 60534-2-1 (liquid + gas/vapor).",
      "PASS / REVIEW / UNDERSIZED verdict against the recommended valve.",
      "Choked-flow detection and expansion-factor calculation.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-04-20",
    items: [
      "Initial release: API 615 selection engine, ASME B16.5 P-T validation.",
      "Wizard flow, recommendation report, datasheet export.",
      "Sample oil &amp; gas valve cases for quick exploration.",
    ],
  },
];



function ReleasePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Release Notes</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">What&rsquo;s new</h1>
        <p className="mt-1 text-sm text-muted-foreground">Version history of the Valve Selection Guide.</p>
      </div>

      {RELEASES.map((r) => (
        <Card key={r.version}>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <CardTitle className="text-base font-mono">v{r.version}</CardTitle>
            <span className="text-xs text-muted-foreground">{r.date}</span>
            {r.tag === "current" && (
              <Badge variant="outline" className="ml-auto border-success/40 bg-success/10 text-success">
                Current
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
              {r.items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
