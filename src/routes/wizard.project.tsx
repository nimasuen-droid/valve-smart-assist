import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Input } from "@/components/ui/input";
import { GuidanceCard, ReferenceBubble } from "@/components/InfoCards";
import { useSelection } from "@/lib/SelectionContext";

export const Route = createFileRoute("/wizard/project")({
  head: () => ({ meta: [{ title: "Project / Line Data — Valve Selection Guide" }] }),
  component: ProjectStep,
});

function ProjectStep() {
  const { input, update } = useSelection();
  return (
    <StepShell
      step="/wizard/project"
      title="Project & Line Data"
      subtitle="Identify the project and valve tag. These travel into the recommendation report and datasheet header."
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
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Project name" helper="Free-text identifier shown on the datasheet cover.">
          <Input
            value={input.projectName}
            onChange={(e) => update({ projectName: e.target.value })}
            placeholder="e.g. North Sea Compression Upgrade"
          />
        </HelperField>
        <HelperField label="Valve tag number" helper="Unique tag per P&ID — appears as DS-{tag} on export." reference="P&ID">
          <Input
            value={input.tagNumber}
            onChange={(e) => update({ tagNumber: e.target.value })}
            placeholder="e.g. XV-1042"
          />
        </HelperField>
      </div>
    </StepShell>
  );
}
