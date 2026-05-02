import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WarningBanner, ReferenceBubble, WhyCard } from "@/components/InfoCards";
import { useSelection } from "@/lib/SelectionContext";
import { useSelectionResult } from "@/lib/useSelectionResult";
// @ts-expect-error JS module
import { ADDITIONAL_REQUIREMENTS } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/special")({
  head: () => ({ meta: [{ title: "Special Service Checks — Valve Selection Guide" }] }),
  component: SpecialStep,
});

function SpecialStep() {
  const { input, update } = useSelection();
  const { result } = useSelectionResult();

  const toggle = (req: string, checked: boolean) => {
    const set = new Set(input.additionalRequirements);
    if (checked) set.add(req); else set.delete(req);
    update({ additionalRequirements: Array.from(set) });
  };

  return (
    <StepShell
      step="/wizard/special"
      title="Special Service Checks"
      subtitle="Tick everything that applies. Each flag adds engineering cautions and may overwrite earlier defaults."
      aside={
        <>
          {result.rationale.requirements && (
            <WhyCard>{result.rationale.requirements.reason}</WhyCard>
          )}
          {result.warnings.slice(0, 4).map((w, i) => (
            <WarningBanner key={i} title="Engineering caution">{w}</WarningBanner>
          ))}
          <ReferenceBubble standard="API 615" note="Special service & installation guidance." />
        </>
      }
    >
      <HelperField label="Additional requirements" helper="Check all that apply for this valve.">
        <div className="grid gap-2 md:grid-cols-2">
          {(ADDITIONAL_REQUIREMENTS as string[]).map((req) => {
            const checked = input.additionalRequirements.includes(req);
            return (
              <Label
                key={req}
                htmlFor={req}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40"
              >
                <Checkbox
                  id={req}
                  checked={checked}
                  onCheckedChange={(c) => toggle(req, !!c)}
                  className="mt-0.5"
                />
                <p className="text-sm font-medium">{req}</p>
              </Label>
            );
          })}
        </div>
      </HelperField>
    </StepShell>
  );
}
