import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Valve Selection Guide" },
      { name: "description", content: "About the Valve Selection Guide engineering decision-support tool." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">About</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">About this tool</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering decision-support for manual & control valve selection in process piping applications.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Purpose</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>
            The Valve Selection Guide helps process and piping engineers converge quickly on a defensible
            valve specification — body, trim, seat, end-connection, rating and special service requirements
            — using the rules in API 615, ASME B16.5 / B16.34 and supporting standards.
          </p>
          <p>
            All recommendations are derived live from your inputs. Every rule cites the standard or
            engineering basis behind it so the choice can be reviewed and challenged.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">What it covers</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
            <li>Valve type selection by service, function, size and class</li>
            <li>Body / trim / seat material selection per ASME B16.34 &amp; NACE MR0175</li>
            <li>End-connection &amp; rating with ASME B16.5 P-T validation</li>
            <li>Control valve sizing per IEC 60534-2-1 (liquid &amp; gas)</li>
            <li>Special-service checks: sour, cryogenic, fire-safe, fugitive emissions</li>
            <li>Datasheet export (HTML, Excel, print-to-PDF)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Standards referenced</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-foreground/80 md:grid-cols-3">
            <li>API 615</li><li>API 598</li><li>API 607 / 6FA</li>
            <li>API 609</li><li>API 600 / 602 / 603</li><li>API 6D</li>
            <li>ASME B16.5</li><li>ASME B16.34</li><li>ASME B31.3</li>
            <li>IEC 60534</li><li>ISA 75.01</li><li>NACE MR0175 / ISO 15156</li>
            <li>ISO 15848-1</li><li>EN 12266</li><li>MSS SP-25 / SP-44</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Disclaimer</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          <p className="font-semibold">Decision-support tool only</p>
          <p className="mt-1">
            All outputs are screening aids. Verify against project specs, latest standards, and a
            qualified piping engineer before issuing for procurement or fabrication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
