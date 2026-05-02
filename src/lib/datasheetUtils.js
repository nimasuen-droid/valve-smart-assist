// Utilities for PDF and Excel export of valve datasheets
import { format } from "date-fns";

export function buildDatasheetRows(data) {
  // Works with both a "saved" entity (snake_case) and a live result (camelCase merged)
  const get = (snake, camel) => data[snake] ?? data[camel] ?? "—";
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
          ["Design Temperature (°C)", get("design_temp", "designTemp")],
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

export function generatePdfHtml(data) {
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "";
  };
  const blank = `<span style="color:#888;">—</span>`;
  const val = (x) => (x && x !== "—" ? String(x) : blank);

  const today      = format(new Date(), "dd-MMM-yyyy");
  const tag        = v("tag_number", "tagNumber");
  const project    = v("project_name", "projectName");
  const service    = v("service_type", "serviceType");
  const fluid      = v("fluid_type", "fluidType");
  const fn         = v("valve_function", "valveFunction");
  const size       = v("pipe_size", "pipeSize");
  const cls        = v("pressure_class", "pressureClass");
  const dTemp      = v("design_temp", "designTemp");
  const dPress     = v("design_pressure", "designPressure");
  const installLoc = v("installation_location", "installationLocation");
  const vType      = v("valve_type", "valveType");
  const vSub       = v("valve_subtype", "valveSubtype");
  const op         = v("operator_type", "operator");
  const body       = v("body_material", "bodyMaterial");
  const bodySpec   = v("body_material_spec", "bodyMaterialSpec");
  const seat       = v("seat_material", "seatMaterial");
  const disc       = v("disc_ball_material", "discBallMaterial");
  const stem       = v("stem_material", "stemMaterial");
  const packing    = v("packing", "packing");
  const gasket     = v("gasket", "gasket");
  const endConn    = v("end_connection", "endConnection");
  const endStd     = v("end_connection_std", "endConnectionStd");
  const valveStd   = v("valve_standard", "valveStandard");
  const f2f        = v("face_to_face_std", "faceToFaceStd");
  const flangeStd  = v("flange_standard", "flangeStandard");
  const testStd    = v("testing_standard", "testingStandard");
  const fireSafe   = (data.fire_safe ?? data.fireSafe);
  const status     = data.status || "Issued for Review";
  const warnings   = data.warnings || [];
  const alternatives = data.alternatives || [];
  const rationale  = data.rationale || {};
  const reqs       = data.additionalRequirements || data.additional_requirements || [];
  const dsNumber   = tag ? `DS-${tag}` : "DS-XXXX";

  const vTypeLow    = vType.toLowerCase();
  const isBall      = vTypeLow.includes("ball");
  const isCheck     = vTypeLow.includes("check");
  const isPSV       = vTypeLow.includes("relief") || vTypeLow.includes("safety");
  const isGlobe     = vTypeLow.includes("globe");
  const isPlug      = vTypeLow.includes("plug");
  const isButterfly = vTypeLow.includes("butterfly");
  const isGate      = vTypeLow.includes("gate");

  const has = (k) => reqs.some((r) => r.toLowerCase().includes(k));
  const yesNo = (b, yLabel = "Yes", nLabel = "No") => (b ? yLabel : nLabel);

  const bonnetType = isCheck || isPSV
    ? "N/A"
    : isGlobe || isGate
      ? "Bolted Bonnet, OS&Y"
      : isBall || isPlug || isButterfly
        ? "Bolted Body / Two-Piece"
        : "";

  const boreType = (isBall || isGate || isPlug)
    ? (vSub.toLowerCase().includes("reduced") ? "Reduced Bore (RB)" : "Full Bore (FB)")
    : (has("piggable") ? "Full Bore (FB) — Pigging" : "");

  const isSour     = service.toLowerCase().includes("sour") || service.toLowerCase().includes("h2s") || service.toLowerCase().includes("amine");
  const isOxygen   = service.toLowerCase().includes("oxygen");
  const isCryo     = service.toLowerCase().includes("cryo") || (parseFloat(dTemp) || 0) < -29;
  const tempNum    = parseFloat(dTemp) || 0;
  const pressNum   = parseFloat(dPress) || 0;
  const classNum   = parseInt((cls || "").replace(/\D/g, "")) || 0;
  const corrAllow  = isSour ? "3.0 mm" : "1.5 mm";
  const phase      = fluid.toLowerCase().includes("two") ? "Two-Phase" : fluid.toLowerCase().includes("gas") || fluid.toLowerCase().includes("vap") ? "Gas / Vapour" : fluid.toLowerCase().includes("steam") ? "Steam" : "Liquid";
  const hydroP     = pressNum > 0 ? `${(pressNum * 1.5).toFixed(0)} barg (1.5× Design) per API 598` : "1.5× Design per API 598";

  // Styles — A4 portrait, monochrome, print-ready
  const C = "#000";
  const BORDER = `1px solid ${C}`;
  const SHDR = `background:#d9d9d9;color:${C};font-weight:700;text-align:left;border:${BORDER};padding:4px 8px;font-size:8.5pt;text-transform:uppercase;letter-spacing:0.06em;`;
  const LBL  = `background:#f2f2f2;color:${C};font-weight:600;border:${BORDER};padding:3px 6px;font-size:8pt;width:22%;`;
  const VAL  = `background:#fff;color:${C};border:${BORDER};padding:3px 6px;font-size:8pt;font-variant-numeric:tabular-nums;`;
  const GAP  = "border:none;width:6px;";

  const row2 = (l1, v1, l2, v2) => `<tr>
    <td style="${LBL}">${l1}</td><td style="${VAL}">${val(v1)}</td>
    <td style="${GAP}"></td>
    <td style="${LBL}">${l2}</td><td style="${VAL}">${val(v2)}</td>
  </tr>`;

  const row1 = (l, v) => `<tr><td style="${LBL}">${l}</td><td colspan="4" style="${VAL}">${val(v)}</td></tr>`;

  const sectionHeader = (n, title) =>
    `<tr><td colspan="5" style="${SHDR}">SECTION ${n} — ${title}</td></tr>`;

  // Rationale text (concise)
  const rationaleText = (key) => {
    const r = rationale[key];
    if (!r) return null;
    const refs = (r.refs || []).join("; ");
    return `${r.reason}${refs ? `  [Ref: ${refs}]` : ""}`;
  };
  const rValveType = rationaleText("valveType");
  const rMaterials = rationaleText("bodyMaterial") || rationaleText("materials") || rationaleText("trim");
  const rEnds      = rationaleText("endConnection");
  const rOperator  = rationaleText("operator");

  const altRows = alternatives.length
    ? alternatives.map((a) => `<tr>
        <td style="${VAL}width:30%;">${a.type}</td>
        <td style="${VAL}" colspan="4">${a.reason}</td>
      </tr>`).join("")
    : `<tr><td style="${VAL}" colspan="5">No alternatives recorded.</td></tr>`;

  const warnRows = warnings.length
    ? warnings.map((w, i) => `<tr>
        <td style="${LBL}width:9%;">Note ${i + 1}</td>
        <td style="${VAL}" colspan="4">${w}</td>
      </tr>`).join("")
    : `<tr><td style="${VAL}" colspan="5">No engineering warnings raised by the selection engine.</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Manual Valve Datasheet — ${tag || "Draft"}</title>
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

<!-- ════ TITLE BLOCK ════ -->
<div class="title-block">
  <div class="title-row">
    <div class="title-left">
      <div class="co">${val(project) === blank ? "Company / Project Name" : project}</div>
      <div class="sub">Engineering — Mechanical / Piping Discipline</div>
    </div>
    <div class="title-right">
      <h1>Manual Valve Datasheet</h1>
      <div class="meta">Doc No. <b>${dsNumber}</b> &nbsp;·&nbsp; Rev <b>0</b> &nbsp;·&nbsp; ${today}</div>
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
${row2("Design Pressure", dPress ? `${dPress} barg` : "", "Design Temperature", dTemp ? `${dTemp} °C` : "")}
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
${row2("Bore", boreType, "P-T Rating Basis", `ASME B16.34 / B16.5 ${cls}`)}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(3, "Materials of Construction")}
${row2("Body Material", body, "Body Material Spec.", bodySpec)}
${row2("Bonnet / Cover Material", bonnetType, "Trim Material", disc)}
${row2("Seat Material", seat, "Stem / Shaft Material", stem)}
${row2("Gasket Material", gasket, "Packing Material", packing)}
${row1("Bolting Material", isSour ? "ASTM A193 B7M / A194 2HM (NACE)" : "ASTM A193 B7 / A194 2H")}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(4, "Features &amp; Requirements")}
${row2("Fire Safe (API 607)", isCheck || isPSV || isGlobe ? "N/A" : yesNo(fireSafe), "Anti-Static Device", isBall || isPlug ? yesNo(has("anti-static") || true) : "N/A")}
${row2("Blow-out Proof Stem", isCheck || isPSV ? "N/A" : "Yes", "Cavity Relief", (isBall || isPlug) ? yesNo(has("cavity") || has("bidirectional")) : "N/A")}
${row2("Fugitive Emission Compliance", has("low emission") || has("fugitive") ? "Yes — ISO 15848-1 / API 622" : "Standard", "NACE MR0175 Compliance", isSour ? "Required" : "Not required")}
${row2("Oxygen Cleaned", isOxygen ? "Required — ASTM G93 Level C" : "N/A", "Cryogenic Extension", isCryo || has("cryogenic") ? "Required — BS 6364" : "N/A")}
${row2("Locking Device", "Yes — LO/LC capable", "Position Indicator", isCheck || isPSV ? "N/A" : "Yes")}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(5, "Operation")}
${row2("Operator Type", isCheck || isPSV ? "N/A" : op, "Operation Requirement", has("esd") ? "Actuator-Ready (ESD)" : "Manual")}
${row2("Fail Position", has("esd") ? "Fail Safe Close (FSC)" : "N/A", "Direction of Operation", isCheck || isPSV ? "N/A" : "Clockwise to Close")}
${row1("Torque / Operator Sizing", "Per manufacturer; verify max rim pull ≤ 360 N (EN 12570)")}
</tbody></table>

<table class="section"><tbody>
${sectionHeader(6, "Installation &amp; Service Requirements")}
${row2("Installation Location", installLoc, "Orientation Limitation", isCheck ? "Per manufacturer (swing/dual-plate)" : "Any")}
${row2("Pigging Requirement", has("piggable") ? "Full Bore — piggable" : "Not required", "Bidirectional Sealing", has("bidirectional") ? "Required" : (isBall || isGate) ? "Yes (default)" : "N/A")}
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

<div class="footnote">Generated by Valve Selection Guide — basis: API 615 / ASME B16.34 / ASME B16.5 / API 598. This datasheet shall be reviewed and approved by a competent engineer prior to issue.</div>

</div></body></html>`;
}

