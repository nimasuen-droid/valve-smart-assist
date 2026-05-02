import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "User Manual — Valve Selection Guide" },
      { name: "description", content: "How to use the Valve Selection Guide — wizard, sizing, report and exports." },
    ],
  }),
  component: ManualPage,
});

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-mono text-primary">{n}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-foreground/90">{children}</CardContent>
    </Card>
  );
}

function ManualPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">User Manual</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">How to use the Valve Selection Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A short walkthrough of the wizard, sizing calculator, recommendation report and exports.
        </p>
      </div>

      <Section n={1} title="Start a selection">
        <p>
          Open the <Link to="/wizard/project" className="text-primary underline">Selection wizard</Link> and
          fill in the project, line and tag identifiers. Use <em>Load Sample Data</em> to try a realistic
          oil &amp; gas case, or <em>Clear All Fields</em> to start fresh.
        </p>
      </Section>

      <Section n={2} title="Service Conditions">
        <p>
          Enter design pressure and temperature (always design, not operating). Service type and fluid
          phase drive material class, special-service flags, and ASME B16.5 P-T validation.
        </p>
      </Section>

      <Section n={3} title="Valve Function">
        <p>
          Pick the dominant function: isolation, throttling/control, check, blowdown, etc. This is the
          primary filter on candidate valve types per API 615 §6.
        </p>
      </Section>

      <Section n={4} title="Valve Type — review the recommendation">
        <p>
          The engine returns a recommended valve type with rationale and cited standards. Alternatives
          considered (and rejected) are shown so you can challenge the choice.
        </p>
      </Section>

      <Section n={5} title="Sizing (throttling only)">
        <p>
          For control duty, the <Link to="/wizard/sizing" className="text-primary underline">Sizing step</Link>
          runs an IEC 60534-2-1 Cv calculation. Enter flow, ΔP, inlet pressure and fluid properties.
        </p>
        <p>
          Optionally override the valve body size (default = line size) — common for control valves to keep
          the trim in the 20–80 % opening range. Reducer notes are flagged automatically.
        </p>
        <p>
          The verdict (PASS / REVIEW / UNDERSIZED) validates the recommended valve against typical full-open
          Cv at the chosen size.
        </p>
      </Section>

      <Section n={6} title="Materials, Ends &amp; Special Service">
        <p>
          Body, trim and seat materials are derived from service severity and temperature per ASME B16.34
          and NACE MR0175 where applicable. End connection and pressure class are validated against ASME
          B16.5 P-T tables. Tick all special-service flags (sour, cryo, fire-safe, fugitive) — each adds
          engineering cautions.
        </p>
      </Section>

      <Section n={7} title="Recommendation Report &amp; export">
        <p>
          The <Link to="/report" className="text-primary underline">Report</Link> page summarises the
          selected specification, sizing verdict, alternatives, rationale, ASME checks and warnings. Export
          to HTML, Excel or print-to-PDF; save the selection to revisit later from <Link to="/saved" className="text-primary underline">Saved selections</Link>.
        </p>
      </Section>

      <Section n={8} title="References &amp; settings">
        <p>
          The <Link to="/references" className="text-primary underline">Reference library</Link> lists every
          standard cited by the engine. Use <Link to="/settings" className="text-primary underline">Settings</Link>
          to clear data, view release notes, or read the EULA.
        </p>
      </Section>

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader><CardTitle className="text-base">Reminder</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          For engineering support only. Final design shall be reviewed and approved by a qualified piping
          engineer against the governing project codes, standards, client specifications, and latest
          approved revisions.
        </CardContent>
      </Card>
    </div>
  );
}
