import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GovernanceCard } from "@/components/GovernanceNotice";
import {
  APP_GOVERNANCE,
  DATASET_GOVERNANCE_NOTICE,
  STANDARDS_COPYRIGHT_NOTICE,
  USER_RESPONSIBILITY_NOTICE,
} from "@/lib/governance";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Valve Selection Guide" },
      {
        name: "description",
        content: "About the Valve Selection Guide engineering decision-support tool.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const accountabilityRows = [
    ["App owner", APP_GOVERNANCE.owner],
    ["Application maintainer", APP_GOVERNANCE.maintainer],
    ["Support contact", APP_GOVERNANCE.supportEmail],
    ["Engineering authority", APP_GOVERNANCE.engineeringAuthority],
    ["Standards data steward", APP_GOVERNANCE.dataSteward],
    ["Independent checker", APP_GOVERNANCE.independentChecker],
    ["Legal / license owner", APP_GOVERNANCE.legalOwner],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">About</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">About this tool</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Engineering decision-support for manual & control valve selection in process piping
          applications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purpose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>
            The Valve Selection Guide helps process and piping engineers converge quickly on a
            defensible valve specification — body, trim, seat, end-connection, rating and special
            service requirements — using the rules in API 615, ASME B16.5 / B16.34 and supporting
            standards.
          </p>
          <p>
            All recommendations are derived live from your inputs. Every rule cites the standard or
            engineering basis behind it so the choice can be reviewed and challenged.
          </p>
        </CardContent>
      </Card>

      <GovernanceCard />

      <Card className="border-warning/40 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-base">Production readiness status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p className="font-semibold text-warning">Not production-approved yet</p>
          <p>
            This build is suitable for screening and internal engineering review. It must not be
            used as final authority for procurement, fabrication, construction, or safety decisions
            until engineering data, recommendations, exports, and accountability roles are reviewed
            and signed off.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ownership &amp; accountability</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border text-sm">
            {accountabilityRows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2 sm:grid-cols-[190px_1fr]">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Production release requires a named responsible engineer, data steward, maintainer,
            support path, legal/license owner, and independent checker. User-supplied ASME tables
            remain the responsibility of the organization that imports and approves them.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standards &amp; copyright position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>{STANDARDS_COPYRIGHT_NOTICE}</p>
          <p>{DATASET_GOVERNANCE_NOTICE}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What it covers</CardTitle>
        </CardHeader>
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
        <CardHeader>
          <CardTitle className="text-base">Standards referenced</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-foreground/80 md:grid-cols-3">
            <li>API 615</li>
            <li>API 598</li>
            <li>API 607 / 6FA</li>
            <li>API 609</li>
            <li>API 600 / 602 / 603</li>
            <li>API 6D</li>
            <li>ASME B16.5</li>
            <li>ASME B16.34</li>
            <li>ASME B31.3</li>
            <li>IEC 60534</li>
            <li>ISA 75.01</li>
            <li>NACE MR0175 / ISO 15156</li>
            <li>ISO 15848-1</li>
            <li>EN 12266</li>
            <li>MSS SP-25 / SP-44</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90">
          <p className="font-semibold">Decision-support tool only</p>
          <p className="mt-1">{USER_RESPONSIBILITY_NOTICE}</p>
        </CardContent>
      </Card>
    </div>
  );
}
