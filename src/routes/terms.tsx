import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APP_GOVERNANCE,
  DATASET_GOVERNANCE_NOTICE,
  EXPORT_GOVERNANCE_NOTICE,
  STANDARDS_COPYRIGHT_NOTICE,
  TERMS_SUMMARY,
  USER_RESPONSIBILITY_NOTICE,
} from "@/lib/governance";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use - Valve Selection Guide" },
      {
        name: "description",
        content: "Terms of use and governance limitations for Valve Selection Guide.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Terms of Use</h1>
        <p className="mt-1 text-sm text-muted-foreground">{APP_GOVERNANCE.classification}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permitted use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>{TERMS_SUMMARY}</p>
          <p>{USER_RESPONSIBILITY_NOTICE}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standards and datasets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>{STANDARDS_COPYRIGHT_NOTICE}</p>
          <p>{DATASET_GOVERNANCE_NOTICE}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exports and issued documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>{EXPORT_GOVERNANCE_NOTICE}</p>
          <p>
            A generated report or datasheet is a draft engineering record until a qualified checker
            reviews the inputs, assumptions, standards basis, calculations, and project
            requirements.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Link to="/eula" className="rounded-md border border-border px-3 py-2 hover:bg-secondary">
            EULA
          </Link>
          <Link
            to="/privacy"
            className="rounded-md border border-border px-3 py-2 hover:bg-secondary"
          >
            Privacy Policy
          </Link>
          <Link
            to="/release"
            className="rounded-md border border-border px-3 py-2 hover:bg-secondary"
          >
            Release Info
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
