import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GuidanceCard, ReferenceBubble } from "@/components/InfoCards";

export const Route = createFileRoute("/wizard/project")({
  head: () => ({ meta: [{ title: "Project / Line Data — Valve Selection Guide" }] }),
  component: ProjectStep,
});

function ProjectStep() {
  return (
    <StepShell
      step="/wizard/project"
      title="Project & Line Data"
      subtitle="Identify the project, line and design basis. These travel into the recommendation report header."
      aside={
        <>
          <GuidanceCard title="Why we ask">
            Project & line tag traceability is required for any engineering deliverable. The line
            number drives line-class lookup in your project piping spec.
          </GuidanceCard>
          <ReferenceBubble standard="ASME B31.3" note="Process piping — defines design pressure, temperature and material basis." />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Project name" helper="Free-text identifier shown on the report cover.">
          <Input placeholder="e.g. North Sea Compression Upgrade" />
        </HelperField>
        <HelperField label="Project number" helper="Internal job / WBS number for traceability.">
          <Input placeholder="e.g. JN-20458" />
        </HelperField>
        <HelperField label="Line number / tag" helper="Per piping & instrumentation diagram (P&ID)." reference="P&ID">
          <Input placeholder="e.g. 12&quot;-PG-1042-A1A-IH" />
        </HelperField>
        <HelperField label="Line class" helper="From your project piping material specification (e.g. A1A, B1B).">
          <Input placeholder="e.g. A1A" />
        </HelperField>
        <HelperField label="Plant area / unit" helper="Area code or process unit owning the valve.">
          <Input placeholder="e.g. Unit 200 — Compression" />
        </HelperField>
        <HelperField label="Design code" helper="Governing piping design code for the line." reference="B31.3">
          <Select defaultValue="b313">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="b313">ASME B31.3 — Process Piping</SelectItem>
              <SelectItem value="b311">ASME B31.1 — Power Piping</SelectItem>
              <SelectItem value="b314">ASME B31.4 — Liquid Pipelines</SelectItem>
              <SelectItem value="b318">ASME B31.8 — Gas Pipelines</SelectItem>
            </SelectContent>
          </Select>
        </HelperField>
      </div>
    </StepShell>
  );
}
