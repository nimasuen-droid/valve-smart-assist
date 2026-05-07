// Utilities for PDF and Excel export of valve datasheets
import { format } from "date-fns";
import {
  APP_GOVERNANCE,
  EXPORT_GOVERNANCE_NOTICE,
  STANDARDS_COPYRIGHT_NOTICE,
  USER_RESPONSIBILITY_NOTICE,
  getDatasetUseLabel,
  getGovernanceSnapshot,
} from "./governance.js";

const HTML_ENTITY_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITY_MAP[char]);
}

function sanitizeExcelText(value) {
  const text = String(value ?? "");
  return /^[=+\-@\t\r\n]/.test(text) ? `'${text}` : text;
}

function escapeExcelCell(value) {
  return escapeHtml(sanitizeExcelText(value));
}

export function safeExportFilename(value, fallback = "draft") {
  const cleaned = String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\.\.+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.=+\-@]+/g, "")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

export function buildDatasheetRows(data) {
  // Works with both a "saved" entity (snake_case) and a live result (camelCase merged)
  const get = (snake, camel) => data[snake] ?? data[camel] ?? "-";
  const today = format(new Date(), "dd-MMM-yyyy");

  return {
    today,
    sections: [
      {
        title: "1. General Information",
        rows: [
          ["Project", get("project_name", "projectName")],
          ["Tag Number", get("tag_number", "tagNumber")],
          ["Service Type", get("service_type", "serviceType")],
          ["Fluid Type", get("fluid_type", "fluidType")],
          ["Valve Function", get("valve_function", "valveFunction")],
        ],
      },
      {
        title: "2. Design Conditions",
        rows: [
          ["Line Size (NPS)", get("pipe_size", "pipeSize")],
          ["Pressure Class", get("pressure_class", "pressureClass")],
          ["Design Temperature (deg C)", get("design_temp", "designTemp")],
          ["Design Pressure (barg)", get("design_pressure", "designPressure")],
        ],
      },
      {
        title: "3. Valve Selection",
        rows: [
          ["Valve Type", get("valve_type", "valveType")],
          ["Valve Subtype / Configuration", get("valve_subtype", "valveSubtype")],
          ["Operator", get("operator_type", "operator")],
          ["Fire Safe", (data.fire_safe ?? data.fireSafe) ? "Yes (API 607)" : "No"],
        ],
      },
      {
        title: "4. Materials of Construction",
        rows: [
          ["Body Material", get("body_material", "bodyMaterial")],
          ["Body Material Spec", get("body_material_spec", "bodyMaterialSpec")],
          ["Seat Material", get("seat_material", "seatMaterial")],
          ["Disc / Ball Material", get("disc_ball_material", "discBallMaterial")],
          ["Stem Material", get("stem_material", "stemMaterial")],
          ["Packing", get("packing", "packing")],
          ["Gasket", get("gasket", "gasket")],
        ],
      },
      {
        title: "5. End Connection & Standards",
        rows: [
          ["End Connection", get("end_connection", "endConnection")],
          ["End Connection Standard", get("end_connection_std", "endConnectionStd")],
          ["Valve Design Standard", get("valve_standard", "valveStandard")],
          ["Face-to-Face Standard", get("face_to_face_std", "faceToFaceStd")],
          ["Flange Standard", get("flange_standard", "flangeStandard")],
          ["Testing Standard", get("testing_standard", "testingStandard")],
        ],
      },
    ],
    warnings: data.warnings || [],
    tagNumber: get("tag_number", "tagNumber"),
    status: data.status || "Draft",
  };
}

