import { useState, type ReactNode } from "react";
import { Star, AlertTriangle, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSelection, type SelectionInput } from "@/lib/SelectionContext";

export interface OverrideFieldProps {
  /** Visible label, e.g. "Body material" */
  label: string;
  /** Engine-recommended value */
  recommended: string;
  /** Key on SelectionInput holding the override value (string field) */
  overrideKey: keyof SelectionInput;
  /** Available options. Recommended value is auto-merged in. */
  options: string[];
  /** Optional rationale shown below the recommended value */
  reasoning?: string;
  /** Optional contextual warning when override is active */
  warning?: string;
  /** When true, treats warning as critical (red). Otherwise amber. */
  critical?: boolean;
  /** Optional render slot for non-Select pickers (e.g. cards). When supplied, uses this in place of the Select. */
  renderPicker?: (args: {
    value: string;
    onChange: (v: string) => void;
    locked: boolean;
  }) => ReactNode;
}

/**
 * Standardized "Recommended vs Override" interaction.
 * - Recommended value is locked by default with green ★ + reasoning.
 * - "Override recommendation" unlocks the field, shows advisory, status badge, reason field.
 */
export function OverrideField({
  label,
  recommended,
  overrideKey,
  options,
  reasoning = "Based on input conditions and engineering logic",
  warning,
  critical,
  renderPicker,
}: OverrideFieldProps) {
  const { input, update } = useSelection();
  const current = (input[overrideKey] as string | undefined) ?? "";
  const isOverridden = !!current && current !== recommended;
  const reasons = input.overrideReasons ?? {};
  const reason = reasons[overrideKey as string] ?? "";
  const [unlocked, setUnlocked] = useState<boolean>(isOverridden);

  const setOverride = (v: string) => {
    if (v === recommended) update({ [overrideKey]: "" } as Partial<SelectionInput>);
    else update({ [overrideKey]: v } as Partial<SelectionInput>);
  };

  const setReason = (v: string) => {
    update({ overrideReasons: { ...reasons, [overrideKey as string]: v } });
  };

  const lockBack = () => {
    update({ [overrideKey]: "" } as Partial<SelectionInput>);
    setReason("");
    setUnlocked(false);
  };

  const opts = Array.from(new Set([recommended, ...options].filter(Boolean)));
  const effective = isOverridden ? current : recommended;
  const locked = !unlocked && !isOverridden;

  return (
    <div className="space-y-2">
      {/* Header: label + status */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {isOverridden ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
            <AlertTriangle className="h-3 w-3" /> Override active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <Star className="h-3 w-3 fill-success text-success" /> Recommended
          </span>
        )}
      </div>

      {/* Recommended value display */}
      <div className="rounded-md border border-success/30 bg-success/5 p-2.5">
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 shrink-0 fill-success text-success" />
          <span className="font-mono text-sm font-medium text-success">{recommended || "—"}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-success/70">Recommended</span>
        </div>
        <p className="mt-1 pl-5 text-[11px] text-muted-foreground">{reasoning}</p>
      </div>

      {/* Picker — locked or unlocked */}
      {locked ? (
        <button
          type="button"
          onClick={() => setUnlocked(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          <Unlock className="h-3 w-3" /> Override recommendation
        </button>
      ) : (
        <div className="space-y-2 rounded-md border border-warning/30 bg-warning/5 p-3">
          <p className="text-[11px] text-warning">
            Manual override should be based on project specification, applicable codes, service conditions, or engineering judgment.
          </p>

          {renderPicker ? (
            renderPicker({ value: effective, onChange: setOverride, locked: false })
          ) : (
            <Select value={effective} onValueChange={setOverride}>
              <SelectTrigger className="h-9 font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opts.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === recommended ? `★ ${o} (recommended)` : o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isOverridden && (
            <p className="text-xs">
              <span className="text-muted-foreground">Selected: </span>
              <span className="font-mono font-medium text-warning">{current}</span>
              <span className="ml-1 text-[10px] uppercase tracking-wider text-warning/80">(Override)</span>
            </p>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Override reason {isOverridden && <span className="text-destructive">*</span>}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client specification, material availability, cost, constructability, operability, vendor constraint"
              className="min-h-[60px] text-xs"
            />
            {isOverridden && !reason.trim() && (
              <p className="mt-1 text-[11px] text-destructive">A justification is required for traceability.</p>
            )}
          </div>

          {warning && isOverridden && (
            <p
              className={`flex items-start gap-1.5 rounded border p-2 text-[11px] ${
                critical
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-warning/40 bg-warning/10 text-warning"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{warning}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={lockBack}>
              <Lock className="h-3 w-3" /> Use recommended
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
