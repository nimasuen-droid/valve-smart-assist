import { createFileRoute } from "@tanstack/react-router";
import { StepShell } from "@/components/StepShell";
import { HelperField } from "@/components/HelperField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReferenceBubble, WarningBanner, WhyCard } from "@/components/InfoCards";
import { useSelection } from "@/lib/SelectionContext";
import { useSelectionResult } from "@/lib/useSelectionResult";
// @ts-expect-error JS module
import { PIPE_SIZES, PRESSURE_CLASSES } from "@/lib/valveSelectionEngine";

export const Route = createFileRoute("/wizard/ends")({
  head: () => ({ meta: [{ title: "End Connection / Rating — Valve Selection Guide" }] }),
  component: EndsStep,
});

function EndsStep() {
  const { input, update } = useSelection();
  const { result, asmeWarning, asmeRec } = useSelectionResult();
  const endRefs = result.rationale.endConnection?.refs || [];

  return (
    <StepShell
      step="/wizard/ends"
      title="End Connection, Size & Pressure Class"
      subtitle="Pipe size and pressure class drive ASME B16.5 P-T validation and end connection style."
      aside={
        <>
          {asmeRec && (
            <WhyCard>
              <strong className="text-foreground">ASME B16.5 recommendation: </strong>
              {asmeRec.note}
              {asmeRec.recommendedClass !== input.pressureClass && (
                <span className="mt-1 block text-warning">
                  Selected class {input.pressureClass} differs from recommended {asmeRec.recommendedClass}.
                </span>
              )}
            </WhyCard>
          )}
          {asmeWarning && (
            <WarningBanner title={asmeWarning.type === "caution" ? "ASME B16.5 caution" : "ASME B16.5 rating exceeded"}>
              {asmeWarning.warning}
            </WarningBanner>
          )}
          {result.rationale.endConnection && (
            <WhyCard>
              <strong className="text-foreground">End connection: </strong>
              {result.rationale.endConnection.reason}
            </WhyCard>
          )}
          {endRefs.slice(0, 3).map((ref) => (
            <ReferenceBubble key={ref} standard={ref.split(/[(§]/)[0].trim()} note={ref} />
          ))}
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <HelperField label="Pipe size (NPS)" helper="Nominal pipe size of the line.">
          <Select value={input.pipeSize} onValueChange={(v) => update({ pipeSize: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {(PIPE_SIZES as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
        <HelperField label="Pressure class" helper="ASME B16.5 / B16.34 rating class." reference="B16.5">
          <Select value={input.pressureClass} onValueChange={(v) => update({ pressureClass: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(PRESSURE_CLASSES as string[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </HelperField>
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 text-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Computed end-connection package</p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between"><dt className="text-muted-foreground">End connection</dt><dd className="font-mono">{result.endConnection || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">End standard</dt><dd className="font-mono">{result.endConnectionStd || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Flange standard</dt><dd className="font-mono">{result.flangeStandard || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Operator</dt><dd className="font-mono">{result.operator || "—"}</dd></div>
        </dl>
      </div>
    </StepShell>
  );
}