export function deriveValveDatasheetBasis(data) {
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "";
  };
  const service = v("service_type", "serviceType");
  const fluid = v("fluid_type", "fluidType");
  const valveFunction = v("valve_function", "valveFunction");
  const vType = v("valve_type", "valveType");
  const vSub = v("valve_subtype", "valveSubtype");
  const seat = v("seat_material", "seatMaterial");
  const op = v("operator_type", "operator");
  const dTemp = v("design_temp", "designTemp");
  const dPress = v("design_pressure", "designPressure");
  const cls = v("pressure_class", "pressureClass");
  const reqs = data.additionalRequirements || data.additional_requirements || [];
  const warnings = data.warnings || [];

  const serviceLow = service.toLowerCase();
  const fluidLow = fluid.toLowerCase();
  const vTypeLow = vType.toLowerCase();
  const vSubLow = vSub.toLowerCase();
  const seatLow = seat.toLowerCase();
  const tempNum = parseFloat(dTemp) || 0;
  const pressNum = parseFloat(dPress) || 0;
  const classNum = parseInt((cls || "").replace(/\D/g, "")) || 0;
  const has = (k) => reqs.some((r) => r.toLowerCase().includes(k));

  const isBall = vTypeLow.includes("ball");
  const isCheck = vTypeLow.includes("check");
  const isPSV = vTypeLow.includes("relief") || vTypeLow.includes("safety");
  const isGlobe = vTypeLow.includes("globe");
  const isPlug = vTypeLow.includes("plug");
  const isButterfly = vTypeLow.includes("butterfly");
  const isGate = vTypeLow.includes("gate");
  const isQuarterTurn = isBall || isPlug || isButterfly;
  const isSoftSeat = /(ptfe|rtfe|rptfe|devlon|soft|sleeve|resilient)/i.test(seat);
  const isMetalSeat = /(metal|stellite|lapped|hardfaced)/i.test(seat);
  const isLiquid =
    fluidLow.includes("liquid") || fluidLow.includes("water") || fluidLow.includes("slurry");
  const isFlammable =
    serviceLow.includes("hydrocarbon") ||
    serviceLow.includes("fuel gas") ||
    serviceLow.includes("hydrogen") ||
    serviceLow.includes("flare") ||
    serviceLow.includes("relief") ||
    serviceLow.includes("lube oil") ||
    has("esd") ||
    has("hipps");
  const isSour =
    serviceLow.includes("sour") || serviceLow.includes("h2s") || serviceLow.includes("amine");
  const isOxygen = serviceLow.includes("oxygen");
  const isCryo = serviceLow.includes("cryo") || tempNum < -29 || has("cryogenic");
  const isReliefIsolation = serviceLow.includes("flare") || serviceLow.includes("relief");

  const bore =
    isBall || isGate || isPlug
      ? vSubLow.includes("reduced")
        ? "Reduced Bore (RB)"
        : "Full Bore (FB)"
      : has("piggable")
        ? "Full Bore (FB) - pigging"
        : "N/A";

  let sealingSystem = "Verify vendor seat and sealing arrangement";
  if (isBall) {
    if (vSubLow.includes("trunnion")) {
      sealingSystem = has("bidirectional")
        ? "Trunnion ball with DPE bidirectional seat design; test both directions"
        : "Trunnion ball with spring-loaded SPE seats; bidirectional sealing only if specified";
    } else {
      sealingSystem = "Floating ball with downstream pressure-energized seat";
    }
    if (isMetalSeat) sealingSystem += "; metal-to-metal primary seal with fire-safe backup";
  } else if (isButterfly) {
    sealingSystem = vSubLow.includes("triple")
      ? "Triple-offset torque-seated disc with metal/laminated seat"
      : "Resilient or PTFE-lined disc-to-seat seal; verify shutoff class and temperature rating";
  } else if (isGate) {
    sealingSystem = "Wedge-to-body seat rings, metal-to-metal, straight-through full-bore seal";
  } else if (isGlobe) {
    sealingSystem = "Plug/disc-to-seat throttling seal; directional shutoff, not piggable";
  } else if (isCheck) {
    sealingSystem = "Flow-reversal disc/piston/plates closing onto a non-return seat";
  } else if (isPlug) {
    sealingSystem = seatLow.includes("lubricated")
      ? "Lubricated plug with sealant-assisted body/plug sealing"
      : "Sleeved plug with PTFE sleeve sealing";
  } else if (isPSV) {
    sealingSystem = "Precision-lapped nozzle and disc seat; set-pressure sealing per relief code";
  }

  const seatLeakageBasis =
    isSoftSeat && (isBall || isButterfly || isPlug)
      ? "API 598 seat test; soft-seat zero visible leakage where applicable"
      : isPSV
        ? "API 527 / project relief-valve seat tightness; API 598 only if specified"
        : "API 598 shell and seat test; metal-seat leakage per valve type and class";

  const shellTest =
    pressNum > 0
      ? `${(pressNum * 1.5).toFixed(0)} barg min. screening shell test basis`
      : "Per API 598";

  const fireSafeRequirement = isQuarterTurn
    ? (data.fire_safe ?? data.fireSafe)
      ? "Required - API 607 fire-tested quarter-turn design"
      : "Not triggered by selected service"
    : isFlammable && (isGate || isGlobe)
      ? "Project fire test / API 6FA review if fire-safe block valve is required"
      : "N/A";

  const antiStaticDevice =
    isBall || isPlug
      ? isFlammable || isOxygen || has("anti-static") || has("hazardous")
        ? "Required - verify stem/closure member/body electrical continuity"
        : "Not required by selected service; verify project specification"
      : isButterfly && (isFlammable || has("anti-static"))
        ? "Verify shaft/disc/body electrical continuity if specified"
        : "N/A";

  const blowoutProofStem =
    isBall || isPlug || isButterfly
      ? "Required for pressure-retaining stem/shaft design"
      : isGate || isGlobe
        ? "Backseat / retained stem per valve standard; verify vendor design"
        : "N/A";

  const needsCavityRelief =
    (isBall || isPlug) && (has("cavity") || has("bidirectional") || isCryo || isLiquid);
  const cavityRelief =
    isBall || isPlug
      ? needsCavityRelief
        ? "Required / verify"
        : "Verify if trapped liquid possible"
      : "N/A";

  const fugitiveEmission =
    has("low emission") || has("fugitive") || isSour
      ? "Required - API 622 / ISO 15848-1 qualified packing"
      : "Standard packing; low-emission upgrade optional";

  const lockingDevice = isReliefIsolation
    ? "Required - locked/car-sealed open"
    : valveFunction === "Drain" || valveFunction === "Vent"
      ? "LO/LC capable; position per operating procedure"
      : "LO/LC capable if project requires";

  const positionIndicator = isCheck || isPSV ? "N/A" : "Required";

  const operationRequirement =
    isCheck || isPSV
      ? "Self-actuated by process pressure/flow"
      : has("esd") || has("hipps")
        ? "Actuated safety function; SIL/proof-test data required"
        : isReliefIsolation
          ? "Normally open; lock/car seal control required"
          : "Manual";

  const failPosition = has("hipps")
    ? "Fail Close (HIPPS)"
    : has("esd")
      ? "Fail Safe Close (unless cause/effect specifies otherwise)"
      : isCheck || isPSV
        ? "Self-actuated"
        : "N/A";

  const operationDirection =
    isCheck || isPSV
      ? "N/A"
      : isQuarterTurn
        ? "Clockwise to Close; position indicator required"
        : "Clockwise to Close; verify handwheel marking";

  const torqueSizing =
    isCheck || isPSV
      ? "N/A"
      : classNum >= 900 || vSubLow.includes("metal") || isMetalSeat
        ? "Vendor torque/thrust check mandatory at max differential pressure"
        : "Per manufacturer; verify max rim pull <= 360 N for manual operation";

  const orientationLimitation = isCheck
    ? vSubLow.includes("swing")
      ? "Horizontal or vertical-up flow only unless vendor approves"
      : "Verify minimum flow velocity and installation orientation"
    : isPSV
      ? "Vertical upright installation required"
      : isGate || isGlobe
        ? "Stem access and bonnet removal clearance required"
        : "Any, subject to actuator access and manufacturer limits";

  const bidirectionalSealing = has("bidirectional")
    ? "Required - test both directions"
    : isBall
      ? "Verify SPE/DPE seat arrangement before claiming bidirectional shutoff"
      : isGate
        ? "Generally bidirectional; confirm with body/seat design"
        : isButterfly
          ? "Only if rated and tested for both directions"
          : isCheck || isGlobe || isPSV
            ? "No / directional"
            : "Verify vendor design";

  const specialService = isSour
    ? "Sour (NACE MR0175 / ISO 15156)"
    : isOxygen
      ? "Oxygen cleaned"
      : isCryo
        ? "Cryogenic"
        : isReliefIsolation
          ? "Relief/flare path isolation"
          : "Standard";

  const issues = [];
  if (isCheck && op && !op.toLowerCase().includes("self")) {
    issues.push("Check valve operator should be self-actuated.");
  }
  if (isPSV && op && !op.toLowerCase().includes("self")) {
    issues.push("Relief valve operator should be self-actuated.");
  }
  if (isReliefIsolation && !isGate && !warnings.some((w) => w.toLowerCase().includes("relief"))) {
    issues.push("Relief-path isolation should warn about full-bore locked-open duty.");
  }
  if ((isCheck || isPSV) && antiStaticDevice !== "N/A") {
    issues.push(
      "Anti-static device must not be marked required for self-actuated check/relief valves.",
    );
  }

  return {
    isBall,
    isCheck,
    isPSV,
    isGlobe,
    isPlug,
    isButterfly,
    isGate,
    isQuarterTurn,
    isSoftSeat,
    isMetalSeat,
    isSour,
    isOxygen,
    isCryo,
    isReliefIsolation,
    bore,
    sealingSystem,
    seatLeakageBasis,
    shellTest,
    fireSafeRequirement,
    antiStaticDevice,
    blowoutProofStem,
    cavityRelief,
    fugitiveEmission,
    lockingDevice,
    positionIndicator,
    operationRequirement,
    failPosition,
    operationDirection,
    torqueSizing,
    orientationLimitation,
    bidirectionalSealing,
    specialService,
    issues,
  };
}

