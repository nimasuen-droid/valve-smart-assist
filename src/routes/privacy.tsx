import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_GOVERNANCE, PRIVACY_PLACEHOLDER } from "@/lib/governance";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Valve Selection Guide" },
      {
        name: "description",
        content: "Privacy policy placeholder for Valve Selection Guide.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Placeholder policy for the current local/offline screening release.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current data handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>{PRIVACY_PLACEHOLDER}</p>
          <p>
            Current saved selections, imported ASME datasets, and snapshots are held in browser
            storage on this device. Users are responsible for protecting confidential project data
            exported from the app.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production requirement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/90">
          <p>
            Hosted, shared, or cloud-synced production use requires a formal privacy policy,
            security review, data-retention rules, backup/restore procedure, access controls, and
            support ownership.
          </p>
          <p className="text-xs text-muted-foreground">
            Support contact: {APP_GOVERNANCE.supportEmail}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
