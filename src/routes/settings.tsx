import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DesktopInstallPrompt } from "@/components/DesktopInstallPrompt";
import { GovernanceBanner, ReadinessBadge } from "@/components/GovernanceNotice";
import {
  CheckCircle2,
  Database,
  Eraser,
  RotateCcw,
  BookOpen,
  Save,
  Info,
  Sparkles,
  FileText,
  Scale,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { useSelection } from "@/lib/SelectionContext";
import {
  exportSelectionSnapshot,
  importSelectionSnapshot,
  listSavedSelections,
} from "@/lib/selectionState";
import {
  approveUserAsmeDataset,
  buildAsmeTableTemplate,
  clearUserAsmeDataset,
  getAsmeDatasetStatus,
  importUserAsmeDataset,
} from "@/lib/asmeB165Ratings";
import { APP_GOVERNANCE, PRODUCTION_GOVERNANCE_CHECKLIST } from "@/lib/governance";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Valve Selection Guide" }] }),
  component: SettingsPage,
});

const APP_VERSION = APP_GOVERNANCE.appVersion;
const MAX_ASME_IMPORT_BYTES = 750_000;

function SettingsPage() {
  const { input, reset } = useSelection();
  const importRef = useRef<HTMLInputElement>(null);
  const asmeImportRef = useRef<HTMLInputElement>(null);
  const [asmeStatus, setAsmeStatus] = useState(() => getAsmeDatasetStatus());

  const clearAll = () => {
    reset();
    toast.success("All selection data cleared.");
  };

  const downloadSnapshot = () => {
    const snapshot = exportSelectionSnapshot(input, listSavedSelections());
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valve-selection-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSnapshot = async (file: File | undefined) => {
    if (!file) return;
    try {
      const snapshot = JSON.parse(await file.text());
      importSelectionSnapshot(snapshot);
      toast.success("Selection snapshot imported. Reloading current selection.");
      window.location.reload();
    } catch (error) {
      toast.error("Could not import selection snapshot", {
        description: error instanceof Error ? error.message : "Invalid JSON file.",
      });
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const downloadAsmeTemplate = () => {
    const template = buildAsmeTableTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asme-rating-table-template-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAsmeDataset = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_ASME_IMPORT_BYTES) {
        toast.error("ASME table import failed", {
          description: `File must be ${MAX_ASME_IMPORT_BYTES} bytes or smaller.`,
        });
        return;
      }
      const validation = importUserAsmeDataset(JSON.parse(await file.text()));
      if (!validation.ok) {
        toast.error("ASME table import failed", {
          description: validation.issues.slice(0, 3).join(" "),
        });
        return;
      }
      setAsmeStatus(getAsmeDatasetStatus());
      toast.success("ASME table set loaded for approval.");
    } catch (error) {
      toast.error("Could not import ASME table set", {
        description: error instanceof Error ? error.message : "Invalid JSON file.",
      });
    } finally {
      if (asmeImportRef.current) asmeImportRef.current.value = "";
    }
  };

  const approveAsmeDataset = () => {
    const approvedBy = window.prompt("Approver name / responsible engineer");
    if (!approvedBy?.trim()) return;
    const approvalBasis = window.prompt(
      "Approval basis, e.g. licensed ASME edition, company standard, checker reference",
    );
    if (!approvalBasis?.trim()) {
      toast.error("Approval basis is required", {
        description:
          "Record the licensed standard edition, company standard, or checker reference.",
      });
      return;
    }
    const validation = approveUserAsmeDataset({ approvedBy, approvalBasis });
    if (!validation.ok) {
      toast.error("ASME table approval failed", {
        description: validation.issues.slice(0, 3).join(" "),
      });
      return;
    }
    setAsmeStatus(getAsmeDatasetStatus());
    toast.success("User-approved ASME table set is now active.");
  };

  const removeAsmeDataset = () => {
    clearUserAsmeDataset();
    setAsmeStatus(getAsmeDatasetStatus());
    toast.success("User ASME table set removed. Draft bundled data is active.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your selection data and shortcuts.
        </p>
      </div>

      <GovernanceBanner compact />

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Production readiness control
            <ReadinessBadge />
          </CardTitle>
          <CardDescription>
            Production Ready is locked until governance evidence is completed and approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{APP_GOVERNANCE.classification}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {PRODUCTION_GOVERNANCE_CHECKLIST.map((item) => (
              <li key={item}>Pending: {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desktop installer</CardTitle>
          <CardDescription>
            Add the app to this computer for offline access and a dedicated window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesktopInstallPrompt />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selection data</CardTitle>
          <CardDescription>Your inputs are auto-saved on this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/wizard/project">
              <RotateCcw className="h-4 w-4" /> Resume current selection
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/saved">
              <Save className="h-4 w-4" /> View saved selections
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-base"
            onClick={downloadSnapshot}
          >
            <FileText className="h-4 w-4" /> Export selection snapshot
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => importSnapshot(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-base"
            onClick={() => importRef.current?.click()}
          >
            <FileText className="h-4 w-4" /> Import selection snapshot
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/references">
              <BookOpen className="h-4 w-4" /> Reference library
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="h-12 w-full justify-start text-base"
            onClick={clearAll}
          >
            <Eraser className="h-4 w-4" /> Clear all fields
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ASME rating tables</CardTitle>
          <CardDescription>
            The bundled ASME data is draft screening data. Import and approve your own licensed
            table set to make it the active calculation basis on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-start gap-2">
              <Database className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">
                  {asmeStatus.active
                    ? "User-approved ASME tables active"
                    : "Bundled draft tables active"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dataset: {asmeStatus.metadata.datasetVersion || asmeStatus.metadata.datasetId} ·{" "}
                  {asmeStatus.metadata.verificationStatusLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Groups: {asmeStatus.groupCount}. Licensing and table accuracy are the user&apos;s
                  responsibility when a user dataset is approved.
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-base"
            onClick={downloadAsmeTemplate}
          >
            <FileText className="h-4 w-4" /> Download ASME table template
          </Button>
          <input
            ref={asmeImportRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => importAsmeDataset(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-base"
            onClick={() => asmeImportRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Import ASME table set
          </Button>
          <Button
            variant={asmeStatus.mode === "pending" ? "default" : "outline"}
            className="h-12 w-full justify-start text-base"
            disabled={asmeStatus.mode !== "pending"}
            onClick={approveAsmeDataset}
          >
            <CheckCircle2 className="h-4 w-4" /> Approve imported table set
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-base"
            disabled={asmeStatus.mode === "bundled-draft"}
            onClick={removeAsmeDataset}
          >
            <Eraser className="h-4 w-4" /> Remove user ASME tables
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Help &amp; information</CardTitle>
          <CardDescription>Manual, release notes, and legal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/manual">
              <FileText className="h-4 w-4" /> User manual
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/about">
              <Info className="h-4 w-4" /> About
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/release">
              <Sparkles className="h-4 w-4" /> Release notes
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/terms">
              <ShieldCheck className="h-4 w-4" /> Terms of Use
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/eula">
              <Scale className="h-4 w-4" /> End User License Agreement
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/privacy">
              <ShieldCheck className="h-4 w-4" /> Privacy Policy
            </Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Valve Selection Guide · v{APP_VERSION}
      </p>
    </div>
  );
}
