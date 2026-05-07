import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText } from "lucide-react";
import { listSavedSelections, deleteSavedSelection } from "@/lib/selectionState";
import { useSelection, type SelectionInput } from "@/lib/SelectionContext";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved Selections — Valve Selection Guide" }] }),
  component: SavedPage,
});

interface Saved {
  id: string;
  savedAt: string;
  input: {
    projectName: string;
    tagNumber: string;
    serviceType: string;
    pipeSize: string;
    pressureClass: string;
    valveFunction: string;
  } & Partial<SelectionInput>;
  result: { valveType: string; valveSubtype: string };
  issueStatus?: string;
}

function SavedPage() {
  const { update } = useSelection();
  const [items, setItems] = useState<Saved[]>([]);
  useEffect(() => {
    setItems(listSavedSelections());
  }, []);

  const remove = (id: string) => {
    deleteSavedSelection(id);
    setItems(listSavedSelections());
  };

  const restore = (saved: Saved) => {
    update(saved.input);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Output</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Saved Selections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Locally-stored valve selections from this browser.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No saved selections yet. Generate a recommendation and click{" "}
            <strong className="text-foreground">Save</strong>.
            <div className="mt-4">
              <Button asChild size="sm">
                <Link to="/wizard/project">Start a selection</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {s.input.projectName || "(untitled project)"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {s.id} · Tag {s.input.tagNumber || "—"} · saved{" "}
                    {new Date(s.savedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/report" onClick={() => restore(s)}>
                      <FileText className="h-4 w-4" /> Open
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="font-mono">
                  {s.input.pipeSize} · {s.input.pressureClass}
                </Badge>
                <Badge variant="outline">{s.input.valveFunction}</Badge>
                <Badge variant="outline">{s.input.serviceType}</Badge>
                {s.issueStatus && <Badge variant="outline">{s.issueStatus}</Badge>}
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">
                  {s.result.valveType} {s.result.valveSubtype && `(${s.result.valveSubtype})`}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