export function generatePdfHtml(data) {
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "";
  };
  const blank = `<span style="color:#888;">-</span>`;
  const val = (x) => (x && x !== "-" ? escapeHtml(x) : blank);

  const today = format(new Date(), "dd-MMM-yyyy");
  const tag = v("tag_number", "tagNumber");
  const project = v("project_name", "projectName");
  const service = v("service_type", "serviceType");
  const fluid = v("fluid_type", "fluidType");
  const size = v("pipe_size", "pipeSize");
  const cls = v("pressure_class", "pressureClass");
  const dTemp = v("design_temp", "designTemp");
  const dPress = v("design_pressure", "designPressure");
  const installLoc = v("installation_location", "installationLocation");
  const vType = v("valve_type", "valveType");
  const vSub = v("valve_subtype", "valveSubtype");
  const op = v("operator_type", "operator");
  const body = v("body_material", "bodyMaterial");
  const bodySpec = v("body_material_spec", "bodyMaterialSpec");
  const materialGroup = data.materialRatingGroup || data.material_rating_group || {};
  const materialGroupLabel = materialGroup.label || "Verify exact ASME material group";
  const b165Table = materialGroup.b165Table || "ASME B16.5 Table 2 - verify exact group";
  const b1634Table = materialGroup.b1634Table || "ASME B16.34 Table A-1 - verify exact grade";
  const dataset = materialGroup.dataset || data.ratingDataset || {};
  const basis = deriveValveDatasheetBasis(data);
  const governance = getGovernanceSnapshot({ datasetMetadata: dataset, status: data.status });
  const generatedAt = data.generatedAt || governance.generatedAt;
  const datasetBasis =
    dataset.datasetVersion && dataset.verificationStatusLabel
      ? `${dataset.datasetVersion}; ${dataset.verificationStatusLabel}`
      : "Screening dataset - verify against licensed/current ASME tables";
  const seat = v("seat_material", "seatMaterial");
  const disc = v("disc_ball_material", "discBallMaterial");
  const stem = v("stem_material", "stemMaterial");
  const packing = v("packing", "packing");
  const gasket = v("gasket", "gasket");
  const endConn = v("end_connection", "endConnection");
  const endStd = v("end_connection_std", "endConnectionStd");
  const valveStd = v("valve_standard", "valveStandard");
  const f2f = v("face_to_face_std", "faceToFaceStd");
  const flangeStd = v("flange_standard", "flangeStandard");
  const testStd = v("testing_standard", "testingStandard");
  const status = data.status || "Issued for Review";
  const warnings = data.warnings || [];
  const alternatives = data.alternatives || [];
  const rationale = data.rationale || {};
  const reqs = data.additionalRequirements || data.additional_requirements || [];
  const dsNumber = tag ? `DS-${tag}` : "DS-XXXX";

  const vTypeLow = vType.toLowerCase();
  const isBall = vTypeLow.includes("ball");
  const isCheck = vTypeLow.includes("check");
  const isPSV = vTypeLow.includes("relief") || vTypeLow.includes("safety");
  const isGlobe = vTypeLow.includes("globe");
  const isPlug = vTypeLow.includes("plug");
  const isButterfly = vTypeLow.includes("butterfly");
  const isGate = vTypeLow.includes("gate");

  const has = (k) => reqs.some((r) => r.toLowerCase().includes(k));
  const bonnetType =
    isCheck || isPSV
      ? "N/A"
      : isGlobe || isGate
        ? "Bolted Bonnet, OS&Y"
        : isBall || isPlug || isButterfly
          ? "Bolted Body / Two-Piece"
          : "";

  const isSour =
    service.toLowerCase().includes("sour") ||
    service.toLowerCase().includes("h2s") ||
    service.toLowerCase().includes("amine");
  const isOxygen = service.toLowerCase().includes("oxygen");
  const isCryo = service.toLowerCase().includes("cryo") || (parseFloat(dTemp) || 0) < -29;
  const corrAllow = isSour ? "3.0 mm" : "1.5 mm";
  const phase = fluid.toLowerCase().includes("two")
    ? "Two-Phase"
    : fluid.toLowerCase().includes("gas") || fluid.toLowerCase().includes("vap")
      ? "Gas / Vapour"
      : fluid.toLowerCase().includes("steam")
        ? "Steam"
        : "Liquid";
  // Styles - A4 portrait, monochrome, print-ready
  const C = "#000";
  const BORDER = `1px solid ${C}`;
  const SHDR = `background:#d9d9d9;color:${C};font-weight:700;text-align:left;border:${BORDER};padding:4px 8px;font-size:8.5pt;text-transform:uppercase;letter-spacing:0.06em;`;
  const LBL = `background:#f2f2f2;color:${C};font-weight:600;border:${BORDER};padding:3px 6px;font-size:8pt;width:22%;`;
  const VAL = `background:#fff;color:${C};border:${BORDER};padding:3px 6px;font-size:8pt;font-variant-numeric:tabular-nums;`;
  const GAP = "border:none;width:6px;";

  const row2 = (l1, v1, l2, v2) => `<tr>
    <td style="${LBL}">${escapeHtml(l1)}</td><td style="${VAL}">${val(v1)}</td>
    <td style="${GAP}"></td>
    <td style="${LBL}">${escapeHtml(l2)}</td><td style="${VAL}">${val(v2)}</td>
  </tr>`;

  const row1 = (l, v) =>
    `<tr><td style="${LBL}">${escapeHtml(l)}</td><td colspan="4" style="${VAL}">${val(v)}</td></tr>`;

  const sectionHeader = (n, title) =>
    `<tr><td colspan="5" style="${SHDR}">SECTION ${escapeHtml(n)} - ${escapeHtml(title)}</td></tr>`;

  // Rationale text (concise)
  const rationaleText = (key) => {
    const r = rationale[key];
    if (!r) return null;
    const refs = (r.refs || []).join("; ");
    return `${r.reason}${refs ? `  [Ref: ${refs}]` : ""}`;
  };
  const rValveType = rationaleText("valveType");
  const rMaterials =
    rationaleText("bodyMaterial") || rationaleText("materials") || rationaleText("trim");
  const rEnds = rationaleText("endConnection");
  const rOperator = rationaleText("operator");

  const altRows = alternatives.length
    ? alternatives
        .map(
          (a) => `<tr>
        <td style="${VAL}width:30%;">${escapeHtml(a.type)}</td>
        <td style="${VAL}" colspan="4">${escapeHtml(a.reason)}</td>
      </tr>`,
        )
        .join("")
    : `<tr><td style="${VAL}" colspan="5">No alternatives recorded.</td></tr>`;

  const warnRows = warnings.length
    ? warnings
        .map(
          (w, i) => `<tr>
        <td style="${LBL}width:9%;">Note ${i + 1}</td>
        <td style="${VAL}" colspan="4">${escapeHtml(w)}</td>
      </tr>`,
        )
        .join("")
    : `<tr><td style="${VAL}" colspan="5">No engineering warnings raised by the selection engine.</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Manual Valve Datasheet - ${escapeHtml(tag || "Draft")}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background:#fff; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; color:#000; line-height:1.3; padding: 10mm; -webkit-font-smoothing: antialiased; }
  .sheet { max-width: 190mm; margin: 0 auto; background:#fff; }
  table { width: 100%; border-collapse: collapse; }
  td { vertical-align: middle; }
  .title-block { border:1.5px solid #000; margin-bottom:6px; }
  .title-block table { border:none; }
  .title-block td { border:none; padding:0; }
  .title-row { display:flex; align-items:stretch; border-bottom:1px solid #000; }
  .title-left { flex:1; padding:6px 10px; border-right:1px solid #000; }
  .title-right { width:42%; padding:6px 10px; text-align:right; }
  .title-left .co { font-weight:700; font-size:11pt; letter-spacing:0.06em; text-transform:uppercase; }
  .title-left .sub { font-size:7.5pt; color:#000; margin-top:1px; letter-spacing:0.04em; text-transform:uppercase; }
  .title-right h1 { font-size:11pt; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }
  .title-right .meta { font-size:7.5pt; margin-top:2px; }
  .section { margin-top: 4pt; }
  .alt-h th { background:#f2f2f2; border:1px solid #000; padding:3px 6px; font-size:7.5pt; text-transform:uppercase; text-align:left; font-weight:700; }
  .approval td { padding:4px 6px; font-size:7.5pt; }
  .footnote { font-size:7pt; color:#444; padding:3px 0 0; text-align:center; }
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    body { padding: 0; }
    .sheet { max-width: none; }
    tr, td { page-break-inside: avoid; }
  }
</style>
</head><body><div class="sheet">

<!-- ==== TITLE BLOCK ==== -->
<div class="title-block">
  <div class="title-row">
    <div class="title-left">
      <div class="co">${project ? escapeHtml(project) : "Company / Project Name"}</div>
      <div class="sub">Engineering - Mechanical / Piping Discipline</div>
    </div>
    <div class="title-right">
      <h1>Manual Valve Datasheet</h1>
      <div class="meta">Doc No. <b>${dsNumber}</b> &nbsp;|&nbsp; Rev <b>0</b> &nbsp;|&nbsp; ${today}</div>
      <div class="meta">Status: <b>${status}</b></div>
    </div>
  </div>
  <table>
    <tr>
      <td style="${LBL}">Client</td><td style="${VAL}">${blank}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}">Project No.</td><td style="${VAL}">${blank}</td>
    </tr>
    <tr>
      <td style="${LBL}">Line No.</td><td style="${VAL}">${blank}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}">Tag No.</td><td style="${VAL}">${val(tag)}</td>
    </tr>
    <tr>
      <td style="${LBL}">Service Description</td><td style="${VAL}">${val(service)}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}">P&amp;ID Reference</td><td style="${VAL}">${blank}</td>
    </tr>
    <tr>
      <td style="${LBL}">Prepared By</td><td style="${VAL}">${blank}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}">Checked By</td><td style="${VAL}">${blank}</td>
    </tr>
    <tr>
      <td style="${LBL}">Approved By</td><td style="${VAL}">${blank}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}">Date</td><td style="${VAL}">${today}</td>
    </tr>
  </table>
</div>

<table class="section"><tbody>
${sectionHeader(1, "Design Conditions")}
${row2("Fluid / Service", service, "Phase", phase)}
${row2("Design Pressure", dPress ? `${dPress} barg` : "", "Design Temperature", dTemp ? `${dTemp} deg C` : "")}
${row2("Operating Pressure", "", "Operating Temperature", "")}
${row2("Corrosion Allowance", corrAllow, "Special Service", isSour ? "Sour (NACE MR0175)" : isOxygen ? "Oxygen Cleaned" : isCryo ? "Cryogenic" : "Standard")}
${row1("Installation Location", installLoc)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(2, "Valve Identification")}
${row2("Valve Type", vType, "Valve Subtype", vSub)}
${row2("Size (NPS / DN)", size, "Pressure Class (ASME)", cls)}
${row2("End Connection", endConn, "End Connection Standard", endStd)}
${row2("Face-to-Face Standard", f2f, "Flange Standard", flangeStd)}
${row2("Design Standard", valveStd, "Testing Standard", testStd)}
${row2("Bore", basis.bore, "P-T Rating Basis", `${materialGroupLabel}; ${b165Table}`)}
${row1("Rating Dataset Status", datasetBasis)}
${row2("App Version", APP_GOVERNANCE.appVersion, "Release ID", APP_GOVERNANCE.releaseId)}
${row2("Readiness", APP_GOVERNANCE.defaultReadiness, "Generated At", generatedAt)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(3, "Materials of Construction")}
${row2("Body Material", body, "Body Material Spec.", bodySpec)}
${row2("ASME Material Group", materialGroupLabel, "B16.34 Body Basis", b1634Table)}
${row2("Bonnet / Cover Material", bonnetType, "Trim Material", disc)}
${row2("Seat Material", seat, "Stem / Shaft Material", stem)}
${row1("Sealing System", basis.sealingSystem)}
${row1("Seat Leakage Basis", basis.seatLeakageBasis)}
${row2("Gasket Material", gasket, "Packing Material", packing)}
${row1("Bolting Material", isSour ? "ASTM A193 B7M / A194 2HM (NACE)" : "ASTM A193 B7 / A194 2H")}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(4, "Features &amp; Requirements")}
${row2("Fire Safe Basis", basis.fireSafeRequirement, "Anti-Static Device", basis.antiStaticDevice)}
${row2("Stem / Shaft Retention", basis.blowoutProofStem, "Cavity Relief", basis.cavityRelief)}
${row2("Fugitive Emission Compliance", basis.fugitiveEmission, "NACE MR0175 Compliance", basis.isSour ? "Required" : "Not required")}
${row2("Oxygen Cleaned", basis.isOxygen ? "Required - verify cleaning spec" : "N/A", "Cryogenic Extension", basis.isCryo ? "Required - verify cryogenic valve design" : "N/A")}
${row2("Locking Device", basis.lockingDevice, "Position Indicator", basis.positionIndicator)}
${row2("Shell Test Basis", basis.shellTest, "Seat Test Basis", basis.seatLeakageBasis)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(5, "Operation")}
${row2("Operator Type", op, "Operation Requirement", basis.operationRequirement)}
${row2("Fail Position", basis.failPosition, "Direction of Operation", basis.operationDirection)}
${row1("Torque / Operator Sizing", basis.torqueSizing)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(6, "Installation &amp; Service Requirements")}
${row2("Installation Location", installLoc, "Orientation Limitation", basis.orientationLimitation)}
${row2("Pigging Requirement", has("piggable") ? "Full Bore - piggable" : "Not required", "Bidirectional Sealing", basis.bidirectionalSealing)}
${row1("Maintenance Access Notes", "Provide handwheel / gear access; allow space for actuator removal and bonnet lifting.")}
</tbody></table>
<table class="section"><tbody>
${sectionHeader(7, "Engineering Notes &amp; Warnings")}
${warnRows}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(8, "Selected Basis / Rationale")}
${rValveType ? row1("Valve Type Basis", rValveType) : ""}
${rMaterials ? row1("Materials Basis", rMaterials) : ""}
${rEnds ? row1("End Connection Basis", rEnds) : ""}
${rOperator ? row1("Operator Basis", rOperator) : ""}
${!rValveType && !rMaterials && !rEnds && !rOperator ? row1("Selection Basis", "Selection performed per API 615 Recommended Practice; refer to Section 9 for considered alternatives.") : ""}
${row1("Data Governance Note", dataset.releaseGate || "ASME ratings are screening data and must be checked against licensed/current standards before issue for procurement or fabrication.")}
${row1("Dataset Classification", getDatasetUseLabel(dataset))}
${row1("User Responsibility", USER_RESPONSIBILITY_NOTICE)}
${row1("Standards Notice", STANDARDS_COPYRIGHT_NOTICE)}
${row1("Export Limitation", EXPORT_GOVERNANCE_NOTICE)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(9, "Alternatives Considered")}
<tr class="alt-h"><th style="width:30%;">Valve Type</th><th colspan="4">Reason Rejected / Alternative Use</th></tr>
${altRows}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(10, "Revision &amp; Approval")}
<tr class="alt-h">
  <th style="width:7%;">Rev</th>
  <th style="width:36%;">Description</th>
  <th style="width:14%;">Date</th>
  <th style="width:14%;">Prepared</th>
  <th>Checked / Approved</th>
</tr>
<tr>
  <td style="${VAL}">0</td>
  <td style="${VAL}">${status}</td>
  <td style="${VAL}">${today}</td>
  <td style="${VAL}">${blank}</td>
  <td style="${VAL}">${blank}</td>
</tr>
<tr>
  <td style="${VAL}">&nbsp;</td><td style="${VAL}">&nbsp;</td><td style="${VAL}">&nbsp;</td><td style="${VAL}">&nbsp;</td><td style="${VAL}">&nbsp;</td>
</tr>
</tbody></table>

<div class="footnote">Generated by ${APP_GOVERNANCE.appName} ${APP_GOVERNANCE.appVersion} (${APP_GOVERNANCE.releaseId}) at ${generatedAt}. ${APP_GOVERNANCE.classification} ${EXPORT_GOVERNANCE_NOTICE}</div>

</div></body></html>`;
}