// ─── Excel export: Official Ball Valve Template (API 615) ───
export function exportDatasheetToExcel(data) {
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "TBA";
  };
  
  const today = format(new Date(), "dd-MMM-yyyy");
  const tag = v("tag_number", "tagNumber");
  const project = v("project_name", "projectName");
  const service = v("service_type", "serviceType");
  const fluid = v("fluid_type", "fluidType");
  const fn = v("valve_function", "valveFunction");
  const size = v("pipe_size", "pipeSize");
  const cls = v("pressure_class", "pressureClass");
  const dTemp = v("design_temp", "designTemp");
  const dPress = v("design_pressure", "designPressure");
  const vType = v("valve_type", "valveType");
  const vSub = v("valve_subtype", "valveSubtype");
  const op = v("operator_type", "operator");
  const body = v("body_material", "bodyMaterial");
  const bodySpec = v("body_material_spec", "bodyMaterialSpec");
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
  const fireSafe = (data.fire_safe ?? data.fireSafe) ? "Yes – API 607" : "No";
  
  const pressNum = parseFloat(dPress) || 0;
  const tempNum = parseFloat(dTemp) || 0;
  const classNum = parseInt((cls || "").replace(/\D/g, "")) || 150;
  
  const bonnetVal = bodySpec !== "TBA" ? bodySpec : "TBA";
  const hydroRec = pressNum > 0 ? `${(pressNum * 1.5).toFixed(0)} barg (1.5× design) per API 598` : "TBA";
  const radioRec = classNum >= 600 ? "Required — RT per ASME B16.34 §6.1 (Class ≥ 600)" : "Not required";
  const dsNum = tag !== "TBA" ? `DS-${tag}` : "DS-TBA";
  const ptRating = `ASME B16.5 ${cls}`;

  const HEAD = "background:#4472C4;color:#fff;font-weight:700;border:1px solid #000;padding:3px 4px;font-size:9pt;text-align:center;";
  const LBL = "background:#D9E1F2;font-weight:600;border:1px solid #000;padding:2px 4px;font-size:9pt;";
  const VAL = "background:#fff;border:1px solid #000;padding:2px 4px;font-size:9pt;";

  const row2 = (l1, v1, l2, v2) => `<tr><td style="${LBL}">${l1}</td><td style="${VAL}">${v1 ?? ""}</td><td style="${LBL}">${l2}</td><td style="${VAL}">${v2 ?? ""}</td></tr>`;
  const secRow = (left, right) => `<tr><td colspan="2" style="${HEAD}">${left}</td><td colspan="2" style="${HEAD}">${right}</td></tr>`;
  const fullSec = (txt) => `<tr><td colspan="4" style="${HEAD}">${txt}</td></tr>`;

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:9pt;padding:6px;}table{border-collapse:collapse;width:100%;border:1px solid #000;}td{vertical-align:top;}</style></head><body><table><tbody>
<tr><td colspan="4" style="text-align:center;font-weight:700;font-size:12pt;border:1px solid #000;padding:3px;background:#fff;">DATA SHEET FOR ${vType.toUpperCase()}</td></tr>
<tr><td colspan="4" style="text-align:center;font-size:9pt;border:1px solid #000;padding:2px;background:#fff;">Per API 615 Recommended Practice</td></tr>
${row2("Equipment Name:", `${vType}${vSub !== "TBA" ? " – " + vSub : ""}`, "Plant / Location:", project)}
${row2("Service:", service, "Manufacturer:", "TBA")}
${row2("Tag No.:", tag, "Make / Model:", "TBA")}
${row2("P&amp;ID No.:", "TBA", "Supplier:", "TBA")}
${row2("Requisition / P.O. No.:", "TBA", "Date:", today)}
${row2("Datasheet No.:", dsNum, "Status:", data.status || "Draft")}
${secRow("SERVICE DETAILS", "MATERIALS OF CONSTRUCTION")}
${row2("Valve Number / Tag:", tag, "Body Material:", body)}
${row2("Nominal Size (NPS):", size, "Body Material Spec:", bodySpec)}
${row2("ANSI Rating (Class):", cls, "Seat Material:", seat)}
${row2("End Connection:", endConn, "Ball Material:", disc)}
${row2("Valve Type:", vType, "Stem Material:", stem)}
${row2("Full Bore / Reduced Bore:", "Full Bore (FB)", "Packing Type / Material:", packing)}
${row2("Valve Subtype / Construction:", vSub, "Gasket:", gasket)}
${row2("Valve Function:", fn, "Bonnet Material:", bonnetVal)}
${row2("Design Life:", "TBA", "Bolts &amp; Nuts:", "TBA")}
${row2("Frequency of Operation:", "TBA", "Temperature Limits (Min/Max °C):", tempNum ? `TBA / ${dTemp}°C` : "TBA")}
${row2("Operator / Turns to Close:", op, "Fire Safe:", fireSafe)}
${secRow("PROCESS CONDITIONS", "STANDARDS &amp; TESTING")}
${row2("Design Pressure:", dPress ? `${dPress} barg` : "TBA", "Valve Design Standard:", valveStd)}
${row2("Design Temp. Min / Max:", tempNum ? `TBA / ${dTemp}°C` : "TBA", "Face-to-Face Standard:", f2f)}
${row2("Operating Pressure:", "TBA", "Flange Standard:", flangeStd)}
${row2("Operating Temperature:", "TBA", "End Connection Standard:", endStd)}
${row2("Fluid Type / State:", fluid, "Testing Standard:", testStd)}
${row2("Sour Service (NACE MR0175):", "N/A", "Hydrostatic Test:", hydroRec)}
${row2("Fire Safe:", fireSafe, "Seat Leak Test:", "Per API 598 Table 2")}
${row2("ANSI P-T Rating:", ptRating, "Material Certification:", "EN 10204 Type 3.1 — manufacturer")}
${secRow("ADDITIONAL REQUIREMENTS", "EXTERNAL PROTECTION")}
${row2("Actuator / Special Operator:", "TBA", "Painting:", "2-coat epoxy primer + topcoat, ISO 12944 C3")}
${row2("ATEX / IECEx Required:", "N/A", "To suit environment:", "Onshore plant — carbon steel with primer + protective coating")}
${row2("Low Emission (API 622):", "Yes – API 622 Class A", "To suit insulation over:", "N/A")}
${row2("ESD / SIS Function:", "TBA", "Estimated Weight – Shipping (kg):", "TBA")}
${row2("Bidirectional / Cavity Relief:", "TBA", "Estimated Weight – Operating (kg):", "TBA")}
${row2("Face-to-Face Dimension (mm):", "TBA", "NACE MR0175 Required:", "N/A")}
${fullSec("TEST REQUIREMENTS")}
${row2("Hydrostatic Test:", hydroRec, "EAL Inspection:", "Manufacturer works inspection")}
${row2("Leak Test:", "Per API 598 Table 2", "Material Certification:", "EN 10204 Type 3.1 — manufacturer")}
${row2("Radiography:", radioRec, "NACE MR0175 Certification:", "N/A")}
${fullSec("ENGINEERING NOTES &amp; WARNINGS")}
${(data.warnings || []).map((w, i) => `<tr><td style="${LBL}">Note ${i + 1}:</td><td colspan="3" style="${VAL}">⚠ ${w}</td></tr>`).join("")}
${(data.warnings || []).length < 5 ? `<tr><td style="${LBL}">Note ${(data.warnings || []).length + 1}:</td><td colspan="3" style="${VAL}">TBA — Additional notes to be added by engineer.</td></tr>` : ""}
${(data.warnings || []).length < 4 ? `<tr><td style="${LBL}">Note ${(data.warnings || []).length + 2}:</td><td colspan="3" style="${VAL}">TBA</td></tr>` : ""}
<tr><td style="${LBL}">Rev.</td><td style="${LBL}">Date</td><td style="${LBL}">Originated</td><td style="${LBL}">Checked</td></tr>
<tr><td style="${VAL}">0</td><td style="${VAL}">${today}</td><td style="${VAL}">TBA</td><td style="${VAL}">TBA</td></tr>
<tr><td colspan="2" style="border:1px solid #000;padding:2px 4px;font-size:8pt;">Generated by Valve Selection Guide — API 615 Based</td><td style="${LBL}">Client Name:</td><td style="${VAL}">TBA</td></tr>
<tr><td colspan="2" style="border:1px solid #000;padding:2px 4px;"></td><td style="${LBL}">Project Title:</td><td style="${VAL}">${project}</td></tr>
<tr><td colspan="2" style="border:1px solid #000;padding:2px 4px;"></td><td style="${LBL}">Datasheet No.:</td><td style="${VAL}">${dsNum}</td></tr>
</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ValveDatasheet_${tag !== "TBA" ? tag : "Draft"}_${today}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// exportToExcel — alias used from SavedSelections page
export function exportToExcel(data) {
  exportDatasheetToExcel(data);
}
