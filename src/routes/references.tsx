import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GovernanceBanner } from "@/components/GovernanceNotice";
import { STANDARDS_COPYRIGHT_NOTICE } from "@/lib/governance";
import { BookOpen, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/references")({
  head: () => ({ meta: [{ title: "Reference Library — Valve Selection Guide" }] }),
  component: References,
});

const refs = [
  {
    code: "ASME B16.34",
    title: "Valves — Flanged, Threaded and Welding End",
    scope: "Pressure-temperature ratings, materials, dimensions, testing.",
  },
  {
    code: "ASME B16.5",
    title: "Pipe Flanges and Flanged Fittings (NPS ½ – 24)",
    scope: "Flange dimensions, materials, P-T ratings up to CL2500.",
  },
  {
    code: "ASME B16.10",
    title: "Face-to-Face / End-to-End Dimensions of Valves",
    scope: "Standard valve length envelopes for piping layout.",
  },
  {
    code: "API 600",
    title: "Steel Gate Valves — Flanged & Butt-Welding Ends, Bolted Bonnets",
    scope: "Heavy-duty gate valves for petroleum & natural-gas industries.",
  },
  {
    code: "API 602",
    title: "Compact Steel Gate, Globe and Check Valves",
    scope: "Small-bore valves ≤ NPS 4 in process plants.",
  },
  {
    code: "API 6D",
    title: "Pipeline and Piping Valves",
    scope: "Ball, plug, gate and check valves for pipeline service.",
  },
  {
    code: "API 607 / ISO 10497",
    title: "Fire Test for Quarter-Turn Valves",
    scope: "Soft-seated valve fire-safe certification.",
  },
  {
    code: "API 6FA",
    title: "Fire Test for Valves",
    scope: "Fire-safe testing for API 6A / 6D valves.",
  },
  {
    code: "API 598",
    title: "Valve Inspection and Testing",
    scope: "Hydrostatic shell & seat tests, leakage allowances.",
  },
  {
    code: "FCI 70-2 / IEC 60534-4",
    title: "Control Valve Seat Leakage",
    scope: "Class I–VI shut-off classification for control valves.",
  },
  {
    code: "NACE MR0175 / ISO 15156",
    title: "Materials for Sour Service",
    scope: "Hardness, alloy and processing limits for H₂S service.",
  },
  {
    code: "API 941",
    title: "Steels for Hydrogen Service at Elevated Temperature & Pressure",
    scope: "Nelson curves; HIC / SSC mitigation for hydrogen service.",
  },
  {
    code: "ASME B31.3",
    title: "Process Piping",
    scope: "Design, materials, fabrication, inspection of process piping.",
  },
  {
    code: "BS 6364",
    title: "Specification for Valves for Cryogenic Service",
    scope: "Test & material requirements for cryogenic isolation.",
  },
];

function References() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Knowledge</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Reference Library
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Standards, codes and recommended practices used by the selection logic. Always cross-check
          against your project specification and the latest published revision.
        </p>
      </div>

      <GovernanceBanner compact />

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 text-sm text-foreground/90">
          {STANDARDS_COPYRIGHT_NOTICE}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {refs.map((r) => (
          <Card key={r.code} className="transition-colors hover:border-primary/40">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-info/40 bg-info/10 font-mono text-info">
                  {r.code}
                </Badge>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm leading-snug">{r.title}</CardTitle>
              <CardDescription className="text-xs">{r.scope}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3" /> Verify latest edition
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
