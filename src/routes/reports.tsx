import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Archive, Download, Eye, FileText, Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteSavedReport, listSavedReports } from "@/lib/selectionState";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Report Library - Valve Selection Guide" }] }),
  component: ReportsPage,
});

interface StoredReport {
  id: string;
  savedAt: string;
  title?: string;
  reportType?: string;
  projectName?: string;
  tagNumber?: string;
  serviceType?: string;
  valveType?: string;
  status?: string;
  generatedAt?: string;
  html: string;
}

function openReport(html: string, print = false) {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.opener = null;
  w.document.write(html);
  w.document.close();
  if (print) setTimeout(() => w.print(), 400);
}

function downloadReport(report: StoredReport) {
  const blob = new Blob([report.html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const tag = (report.tagNumber || report.id || "report").replace(/[^A-Za-z0-9._-]+/g, "-");
  a.href = url;
  a.download = `${report.reportType || "Report"}_${tag}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const [reports, setReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    setReports(listSavedReports());
  }, []);

  const remove = (id: string) => {
    deleteSavedReport(id);
    setReports(listSavedReports());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Output</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Report Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Offline report storage for this browser. The newest 5 reports are retained.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/report">
            <Plus className="h-4 w-4" /> Generate report
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Archive className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No reports stored yet. Generate a recommendation, then choose Store Report.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/wizard/project">Start a selection</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {reports.map((report, index) => (
            <Card key={report.id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    {report.title || "Selection Review Report"}
                    {index === 0 && <Badge variant="outline">Newest</Badge>}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    {report.id} · Tag {report.tagNumber || "—"} · saved{" "}
                    {new Date(report.savedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{report.status || "Draft"}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{report.projectName || "Untitled project"}</Badge>
                  {report.serviceType && <Badge variant="outline">{report.serviceType}</Badge>}
                  {report.valveType && <Badge variant="outline">{report.valveType}</Badge>}
                  <Badge variant="outline">{report.reportType || "SELECTION_REVIEW"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openReport(report.html)}>
                    <Eye className="h-4 w-4" /> Open
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openReport(report.html, true)}>
                    <Printer className="h-4 w-4" /> Print / PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(report.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
