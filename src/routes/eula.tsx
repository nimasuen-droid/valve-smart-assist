import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "EULA — Valve Selection Guide" },
      { name: "description", content: "End User License Agreement for the Valve Selection Guide." },
    ],
  }),
  component: EulaPage,
});

function EulaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">End User License Agreement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          By using the Valve Selection Guide (&ldquo;the Software&rdquo;) you agree to the terms below.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">1. License grant</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          You are granted a non-exclusive, non-transferable, revocable license to use the Software for
          internal engineering decision-support purposes. You may not resell, sublicense, or redistribute
          the Software or its outputs as a standalone commercial product.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">2. Engineering use &amp; responsibility</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/90">
          <p>
            The Software is a <strong>decision-support tool</strong>. Recommendations are generated from
            published industry standards and engineering heuristics, but the Software does not replace
            qualified engineering judgement.
          </p>
          <p>
            All outputs are screening aids. Verify against project specs, latest standards, and a
            qualified piping engineer before issuing for procurement or fabrication.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">3. No warranty</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT. The authors do not warrant that the Software is free of errors
          or that its results meet any specific code or specification.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">4. Limitation of liability</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          IN NO EVENT SHALL THE AUTHORS, CONTRIBUTORS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH
          THE USE OF, OR INABILITY TO USE, THE SOFTWARE — INCLUDING BUT NOT LIMITED TO LOSS OF DATA,
          PRODUCTION DOWNTIME, OR ENGINEERING REWORK.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">5. Data &amp; privacy</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          Selection inputs are stored locally in your browser. No project data is transmitted to a server
          unless you explicitly export or share it.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">6. Standards &amp; trademarks</CardTitle></CardHeader>
        <CardContent className="text-sm text-foreground/90">
          References to API, ASME, IEC, ISA, NACE, ISO and other standards are made under fair use for
          engineering education and decision support. All trademarks are property of their respective
          owners. The Software does not reproduce the standards themselves; users are expected to consult
          the latest approved revisions of the cited documents.
        </CardContent>
      </Card>
    </div>
  );
}
