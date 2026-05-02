import { useMemo } from "react";
import { useSelection } from "./SelectionContext";
import { selectValve } from "./valveSelectionEngine";
import { checkAsmeB165Rating, recommendPressureClass } from "./asmeB165Ratings";

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
}

export interface AsmeCheck {
  type: "pressure" | "material" | "caution";
  warning: string;
  maxAllowedPressure: number | null;
  classMaxAtAmbient: number;
  reference: string;
}

export interface AsmeRec {
  recommendedClass: string;
  maxAllowed: number;
  factor: number;
  note: string;
  exceeded?: boolean;
}

export function useSelectionResult() {
  const { input } = useSelection();
  return useMemo(() => {
    const result = selectValve(input) as SelectionResult;
    const asmeWarning = checkAsmeB165Rating({
      pressureClass: "Class " + input.pressureClass.replace("#", ""),
      designTemp: input.designTemp,
      designPressure: input.designPressure,
    }) as AsmeCheck | null;
    const asmeRec = recommendPressureClass({
      designTemp: input.designTemp,
      designPressure: input.designPressure,
    }) as AsmeRec | null;
    return { result, asmeWarning, asmeRec, input };
  }, [input]);
}
