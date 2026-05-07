// IEC 60534 control valve sizing (incompressible & compressible).
// Simplified for engineering preliminary checks. Not a substitute for vendor sizing software.
//
// Liquid (IEC 60534-2-1):
//   Cv = Q * sqrt(SG / dP)
//     Q  = flow rate [US gpm]
//     SG = specific gravity (water = 1)
//     dP = pressure drop across valve [psi]
//   Choked liquid flow when dP >= FL^2 * (P1 - FF*Pv).  We flag choked but still
//   compute Cv at the actual dP — user is warned.
//
// Gas / Vapor (IEC 60534-2-1, simplified):
//   Cv = (Q_scfh / 1360) * sqrt(SG_g * T_R) / (P1_psia * Y * sqrt(x))
//     Q_scfh = standard cubic feet per hour
//     SG_g   = gas specific gravity (air = 1)
//     T_R    = inlet temperature [°R] = (T_C + 273.15) * 9/5
//     P1_psia= absolute inlet pressure [psia]
//     x      = dP / P1
//     Y      = 1 - x / (3 * Fk * xT)        (expansion factor, capped 0.667)
//     Fk     = k / 1.4   (specific heat ratio factor)
//     xT     ≈ 0.72 for globe, 0.25 for ball, 0.38 for butterfly (typical)
//   Choked when x >= Fk * xT.  Use x_choked in formula when choked.

export type Phase = "liquid" | "gas";

export interface SizingInputs {
  phase: Phase;
  // Common
  inletPressureBarg: number; // P1 (gauge)
  pressureDropBar: number; // dP across valve
  temperatureC: number; // flowing temp
  // Liquid
  flowRate_m3h?: number; // volumetric flow (liquid)
  specificGravity?: number; // SG (water = 1)
  vaporPressureBara?: number; // Pv (absolute), default 0
  // Gas
  flowRate_Nm3h?: number; // standard volumetric (Normal m3/h @ 0 °C, 1 atm)
  gasSG?: number; // SG vs air (methane ~0.55)
  k?: number; // specific heat ratio (default 1.4)
  // Valve geometry assumption (for verdict)
  selectedValveType?: string; // e.g. "Globe Valve", "Ball Valve", "Butterfly Valve"
}

export interface SizingResult {
  ok: boolean;
  errors: string[];
  // Outputs
  requiredCv: number;
  requiredKv: number; // Kv = Cv / 1.156
  choked: boolean;
  chokedDpBar?: number; // dP at which choking starts
  // Verdict against the selected valve's typical Cv per NPS
  verdict: "PASS" | "REVIEW" | "UNDERSIZED" | "N/A";
  verdictNote: string;
  assumedXt: number;
  expansionY?: number;
  references: string[];
}

// Typical full-open Cv (rough, for verdict only) per NPS for Globe / Ball / Butterfly.
// Sources: vendor data condensed (Fisher, Velan, Emerson) — preliminary use only.
const TYPICAL_CV: Record<string, Record<string, number>> = {
  "Globe Valve": {
    '1"': 12,
    '1.5"': 28,
    '2"': 48,
    '3"': 110,
    '4"': 195,
    '6"': 450,
    '8"': 750,
    '10"': 1100,
    '12"': 1600,
  },
  "Ball Valve": {
    '1"': 50,
    '1.5"': 130,
    '2"': 230,
    '3"': 580,
    '4"': 1100,
    '6"': 2400,
    '8"': 4200,
    '10"': 6500,
    '12"': 9500,
  },
  "Butterfly Valve": {
    '1"': 30,
    '1.5"': 80,
    '2"': 150,
    '3"': 400,
    '4"': 800,
    '6"': 1900,
    '8"': 3500,
    '10"': 5500,
    '12"': 8200,
    '14"': 11000,
    '16"': 15000,
    '18"': 19000,
    '20"': 24000,
    '24"': 35000,
  },
};

const XT_BY_TYPE: Record<string, number> = {
  "Globe Valve": 0.72,
  "Ball Valve": 0.25,
  "Butterfly Valve": 0.38,
};

const BAR_TO_PSI = 14.5038;
const BARA_TO_PSIA = 14.5038;
const NM3H_TO_SCFH = 37.326; // 1 Nm3/h ≈ 37.326 scfh @ 60 °F, 14.7 psia
const M3H_TO_GPM = 4.40287;
const KV_FACTOR = 1.156; // Cv = Kv * 1.156

