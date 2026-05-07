import { useMemo } from "react";
import { useSelection } from "./SelectionContext";
import { selectValve } from "./valveSelectionEngine";
import {
  checkAsmeB1634BodyRating,
  checkAsmeB165Rating,
  getRatingSourceMetadata,
  recommendPressureClass,
  resolveMaterialRatingGroup,
} from "./asmeB165Ratings";

export interface RationaleEntry {
  reason: string;
  rule?: string;
  refs?: string[];
  basicExplanation?: {
    designRequirement?: string;
    engineeringLogic?: string;
    alternativesRejected?: string;
    codeReference?: string;
  };
  expertExplanation?: {
    designRequirement?: string;
    engineeringLogic?: string;
    alternativesRejected?: string;
    codeReference?: string;
  };
}

export interface SelectionResult {
  valveType: string;
  valveSubtype: string;
  bodyMaterial: string;
  bodyMaterialSpec: string;
  seatMaterial: string;
  discBallMaterial: string;
  stemMaterial: string;
  endConnection: string;
  endConnectionStd: string;
  operator: string;
  gasket: string;
  packing: string;
  fireSafe: boolean;
  valveStandard: string;
  faceToFaceStd: string;
  testingStandard: string;
  flangeStandard: string;
  warnings: string[];
  alternatives: { type: string; reason: string }[];
  rationale: Record<string, RationaleEntry>;
  materialRatingGroup?: {
    id: string;
    label: string;
    representativeMaterials: string[];
    b165Table: string;
    b1634Table: string;
    dataset?: {
      datasetId: string;
      datasetVersion: string;
      verificationStatus: string;
      verificationStatusLabel: string;
      releaseGate: string;
    };
  };
}

export interface AsmeCheck {
  type: "pressure" | "material" | "caution" | "ok";
  ok?: boolean;
  warning: string;
  maxAllowedPressure?: number | null;
  classMaxAtAmbient?: number;
  reference: string;
  source?: {
    groupId: string;
    groupLabel: string;
    representativeMaterials: string[];
    b165Table: string;
    b1634Table: string;
    sourceNotes: string[];
    preliminary: boolean;
  };
}

export interface AsmeRec {
  recommendedClass: string;
  maxAllowed: number | null;
  factor: number | null;
  note: string;
  exceeded?: boolean;
  source?: AsmeCheck["source"];
}

export function useSelectionResult() {
  const { input } = useSelection();
  return useMemo(() => {
    const engineResult = selectValve(input) as SelectionResult;
    const result = applyOverrides(engineResult, input);
    const materialRatingGroup = resolveMaterialRatingGroup({
      bodyMaterial: result.bodyMaterial,
      bodyMaterialSpec: result.bodyMaterialSpec,
    });
    const materialRatingMetadata = getRatingSourceMetadata(materialRatingGroup);
    const resultWithMetadata = {
      ...result,
      materialRatingGroup: { ...materialRatingGroup, dataset: materialRatingMetadata.dataset },
    };
    const asmeWarning = checkAsmeB165Rating({
      pressureClass: "Class " + input.pressureClass.replace("#", ""),
      designTemp: input.designTemp,
      designPressure: input.designPressure,
      bodyMaterial: result.bodyMaterial,
      bodyMaterialSpec: result.bodyMaterialSpec,
    }) as AsmeCheck | null;
    const asmeRec = recommendPressureClass({
      designTemp: input.designTemp,
      designPressure: input.designPressure,
      bodyMaterial: result.bodyMaterial,
      bodyMaterialSpec: result.bodyMaterialSpec,
    }) as AsmeRec | null;
    const b1634Check = checkAsmeB1634BodyRating({
      bodyMaterial: result.bodyMaterial,
      bodyMaterialSpec: result.bodyMaterialSpec,
      designTemp: input.designTemp,
      pressureClass: input.pressureClass,
    }) as AsmeCheck | null;
    return {
      result: resultWithMetadata,
      asmeWarning,
      asmeRec,
      b1634Check,
      materialRatingGroup: resultWithMetadata.materialRatingGroup,
      input,
      engineResult,
    };
  }, [input]);
}

