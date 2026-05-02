import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard, ReferenceBubble } from "@/components/InfoCards";
import { useSelection } from "@/lib/SelectionContext";
import { pickRandomSample } from "@/lib/sampleCases";
import {
  PIPE_SIZES,
  PRESSURE_CLASSES,
  INSTALLATION_LOCATIONS,
  VALVE_FUNCTIONS,
} from "@/lib/valveSelectionEngine";
import { Sparkles, Eraser } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wizard/project")({
  head: () => ({ meta: [{ title: "Project / Line Data — Valve Selection Guide" }] }),
  component: ProjectStep,
});

function ProjectStep() {
  const { input, update, reset } = useSelection();

  const clearAll = () => {
    if (!hasUserData && !input.isSample) return;
    if (!window.confirm("Clear all project and service condition inputs?")) return;
    reset();
    toast.success("All fields cleared.");
  };

  const hasUserData = !!(
    input.projectName || input.tagNumber || input.lineNumber || input.clientName ||
    input.areaUnit || input.notes || input.operatingPressure || input.operatingTemp
  );

  const loadSample = () => {
    if (hasUserData && !input.isSample) {
      const ok = window.confirm(
        "This will replace the current line and service condition inputs with sample data. Continue?",
      );
      if (!ok) return;
    }
    const s = pickRandomSample(input.sampleTitle);
    update({
      projectName: s.projectName,
      tagNumber: s.tagNumber,
      serviceType: s.serviceType,
      fluidType: s.fluidType,
      valveFunction: s.valveFunction,
      pipeSize: s.pipeSize,
      pressureClass: s.pressureClass,
      designTemp: s.designTemp,
      designPressure: s.designPressure,
      installationLocation: s.installationLocation,
      additionalRequirements: s.additionalRequirements,
      clientName: s.clientName,
      areaUnit: s.areaUnit,
      lineNumber: s.lineNumber,
      lineClass: s.lineClass,
      operatingPressure: s.operatingPressure,
      operatingTemp: s.operatingTemp,
      flowCondition: s.flowCondition,
      notes: s.notes,
      isSample: true,
      sampleTitle: s.caseTitle,
    });
    toast.success("Sample valve case loaded.", { description: s.caseTitle });
  };

  // editing any field clears the sample flag
  const u = (patch: Partial<typeof input>) =>
    update({ ...patch, isSample: false, sampleTitle: undefined });

  return (
    <StepShell
      step="/wizard/project"
      title="Project & Line Data"
      subtitle="Identify the project, line, and valve tag. These travel into the recommendation report and datasheet header."
      aside={
        <>
          <GuidanceCard title="Why we ask">
            Project and tag traceability is required on every engineering deliverable. The tag number drives
            the datasheet number on export.
          </GuidanceCard>
          <ReferenceBubble standard="API 615" note="Recommended practice for valve selection in process plants." />
          <ReferenceBubble standard="ASME B31.3" note="Process piping — design pressure, temperature & material basis." />
        </>
      }
    >
      {/* Sample data loader */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card/40 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Try with realistic sample data</p>
            <p className="text-xs text-muted-foreground">
              Loads one of 12 oil &amp; gas valve cases into all inputs.
            </p>
          </div>
          {input.isSample && (
            <Badge variant="outline" className="ml-2 border-primary/40 bg-primary/10 text-primary">
              Sample Data{input.sampleTitle ? ` · ${input.sampleTitle}` : ""}
            </Badge>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={loadSample}>
          <Sparkles className="h-4 w-4" /> Load Sample Data
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Project name" helper="Free-text identifier shown on the datasheet cover.">
          <Input value={input.projectName} onChange={(e) => u({ projectName: e.target.value })} placeholder="e.g. North Sea Compression Upgrade" />
        </HelperField>
        <HelperField label="Client name" helper="End client / operator on the title block.">
          <Input value={input.clientName ?? ""} onChange={(e) => u({ clientName: e.target.value })} placeholder="e.g. NorthOil A/S" />
        </HelperField>
        <HelperField label="Area / Unit" helper="Process area or unit reference.">
          <Input value={input.areaUnit ?? ""} onChange={(e) => u({ areaUnit: e.target.value })} placeholder="e.g. Unit 200 — HP Compression" />
        </HelperField>
        <HelperField label="Line number" helper="Per piping line list / P&ID." reference="P&ID">
          <Input value={input.lineNumber ?? ""} onChange={(e) => u({ lineNumber: e.target.value })} placeholder='e.g. 8"-PG-201-A1A' />
        </HelperField>
        <HelperField label="Valve tag number" helper="Unique tag per P&ID — appears as DS-{tag} on export." reference="P&ID">
          <Input value={input.tagNumber} onChange={(e) => u({ tagNumber: e.target.value })} placeholder="e.g. XV-1042" />
        </HelperField>
        <HelperField label="Line class" helper="Piping line class spec.">
          <Input value={input.lineClass ?? ""} onChange={(e) => u({ lineClass: e.target.value })} placeholder="e.g. A1A — CS, Class 600" />
        </HelperField>

        <HelperField label="Pipe size (NPS)" helper="Nominal pipe size of the line.">
          <Select value={input.pipeSize} onValueChange={(v) => u({ pipeSize: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PIPE_SIZES.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </HelperField>

        <HelperField label="Pressure class" helper="ASME pressure class.">
          <Select value={input.pressureClass} onValueChange={(v) => u({ pressureClass: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRESSURE_CLASSES.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </HelperField>

        <HelperField label="Installation location" helper="Drives material & coating recommendations.">
          <Select value={input.installationLocation} onValueChange={(v) => u({ installationLocation: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INSTALLATION_LOCATIONS.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </HelperField>

        <HelperField label="Valve function" helper="What the valve must do in service.">
          <Select value={input.valveFunction} onValueChange={(v) => u({ valveFunction: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VALVE_FUNCTIONS.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