// --- Excel export: structured Manual Valve Datasheet ---
export function exportDatasheetToExcel(data) {
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "";
  };
  const today = format(new Date(), "dd-MMM-yyyy");
  const tag = v("tag_number", "tagNumber");
  const project = v("project_name", "projectName");
  const service = v("service_type", "serviceType");
  const fluid = v("fluid_type", "fluidType");
  const size = v("pipe_size", "pipeSize");
  const cls = v("pressure_class", "pressureClass");
  const dTemp = v("design_temp", "designTemp");
  const dPress = v("design_pressure", "designPressure");
  const installLoc = v("installation_location", "installationLocation");
  const vType = v("valve_type", "valveType");
  const vSub = v("valve_subtype", "valveSubtype");
  const op = v("operator_type", "operator");
  const body = v("body_material", "bodyMaterial");
  const bodySpec = v("body_material_spec", "bodyMaterialSpec");
  const materialGroup = data.materialRatingGroup || data.material_rating_group || {};
  const materialGroupLabel = materialGroup.label || "Verify exact ASME material group";
  const b165Table = materialGroup.b165Table || "ASME B16.5 Table 2 - verify exact group";
  const b1634Table = materialGroup.b1634Table || "ASME B16.34 Table A-1 - verify exact grade";
  const dataset = materialGroup.dataset || data.ratingDataset || {};
  const basis = deriveValveDatasheetBasis(data);
  const governance = getGovernanceSnapshot({ datasetMetadata: dataset, status: data.status });
  const generatedAt = data.generatedAt || governance.generatedAt;
  const datasetBasis =
    dataset.datasetVersion && dataset.verificationStatusLabel
      ? `${dataset.datasetVersion}; ${dataset.verificationStatusLabel}`
      : "Screening dataset - verify against licensed/current ASME tables";
  const seat = v("seat_material", "seatMaterial");
  const disc = v("disc_ball_material", "discBallMaterial");
  const stem = v("stem_material", "stemMaterial");
  const packing = v("packing", "packing");
  const gasket = v("gasket", "gasket");
  const endConn = v("end_connection", "endConnection");
  const endStd = v("end_connection_std", "endConnectionStd");
  const valveStd = v("valve_standard", "valveStandard");
  const f2f = v("face_to_face_std", "faceToFaceStd");
  const flangeStd = v("flange_standard", "flangeStandard");
  const testStd = v("testing_standard", "testingStandard");
  const warnings = data.warnings || [];
  const alternatives = data.alternatives || [];
  const dsNum = tag ? `DS-${tag}` : "DS-XXXX";

  const TH =
    "background:#d9d9d9;font-weight:700;border:1px solid #000;padding:4px 6px;font-size:10pt;text-transform:uppercase;";
  const SH =
    "background:#f2f2f2;font-weight:700;border:1px solid #000;padding:4px 6px;font-size:10pt;";
  const LBL =
    "background:#fafafa;font-weight:600;border:1px solid #000;padding:3px 6px;font-size:10pt;";
  const VAL =
    "background:#fff;border:1px solid #000;padding:3px 6px;font-size:10pt;mso-number-format:'\\@';";

  const sec = (n, title) =>
    `<tr><td colspan="4" style="${SH}">SECTION ${escapeExcelCell(n)} - ${escapeExcelCell(String(title).toUpperCase())}</td></tr>`;
  const r2 = (l1, v1, l2, v2) =>
    `<tr><td style="${LBL}">${escapeExcelCell(l1)}</td><td style="${VAL}">${escapeExcelCell(v1 || "")}</td><td style="${LBL}">${escapeExcelCell(l2)}</td><td style="${VAL}">${escapeExcelCell(v2 || "")}</td></tr>`;
  const r1 = (l, v) =>
    `<tr><td style="${LBL}">${escapeExcelCell(l)}</td><td colspan="3" style="${VAL}">${escapeExcelCell(v || "")}</td></tr>`;

  const isSour = service.toLowerCase().includes("sour") || service.toLowerCase().includes("h2s");
  const phase = fluid.toLowerCase().includes("two")
    ? "Two-Phase"
    : fluid.toLowerCase().includes("gas")
      ? "Gas / Vapour"
      : fluid.toLowerCase().includes("steam")
        ? "Steam"
        : "Liquid";

  const datasheetTable = `
<table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
<tr><td colspan="4" style="${TH}text-align:center;font-size:13pt;">MANUAL VALVE DATASHEET</td></tr>
${r2("Doc No.", dsNum, "Rev", "0")}
${r2("Date", today, "Status", data.status || "Issued for Review")}
${r2("Generated At", generatedAt, "Readiness", APP_GOVERNANCE.defaultReadiness)}
${r2("App Version", APP_GOVERNANCE.appVersion, "Release ID", APP_GOVERNANCE.releaseId)}
${r2("Project", project, "Client", "")}
${r2("Project No.", "", "Line No.", "")}
${r2("Tag No.", tag, "Service", service)}
${r2("Prepared By", "", "Checked By", "")}
${r1("Approved By", "")}
${sec(1, "Design Conditions")}
${r2("Fluid / Service", service, "Phase", phase)}
${r2("Design Pressure (barg)", dPress, "Design Temperature (deg C)", dTemp)}
${r2("Operating Pressure", "", "Operating Temperature", "")}
${r2("Corrosion Allowance", isSour ? "3.0 mm" : "1.5 mm", "Special Service", isSour ? "Sour (NACE MR0175)" : "Standard")}
${r1("Installation Location", installLoc)}
${sec(2, "Valve Identification")}
${r2("Valve Type", vType, "Valve Subtype", vSub)}
${r2("Size (NPS)", size, "Pressure Class (ASME)", cls)}
${r2("End Connection", endConn, "End Connection Std", endStd)}
${r2("Face-to-Face Std", f2f, "Flange Standard", flangeStd)}
${r2("Design Standard", valveStd, "Testing Standard", testStd)}
${r2("P-T Rating Basis", `${materialGroupLabel}; ${b165Table}`, "B16.34 Body Basis", b1634Table)}
${r2("Rating Dataset", datasetBasis, "Release Gate", dataset.releaseGate || "ASME verification required")}
${r2("Dataset Classification", getDatasetUseLabel(dataset), "Dataset Owner", dataset.owner || governance.datasetOwner)}
${r2("Dataset Reviewer", dataset.reviewer || governance.datasetReviewer, "Approval Date", dataset.approvedAt || "Pending")}
${sec(3, "Materials of Construction")}
${r2("Body Material", body, "Body Material Spec", bodySpec)}
${r2("ASME Material Group", materialGroupLabel, "Body Rating Source", b1634Table)}
${r2("Bonnet / Cover", "", "Trim Material", disc)}
${r2("Seat Material", seat, "Stem Material", stem)}
${r1("Sealing System", basis.sealingSystem)}
${r1("Seat Leakage Basis", basis.seatLeakageBasis)}
${r2("Gasket", gasket, "Packing", packing)}
${r1("Bolting", isSour ? "ASTM A193 B7M / A194 2HM (NACE)" : "ASTM A193 B7 / A194 2H")}
${sec(4, "Features & Requirements")}
${r2("Fire Safe Basis", basis.fireSafeRequirement, "Anti-Static Device", basis.antiStaticDevice)}
${r2("Stem / Shaft Retention", basis.blowoutProofStem, "Cavity Relief", basis.cavityRelief)}
${r2("Fugitive Emission", basis.fugitiveEmission, "NACE MR0175", basis.isSour ? "Required" : "Not required")}
${r2("Oxygen Cleaned", basis.isOxygen ? "Required - verify cleaning spec" : "N/A", "Cryogenic Extension", basis.isCryo ? "Required - verify cryogenic valve design" : "N/A")}
${r2("Locking Device", basis.lockingDevice, "Position Indicator", basis.positionIndicator)}
${r2("Shell Test Basis", basis.shellTest, "Seat Test Basis", basis.seatLeakageBasis)}
${sec(5, "Operation")}
${r2("Operator Type", op, "Operation Requirement", basis.operationRequirement)}
${r2("Fail Position", basis.failPosition, "Direction of Operation", basis.operationDirection)}
${r1("Torque / Operator Sizing", basis.torqueSizing)}
${sec(6, "Installation & Service")}
${r2("Installation Location", installLoc, "Orientation Limitation", basis.orientationLimitation)}
${r2("Pigging Requirement", basis.bore.includes("pigging") ? "Full Bore - piggable" : "Not required", "Bidirectional Sealing", basis.bidirectionalSealing)}
${sec(7, "Engineering Notes & Warnings")}
${
  warnings.length
    ? warnings
        .map(
          (w, i) =>
            `<tr><td style="${LBL}">Note ${i + 1}</td><td colspan="3" style="${VAL}">${escapeExcelCell(w)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" style="${VAL}">No engineering warnings.</td></tr>`
}
${sec(8, "Governance & Export Limitations")}
${r1("Tool Classification", APP_GOVERNANCE.classification)}
${r1("User Responsibility", USER_RESPONSIBILITY_NOTICE)}
${r1("Standards Notice", STANDARDS_COPYRIGHT_NOTICE)}
${r1("Export Limitation", EXPORT_GOVERNANCE_NOTICE)}
</table>`;

  const altTable = `
<br/><br/>
<table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
<tr><td colspan="3" style="${TH}text-align:center;font-size:13pt;">ALTERNATIVES CONSIDERED</td></tr>
<tr><td style="${SH}width:8%;">#</td><td style="${SH}width:30%;">Valve Type</td><td style="${SH}">Reason Rejected / Alternative Use</td></tr>
${
  alternatives.length
    ? alternatives
        .map(
          (a, i) =>
            `<tr><td style="${VAL}">${i + 1}</td><td style="${VAL}">${escapeExcelCell(a.type)}</td><td style="${VAL}">${escapeExcelCell(a.reason)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" style="${VAL}">None recorded.</td></tr>`
}
</table>`;

  // Multi-sheet workbook via Excel XML "Spreadsheet 2003" workaround using HTML with x:Name sheets
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets>
<x:ExcelWorksheet><x:Name>Datasheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
<x:ExcelWorksheet><x:Name>Alternatives</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
</x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>body{font-family:Arial,sans-serif;}</style></head>
<body>
<div>${datasheetTable}</div>
<div style="page-break-before:always;">${altTable}</div>
</body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ValveDatasheet_${safeExportFilename(tag, "Draft")}_${today}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data) {
  exportDatasheetToExcel(data);
}