type SelectionInputLite = {
  valveTypeOverride?: string;
  boreOverride?: "Full Bore" | "Reduced Bore" | "";
  bodyMaterialOverride?: string;
  bodyMaterialSpecOverride?: string;
  seatMaterialOverride?: string;
  discBallMaterialOverride?: string;
  stemMaterialOverride?: string;
  gasketOverride?: string;
  packingOverride?: string;
  endConnectionOverride?: string;
  operatorOverride?: string;
};

function applyOverrides(res: SelectionResult, input: SelectionInputLite): SelectionResult {
  let out = res;
  const typeOverride = input.valveTypeOverride?.trim();
  if (typeOverride && typeOverride !== res.valveType) {
    const alt = res.alternatives?.find(
      (a) => a.type === typeOverride || a.type.startsWith(typeOverride),
    );
    const note = alt
      ? `User override — originally rejected alternative selected. Engine recommended "${res.valveType}". Original rejection reason: ${alt.reason}`
      : `User override — manually selected "${typeOverride}" in place of engine recommendation "${res.valveType}". Verify suitability against process conditions.`;
    out = {
      ...out,
      valveType: typeOverride,
      valveSubtype: typeOverride,
      warnings: [
        `MANUAL OVERRIDE: Valve type changed from engine pick "${res.valveType}" to "${typeOverride}". Engineering review required.`,
        ...res.warnings,
      ],
      rationale: {
        ...res.rationale,
        valveType: {
          reason: note,
          rule: `User override — engine logic bypassed for valve type. Original rule: ${res.rationale?.valveType?.rule ?? "n/a"}`,
          refs: res.rationale?.valveType?.refs,
        },
      },
    };
  }

  const boreOverride = input.boreOverride;
  if (boreOverride && out.valveType.includes("Ball")) {
    const cleanedSubtype = out.valveSubtype
      .replace(/\s+—\s+(Full Bore[^—]*|Reduced Bore[^—]*)$/i, "")
      .trim();
    const newSubtype = `${cleanedSubtype} — ${boreOverride} (User Override)`;
    const overrideReason =
      boreOverride === "Full Bore"
        ? `User override to Full Bore. Engineering justification required (e.g., piggable, ESD/HIPPS, subsea, low-dP). Default cost-driven choice for ball valves is Reduced Bore.`
        : `User override to Reduced Bore. Confirm no piggable, ESD/HIPPS, subsea or pressure-drop critical requirement applies.`;
    out = {
      ...out,
      valveSubtype: newSubtype,
      warnings: [
        `MANUAL OVERRIDE: Bore selection set to ${boreOverride} by user.`,
        ...out.warnings,
      ],
      rationale: {
        ...out.rationale,
        bore: {
          reason: overrideReason,
          rule: `User override — bore set to ${boreOverride}. Engine default rule: ${out.rationale?.bore?.rule ?? "Reduced Bore default for ball valves."}`,
          refs: out.rationale?.bore?.refs ?? ["API 6D §5.2"],
        },
      },
    };
  }

  const matFields: Array<[keyof SelectionInputLite, keyof SelectionResult, string]> = [
    ["bodyMaterialOverride", "bodyMaterial", "Body material"],
    ["bodyMaterialSpecOverride", "bodyMaterialSpec", "Body material specification"],
    ["seatMaterialOverride", "seatMaterial", "Seat material"],
    ["discBallMaterialOverride", "discBallMaterial", "Disc/Ball material"],
    ["stemMaterialOverride", "stemMaterial", "Stem material"],
    ["gasketOverride", "gasket", "Gasket"],
    ["packingOverride", "packing", "Packing"],
    ["endConnectionOverride", "endConnection", "End connection"],
    ["operatorOverride", "operator", "Operator"],
  ];
  for (const [inputKey, resultKey, label] of matFields) {
    const v = (input as Record<string, unknown>)[inputKey as string];
    if (
      typeof v === "string" &&
      v.trim() &&
      v !== (out as unknown as Record<string, string>)[resultKey as string]
    ) {
      const original = (out as unknown as Record<string, string>)[resultKey as string];
      out = {
        ...out,
        [resultKey]: v,
        warnings: [
          `MANUAL OVERRIDE: ${label} changed from "${original}" to "${v}". Engineering review required.`,
          ...out.warnings,
        ],
      } as SelectionResult;
    }
  }
  return out;
}