export function runSizing(inp: SizingInputs): SizingResult {
  const errors: string[] = [];
  const refs = ["IEC 60534-2-1 (Sizing equations for flow conditions)", "ISA 75.01.01"];

  if (!isFinite(inp.inletPressureBarg) || inp.inletPressureBarg < 0)
    errors.push("Inlet pressure missing or invalid.");
  if (!isFinite(inp.pressureDropBar) || inp.pressureDropBar <= 0)
    errors.push("Pressure drop must be > 0.");
  if (!isFinite(inp.temperatureC)) errors.push("Temperature missing.");

  const xt = inp.selectedValveType ? (XT_BY_TYPE[inp.selectedValveType] ?? 0.72) : 0.72;

  if (errors.length) {
    return {
      ok: false,
      errors,
      requiredCv: 0,
      requiredKv: 0,
      choked: false,
      verdict: "N/A",
      verdictNote: "Inputs incomplete.",
      assumedXt: xt,
      references: refs,
    };
  }

  const P1_bara = inp.inletPressureBarg + 1.01325;
  const dP_psi = inp.pressureDropBar * BAR_TO_PSI;
  const P1_psia = P1_bara * BARA_TO_PSIA;

  let Cv = 0;
  let choked = false;
  let chokedDpBar: number | undefined;
  let Y: number | undefined;

  if (inp.phase === "liquid") {
    if (!inp.flowRate_m3h || inp.flowRate_m3h <= 0)
      errors.push("Liquid flow rate (m³/h) is required.");
    if (!inp.specificGravity || inp.specificGravity <= 0)
      errors.push("Specific gravity is required.");
    if (errors.length)
      return {
        ok: false,
        errors,
        requiredCv: 0,
        requiredKv: 0,
        choked: false,
        verdict: "N/A",
        verdictNote: "Inputs incomplete.",
        assumedXt: xt,
        references: refs,
      };

    const Q_gpm = inp.flowRate_m3h! * M3H_TO_GPM;
    const SG = inp.specificGravity!;
    const Pv_bara = inp.vaporPressureBara ?? 0;
    const FL =
      inp.selectedValveType === "Ball Valve"
        ? 0.6
        : inp.selectedValveType === "Butterfly Valve"
          ? 0.7
          : 0.9;
    const FF = 0.96 - 0.28 * Math.sqrt(Pv_bara / 220.6); // crit. pressure water ~220.6 bara approx
    const dP_choked_bar = FL * FL * (inp.inletPressureBarg + 1.01325 - FF * Pv_bara);
    chokedDpBar = Math.max(0, dP_choked_bar);
    choked = inp.pressureDropBar >= chokedDpBar && chokedDpBar > 0;
    const dP_used_psi = (choked ? chokedDpBar! : inp.pressureDropBar) * BAR_TO_PSI;

    Cv = Q_gpm * Math.sqrt(SG / dP_used_psi);
  } else {
    // gas
    if (!inp.flowRate_Nm3h || inp.flowRate_Nm3h <= 0)
      errors.push("Gas flow rate (Nm³/h) is required.");
    if (!inp.gasSG || inp.gasSG <= 0) errors.push("Gas specific gravity (vs air) is required.");
    if (errors.length)
      return {
        ok: false,
        errors,
        requiredCv: 0,
        requiredKv: 0,
        choked: false,
        verdict: "N/A",
        verdictNote: "Inputs incomplete.",
        assumedXt: xt,
        references: refs,
      };

    const k = inp.k ?? 1.4;
    const Fk = k / 1.4;
    const x_actual = inp.pressureDropBar / P1_bara;
    const x_choked = Fk * xt;
    chokedDpBar = x_choked * P1_bara;
    choked = x_actual >= x_choked;
    const x = Math.min(x_actual, x_choked);

    Y = Math.max(0.667, 1 - x / (3 * Fk * xt));
    const T_R = ((inp.temperatureC + 273.15) * 9) / 5;
    const Q_scfh = inp.flowRate_Nm3h! * NM3H_TO_SCFH;
    Cv = ((Q_scfh / 1360) * Math.sqrt(inp.gasSG! * T_R)) / (P1_psia * Y * Math.sqrt(x));
    void dP_psi; // (kept for completeness)
  }

  const Kv = Cv / KV_FACTOR;

  // Verdict: compare against typical Cv at NPS for selected valve type
  const verdict: SizingResult["verdict"] = "N/A";
  const verdictNote = "Selected valve type has no Cv reference table — verdict unavailable.";
  return {
    ok: true,
    errors: [],
    requiredCv: Cv,
    requiredKv: Kv,
    choked,
    chokedDpBar,
    verdict,
    verdictNote,
    assumedXt: xt,
    expansionY: Y,
    references: refs,
  };
}

export function evaluateAgainstValve(
  required: SizingResult,
  valveType: string | undefined,
  pipeSize: string,
): {
  verdict: SizingResult["verdict"];
  verdictNote: string;
  typicalCv?: number;
  openingPct?: number;
} {
  if (!required.ok) return { verdict: "N/A", verdictNote: "Sizing not computed." };
  if (!valveType || !TYPICAL_CV[valveType]) {
    return {
      verdict: "N/A",
      verdictNote: `No Cv reference for ${valveType ?? "(unknown)"} — manual vendor check required.`,
    };
  }
  const typicalCv = TYPICAL_CV[valveType][pipeSize];
  if (!typicalCv) {
    return {
      verdict: "N/A",
      verdictNote: `No Cv reference for ${valveType} ${pipeSize} — manual vendor check required.`,
    };
  }
  const opening = (required.requiredCv / typicalCv) * 100;
  if (opening > 100) {
    return {
      verdict: "UNDERSIZED",
      verdictNote: `Required Cv ${required.requiredCv.toFixed(1)} exceeds typical full-open Cv (${typicalCv}) for ${valveType} ${pipeSize}. Increase line size or change valve type.`,
      typicalCv,
      openingPct: opening,
    };
  }
  if (opening < 20) {
    return {
      verdict: "REVIEW",
      verdictNote: `Valve operates at ${opening.toFixed(0)}% open — risk of poor control / seat erosion. Consider smaller body or trim.`,
      typicalCv,
      openingPct: opening,
    };
  }
  if (opening > 80) {
    return {
      verdict: "REVIEW",
      verdictNote: `Valve operates at ${opening.toFixed(0)}% open — little margin for upset / future capacity. Review trim selection.`,
      typicalCv,
      openingPct: opening,
    };
  }
  return {
    verdict: "PASS",
    verdictNote: `Required Cv ${required.requiredCv.toFixed(1)} vs typical full-open Cv ${typicalCv} → ~${opening.toFixed(0)}% open. Within recommended 20–80% control window.`,
    typicalCv,
    openingPct: opening,
  };
}
