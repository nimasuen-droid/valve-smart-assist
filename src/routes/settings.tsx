import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eraser, RotateCcw, BookOpen, Save, Info, Sparkles, FileText, Scale } from "lucide-react";
import { useSelection } from "@/lib/SelectionContext";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Valve Selection Guide" }] }),
  component: SettingsPage,
});

const APP_VERSION = "0.4.0";

function SettingsPage() {
  const { reset } = useSelection();

  const clearAll = () => {
    reset();
    toast.success("All selection data cleared.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your selection data and shortcuts.</p>
      </div>

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
          <Button asChild variant="outline" className="h-12 w-full justify-start text-base">
            <Link to="/references">
              <BookOpen className="h-4 w-4" /> Reference library
            </Link>
          </Button>
          <Button variant="destructive" className="h-12 w-full justify-start text-base" onClick={clearAll}>
            <Eraser className="h-4 w-4" /> Clear all fields
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
            <Link to="/eula">
              <Scale className="h-4 w-4" /> End User License Agreement
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
