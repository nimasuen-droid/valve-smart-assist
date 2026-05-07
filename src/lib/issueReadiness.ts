import type { SelectionInput } from "./SelectionContext";
import type { AsmeRec, SelectionResult } from "./useSelectionResult";

export interface OverrideIssue {
  key: string;
  label: string;
  recommended: string;
  selected: string;
  reasonKey: string;
  reason?: string;
}

type ResultLike = SelectionResult;

function hasValue(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function getOverrideIssues({
  input,
  result,
  engineResult,
  asmeRec,
}: {
  input: SelectionInput;
  result: ResultLike;
  engineResult: ResultLike;
  asmeRec: AsmeRec | null;
}): OverrideIssue[] {
  const reasons = input.overrideReasons ?? {};
  const issues: OverrideIssue[] = [];

  const add = (issue: Omit<OverrideIssue, "reason">) => {
    issues.push({ ...issue, reason: reasons[issue.reasonKey]?.trim() });
  };

  if (hasValue(input.valveTypeOverride) && input.valveTypeOverride !== engineResult.valveType) {
    add({
      key: "valveType",
      label: "Valve type",
      recommended: engineResult.valveType,
      selected: result.valveType,
      reasonKey: "valveTypeOverride",
    });
  }

  if (asmeRec?.recommendedClass && asmeRec.recommendedClass !== input.pressureClass) {
    add({
      key: "pressureClass",
      label: "Pressure class",
      recommended: asmeRec.recommendedClass,
      selected: input.pressureClass,
      reasonKey: "pressureClass",
    });
  }

  if (hasValue(input.boreOverride)) {
    add({
      key: "boreOverride",
      label: "Bore",
      recommended: "Reduced Bore",
      selected: input.boreOverride,
      reasonKey: "boreOverride",
    });
  }

  const fields: Array<[keyof SelectionInput, keyof SelectionResult, string]> = [
    ["bodyMaterialOverride", "bodyMaterial", "Body material"],
    ["bodyMaterialSpecOverride", "bodyMaterialSpec", "Body material specification"],
    ["seatMaterialOverride", "seatMaterial", "Seat material"],
    ["discBallMaterialOverride", "discBallMaterial", "Disc / ball material"],
    ["stemMaterialOverride", "stemMaterial", "Stem material"],
    ["gasketOverride", "gasket", "Gasket"],
    ["packingOverride", "packing", "Packing"],
    ["endConnectionOverride", "endConnection", "End connection"],
    ["operatorOverride", "operator", "Operator"],
  ];

  for (const [inputKey, resultKey, label] of fields) {
    const override = input[inputKey];
    if (hasValue(override) && result[resultKey] !== engineResult[resultKey]) {
      add({
        key: String(resultKey),
        label,
        recommended: String(engineResult[resultKey] ?? ""),
        selected: String(result[resultKey] ?? ""),
        reasonKey: String(inputKey),
      });
    }
  }

  return issues;
}

export function getMissingOverrideReasons(issues: OverrideIssue[]) {
  return issues.filter((issue) => !issue.reason);
}

export function getIssueReadinessStatus(issues: OverrideIssue[]) {
  const missing = getMissingOverrideReasons(issues);
  return {
    status: missing.length ? "Draft - override justification required" : "Issued for Review",
    canIssue: missing.length === 0,
    missing,
  };
}
