import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wifi,
  WifiOff,
  Shield,
  FileText,
  Mail,
  Database,
  Package,
  Scale,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAsmeDatasetStatus } from "@/lib/asmeB165Ratings";
import {
  APP_GOVERNANCE,
  PRODUCTION_GOVERNANCE_CHECKLIST,
  STANDARDS_COPYRIGHT_NOTICE,
  USER_RESPONSIBILITY_NOTICE,
  getDatasetUseLabel,
} from "@/lib/governance";

export const Route = createFileRoute("/release")({
  head: () => ({
    meta: [
      { title: "About & Release Info — Valve Selection Guide" },
      {
        name: "description",
        content:
          "Version, dataset, and release information for this build of the Valve Selection Guide.",
      },
    ],
  }),
  component: AboutReleasePage,
});

const APP_VERSION = APP_GOVERNANCE.appVersion;
const APP_BUILD_DATE = APP_GOVERNANCE.buildDate;
const DATASET_VERSION = "2026.04";
const DATASET_LAST_UPDATED = "2026-04-25";
const SUPPORT_EMAIL = APP_GOVERNANCE.supportEmail;

function useOnlineStatus() {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AboutReleasePage() {
  const online = useOnlineStatus();
  const asmeStatus = getAsmeDatasetStatus();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">About & Release</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          About &amp; Release Info
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Version, dataset, and release information for this build.
        </p>
      </div>

      <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground/90">
        <p className="font-semibold text-warning">{APP_GOVERNANCE.classification}</p>
        <p className="mt-1 text-xs">{USER_RESPONSIBILITY_NOTICE}</p>
      </div>

      <Section icon={Package} title="Application">
        <Row icon={Package} label="App version" value={APP_VERSION} />
        <Row icon={Package} label="Release ID" value={APP_GOVERNANCE.releaseId} />
        <Row icon={Shield} label="Readiness" value={APP_GOVERNANCE.defaultReadiness} />
        <Row icon={FileText} label="Build date" value={APP_BUILD_DATE} />
        <Row
          icon={online ? Wifi : WifiOff}
          label="Connection"
          value={
            <span className={online ? "text-success" : "text-accent-foreground"}>
              {online ? "Online" : "Offline (full functionality)"}
            </span>
          }
        />
      </Section>

      <Section icon={Database} title="Engineering Datasets">
        <Row icon={Database} label="Bundled dataset version" value={DATASET_VERSION} />
        <Row
          icon={Database}
          label="Active ASME table basis"
          value={
            asmeStatus.active
              ? `User-approved: ${asmeStatus.metadata.datasetVersion}`
              : "Bundled draft screening data"
          }
        />
        <Row
          icon={Shield}
          label="Dataset classification"
          value={getDatasetUseLabel(asmeStatus.metadata)}
        />
        <Row icon={Shield} label="Dataset owner" value={asmeStatus.metadata.owner} />
        <Row icon={Shield} label="Dataset reviewer" value={asmeStatus.metadata.reviewer} />
        <Row icon={FileText} label="Last updated" value={DATASET_LAST_UPDATED} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Includes API 615 (valve selection), ASME B16.5 (flange P-T ratings), ASME B16.34
          (pressure-temperature for valves), IEC 60534 (control valve sizing), and NACE MR0175
          reference data. All baseline datasets are available offline. Saved selections are stored
          on this device. User-supplied ASME table sets can be imported and approved in Settings;
          licensing and table accuracy remain the user&apos;s responsibility.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">{STANDARDS_COPYRIGHT_NOTICE}</p>
      </Section>

      <Section icon={Shield} title="Production readiness gate">
        <p className="mb-3 text-xs text-muted-foreground">
          The default status is Screening Only. Production Ready is not available until every
          governance item below is approved and recorded.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
          {PRODUCTION_GOVERNANCE_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section icon={Sparkles} title="What's in this release">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
          <li>
            Mobile UX refactor: bottom navigation, full-screen wizard steps, fixed Back/Next bar.
          </li>
          <li>Conditional Sizing step — only appears for Throttling / Control function.</li>
          <li>Per-step validation, auto-save, learning moments throughout the wizard.</li>
          <li>Control valve sizing per IEC 60534-2-1 with PASS / REVIEW / UNDERSIZED verdict.</li>
          <li>API 615 selection engine, ASME B16.5 P-T validation, datasheet export.</li>
        </ul>
      </Section>

      <Section icon={Shield} title="Privacy">
        <p className="text-xs text-muted-foreground">
          This application stores your selection inputs and saved cases locally in your browser. No
          engineering data is transmitted unless you explicitly sign in to enable cloud sync.
          Reference tables and calculations execute entirely on-device.
        </p>
        <p className="mt-2 text-[11px] italic text-muted-foreground">
          A full privacy policy will be published with the production release.
        </p>
      </Section>

      <Section icon={FileText} title="Terms & Disclaimer">
        <p className="text-xs text-muted-foreground">
          This software is provided for engineering screening and educational support only. Outputs
          are not a substitute for review by a qualified piping engineer, nor for compliance
          verification against the latest approved revisions of project codes, client
          specifications, and governing standards (including API 615, ASME B16.5, and ASME B16.34).
          The authors and contributors disclaim all liability arising from use of this tool.
        </p>
      </Section>

      <Section icon={Scale} title="End User License Agreement">
        <p className="mb-2 text-xs text-muted-foreground">
          The full EULA governs your use of this application, including disclaimers, limitation of
          liability, and data-storage responsibilities.
        </p>
        <Link
          to="/eula"
          className="inline-flex items-center rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50"
        >
          View EULA
        </Link>
      </Section>

      <Section icon={Mail} title="Support">
        <p className="text-xs text-muted-foreground">
          For questions, defect reports, or dataset update requests, contact{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <p className="pt-2 text-center text-[10px] text-muted-foreground">
        Valve Selection Guide · by Nosa Imasuen
      </p>
    </div>
  );
}
