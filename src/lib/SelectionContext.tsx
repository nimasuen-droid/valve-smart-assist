import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { loadSelectionState, saveSelectionState } from "./selectionState";

export interface SelectionInput {
  projectName: string;
  tagNumber: string;
  serviceType: string;
  fluidType: string;
  valveFunction: string;
  pipeSize: string;
  pressureClass: string;
  designTemp: string;
  designPressure: string;
  installationLocation: string;
  additionalRequirements: string[];
  // optional metadata (not required by the engine)
  clientName?: string;
  areaUnit?: string;
  lineNumber?: string;
  lineClass?: string;
  operatingPressure?: string;
  operatingTemp?: string;
  flowCondition?: string;
  notes?: string;
  isSample?: boolean;
  sampleTitle?: string;
  // Sizing inputs (IEC 60534) — optional, used for throttling validation
  sizingPhase?: "liquid" | "gas";
  sizingFlow?: string;
  sizingInletP?: string;
  sizingDp?: string;
  sizingTemp?: string;
  sizingSG?: string;
  sizingPv?: string;
  sizingK?: string;
  // Valve body size — defaults to line size (pipeSize) when undefined
  valveSize?: string;
}

const DEFAULT: SelectionInput = {
  projectName: "",
  tagNumber: "",
  serviceType: "General Hydrocarbon",
  fluidType: "Gas / Vapor",
  valveFunction: "Isolation (On/Off)",
  pipeSize: '6"',
  pressureClass: "300#",
  designTemp: "120",
  designPressure: "40",
  installationLocation: "Onshore - Open Air",
  additionalRequirements: [],
  isSample: false,
};

interface Ctx {
  input: SelectionInput;
  update: (patch: Partial<SelectionInput>) => void;
  reset: () => void;
}

const SelectionCtx = createContext<Ctx | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<SelectionInput>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSelectionState();
    if (saved) setInput({ ...DEFAULT, ...saved });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSelectionState(input);
  }, [input, hydrated]);

  const value = useMemo<Ctx>(() => ({
    input,
    update: (patch) => setInput((s) => ({ ...s, ...patch })),
    reset: () => setInput(DEFAULT),
  }), [input]);

  return <SelectionCtx.Provider value={value}>{children}</SelectionCtx.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionCtx);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
