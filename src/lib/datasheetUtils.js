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
  // ── value helper ──
  const v = (snake, camel) => {
    const val = data[snake] ?? data[camel];
    return val !== undefined && val !== null && val !== "" ? String(val) : "";
  };

  const today      = format(new Date(), "dd-MMM-yyyy");
  const tag        = v("tag_number",          "tagNumber")        || "—";
  const project    = v("project_name",        "projectName")      || "—";
  const service    = v("service_type",        "serviceType")      || "—";
  const fluid      = v("fluid_type",          "fluidType")        || "—";
  const fn         = v("valve_function",      "valveFunction")    || "—";
  const size       = v("pipe_size",           "pipeSize")         || "—";
  const cls        = v("pressure_class",      "pressureClass")    || "—";
  const dTemp      = v("design_temp",         "designTemp");
  const dPress     = v("design_pressure",     "designPressure");
  const vType      = v("valve_type",          "valveType")        || "VALVE";
  const vSub       = v("valve_subtype",       "valveSubtype")     || "";
  const op         = v("operator_type",       "operator")         || "—";
  const body       = v("body_material",       "bodyMaterial")     || "—";
  const bodySpec   = v("body_material_spec",  "bodyMaterialSpec") || "—";
  const seat       = v("seat_material",       "seatMaterial")     || "—";
  const disc       = v("disc_ball_material",  "discBallMaterial") || "—";
  const stem       = v("stem_material",       "stemMaterial")     || "—";
  const packing    = v("packing",             "packing")          || "—";
  const gasket     = v("gasket",              "gasket")           || "—";
  const endConn    = v("end_connection",      "endConnection")    || "—";
  const endStd     = v("end_connection_std",  "endConnectionStd") || "—";
  const valveStd   = v("valve_standard",      "valveStandard")    || "—";
  const f2f        = v("face_to_face_std",    "faceToFaceStd")    || "—";
  const flangeStd  = v("flange_standard",     "flangeStandard")   || "—";
  const testStd    = v("testing_standard",    "testingStandard")  || "—";
  const fireSafe   = (data.fire_safe ?? data.fireSafe) ? "Yes – API 607" : "No";
  const status     = data.status || "Draft";
  const warnings   = data.warnings || [];
  const dsNumber   = tag && tag !== "—" ? `DS-${tag}` : "DS-XXXX";

  // ── Valve-type-aware logic (mirrors ValveDatasheetView exactly) ──
  const vTypeLow    = vType.toLowerCase();
  const isBall      = vTypeLow.includes("ball");
  const isGate      = vTypeLow.includes("gate");
  const isGlobe     = vTypeLow.includes("globe") || vTypeLow.includes("needle");
  const isButterfly = vTypeLow.includes("butterfly");
  const isCheck     = vTypeLow.includes("check");
  const isPSV       = vTypeLow.includes("relief") || vTypeLow.includes("safety") || vTypeLow.includes("psv");
  const isPlug      = vTypeLow.includes("plug");

  const boreType    = (isBall || isGate || isPlug)
    ? (vSub.toLowerCase().includes("reduced") ? "Reduced Bore (RB)" : "Full Bore (FB)")
    : "N/A";
  const discLabel   = isBall ? "Ball Material:" : isButterfly ? "Disc Material:" : isCheck ? "Disc / Clapper Material:" : isGlobe ? "Disc Material:" : "Disc / Ball Material:";
  const gasketVal   = gasket || (endConn.toLowerCase().includes("butt") || endConn.toLowerCase().includes("weld") ? "N/A" : gasket);
  const cavityVal   = (isBall || isPlug) ? "" : "N/A";
  const esdVal      = (isCheck || isPSV) ? "N/A" : "";
  const atexVal     = (isCheck || isPSV || op.toLowerCase().includes("hand") || op.toLowerCase().includes("lever")) ? "N/A" : "";
  const lowEmitVal  = (isCheck || isPSV) ? "N/A" : (packing.includes("622") ? "Yes – API 622 Class A" : "");
  const fireSafeDisplay = (isCheck || isPSV || isGlobe) ? "N/A" : fireSafe;
  const isSour      = service.toLowerCase().includes("sour") || service.toLowerCase().includes("h2s") || service.toLowerCase().includes("amine");
  const isSourStr   = isSour ? "Yes" : "—";
  const bonnetVal   = isCheck ? "N/A" : (bodySpec && bodySpec !== "—" ? bodySpec : "");

  // ── Auto-recommendations (mirrors ValveDatasheetView exactly) ──
  const isOffshore  = service.toLowerCase().includes("offshore") || service.toLowerCase().includes("marine") || service.toLowerCase().includes("seawater");
  const isOnshore   = service.toLowerCase().includes("onshore") || service.toLowerCase().includes("buried");
  const paintRec    = isOffshore
    ? "3-coat epoxy system, ISO 12944 C5-M"
    : service.toLowerCase().includes("underground") || isOnshore
    ? "Fusion bonded epoxy (FBE) or coal tar, ISO 12944 C4"
    : "2-coat epoxy primer + topcoat, ISO 12944 C3";
  const suitEnvRec  = isOffshore
    ? "Offshore / splash zone — stainless steel bolting, hot-dip galvanised brackets"
    : "Onshore plant — carbon steel with primer + protective coating";
  const tempNum     = parseFloat(dTemp) || 0;
  const insulRec    = tempNum < 0
    ? "Yes — cold insulation (cellular glass), vapour barrier required"
    : tempNum > 200
    ? "Yes — mineral wool / calcium silicate, aluminium cladding"
    : "Not required";
  const classNum    = parseInt((cls || "").replace(/[^0-9]/g, "")) || 150;
  const pressNum    = parseFloat(dPress) || 0;
  const hydroRec    = pressNum > 0
    ? `${(pressNum * 1.5).toFixed(0)} barg (1.5× design) per API 598`
    : "1.5× Design Pressure per API 598";
  const leakRec     = isSour ? "100% — per API 598 / ASME B16.34" : "Per API 598 Table 2";
  const radioRec    = classNum >= 600
    ? "Required — RT per ASME B16.34 §6.1 for Class ≥ 600"
    : "Not required (Class < 600)";
  const ealRec      = isOffshore || service.toLowerCase().includes("platform")
    ? "Required — third party TPIA"
    : "Manufacturer works inspection";
  const matCertRec  = isSour || isOffshore
    ? "EN 10204 Type 3.2 — independent third party"
    : "EN 10204 Type 3.1 — manufacturer";
  const naceRec     = isSour ? "Required — NACE MR0175 / ISO 15156" : "Not required";

  // ── CSS helpers — refined engineering palette ──
  const BORDER = "1px solid #94a3b8";
  const HDR  = `background:#0f172a;color:#fff;font-weight:600;padding:8px 12px;border:${BORDER};letter-spacing:0.02em;`;
  const SUB  = `background:#1e293b;color:#cbd5e1;font-weight:500;padding:5px 10px;text-align:center;border:${BORDER};font-size:8.5pt;letter-spacing:0.06em;text-transform:uppercase;`;
  const SHDR = `background:#334155;color:#fff;font-weight:600;text-align:left;border:${BORDER};padding:5px 10px;font-size:8.5pt;text-transform:uppercase;letter-spacing:0.08em;`;
  const LBL  = `background:#f1f5f9;color:#0f172a;font-weight:500;border:${BORDER};padding:4px 8px;white-space:nowrap;`;
  const VAL  = `background:#fff;color:#0f172a;border:${BORDER};padding:4px 8px;font-variant-numeric:tabular-nums;`;
  const YEL  = `background:#fffbe6;color:#0f172a;border:${BORDER};padding:4px 8px;font-variant-numeric:tabular-nums;`;
  const WARN = `background:#fffaf0;border:${BORDER};padding:5px 8px;border-left:3px solid #d97706;color:#7c2d12;`;
  const GAP  = "border:none;width:10px;";

  // Two-column row helper: [label | value | gap | label | value]
  const row2 = (l1, v1, l2, v2, y1 = false, y2 = false) =>
    `<tr>
      <td style="${LBL}font-size:8.5pt;">${l1}</td>
      <td style="${y1 ? YEL : VAL}font-size:8.5pt;">${v1 || ""}</td>
      <td style="${GAP}"></td>
      <td style="${LBL}font-size:8.5pt;">${l2}</td>
      <td style="${y2 ? YEL : VAL}font-size:8.5pt;">${v2 || ""}</td>
    </tr>`;

  const twoColHdr = (left, right) =>
    `<tr>
      <td colspan="2" style="${SHDR}">${left}</td>
      <td style="${GAP}"></td>
      <td colspan="2" style="${SHDR}">${right}</td>
    </tr>`;

  const fullHdr = (txt) =>
    `<tr><td colspan="5" style="${SHDR}font-size:9pt;">${txt}</td></tr>`;

  // ── Warning rows ──
  const warningRows = warnings.length > 0
    ? warnings.map((w, i) => `<tr>
        <td style="${LBL}white-space:nowrap;font-size:8pt;">Note ${i + 1}.</td>
        <td colspan="4" style="${WARN}font-size:8pt;">&#9888; ${w}</td>
      </tr>`).join("")
    : `<tr>
        <td style="${LBL}white-space:nowrap;font-size:8pt;">Note 1.</td>
        <td colspan="4" style="${VAL}font-size:8pt;color:#aaa;font-style:italic;">No engineering warnings from selection guide.</td>
      </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Valve Datasheet – ${tag}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 9pt; color: #111; padding: 10mm; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4pt; }
    td { vertical-align: middle; }
    @media print {
      body { padding: 6mm; }
      @page { size: A3 landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
<table>
<tbody>

<!-- ══ HEADER ══ -->
<tr>
  <td colspan="2" rowspan="2" style="${HDR}font-size:13pt;">CONTRACTOR LOGO &amp; NAME</td>
  <td style="${GAP}" rowspan="2"></td>
  <td colspan="2" style="${HDR}font-size:11pt;text-align:center;">DATA SHEET FOR ${vType.toUpperCase()}</td>
</tr>
<tr>
  <td colspan="2" style="${SUB}">Per API 615 Recommended Practice</td>
</tr>

<!-- ── Identity rows ── -->
<tr>
  <td style="${LBL}">Equipment Name:</td>
  <td style="${YEL}">${vType}${vSub ? " – " + vSub : ""}</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Plant / Location:</td>
  <td style="${YEL}">${project}</td>
</tr>
<tr>
  <td style="${LBL}">Service:</td>
  <td style="${YEL}">${service}</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Manufacturer:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">To be specified</td>
</tr>
<tr>
  <td style="${LBL}">Tag No.:</td>
  <td style="${YEL}">${tag}</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Make / Model:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">To be specified</td>
</tr>
<tr>
  <td style="${LBL}">P&amp;ID No.:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">P&amp;ID reference</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Supplier:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">To be specified</td>
</tr>
<tr>
  <td style="${LBL}">Requisition / P.O. No.:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">PO number</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Model No.:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">Model number</td>
</tr>
<tr>
  <td style="${LBL}">Date:</td>
  <td style="${VAL}">${today}</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Status:</td>
  <td style="${VAL}">${status}</td>
</tr>
<tr>
  <td style="${LBL}">Datasheet No.:</td>
  <td style="${VAL}">${dsNumber}</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Sheet / Rev:</td>
  <td style="${VAL}">1 of 1 / 0</td>
</tr>

<!-- Spacer -->
<tr><td colspan="5" style="height:6px;border:none;"></td></tr>

<!-- ══ SERVICE DETAILS | MATERIALS OF CONSTRUCTION ══ -->
${twoColHdr("SERVICE DETAILS", "MATERIALS OF CONSTRUCTION")}
${row2("Valve Number / Tag:", tag, "Body Material:", body, true)}
${row2("Nominal Size (NPS):", size, "Body Material Spec:", bodySpec)}
${row2("ANSI Rating (Class):", cls, "Seat Material:", seat)}
${row2("End Connection:", endConn, discLabel, disc)}
${row2("Valve Type:", vType, "Stem Material:", stem)}
${row2("Full Bore / Reduced Bore:", boreType, "Packing Type / Material:", packing)}
${row2("Valve Subtype / Construction:", vSub || "—", "Gasket:", gasketVal || gasket)}
${row2("Valve Function:", fn, "Bonnet Material:", bonnetVal || "", false, !bonnetVal)}
${row2("Design Life:", "", "Bolts &amp; Nuts:", "", true, true)}
${row2("Frequency of Operation:", "", "Temperature Limits (Min / Max °C):", dTemp ? `— / ${dTemp}°C` : "", true, true)}
${row2("Operator / Turns to Close:", op, "Fire Safe:", fireSafeDisplay)}
${row2("Stem Extension:", "", "Yoke:", isCheck || isPSV ? "N/A" : "", true, isCheck || isPSV ? false : true)}
${row2("Operator Design:", isCheck || isPSV ? "N/A" : "", "Handwheel:", isCheck || isPSV ? "N/A" : "", isCheck || isPSV ? false : true, isCheck || isPSV ? false : true)}
${row2("Operator Type:", isCheck || isPSV ? "N/A" : "", "Face to Face Dimensions:", "", isCheck || isPSV ? false : true, true)}

<!-- ══ PROCESS CONDITIONS | STANDARDS & TESTING ══ -->
${twoColHdr("PROCESS CONDITIONS", "STANDARDS &amp; TESTING")}
${row2("Design Pressure:", dPress ? dPress + " barg" : "", "Valve Design Standard:", valveStd)}
${row2("Design Temp. Min / Max:", dTemp ? `— / ${dTemp}°C` : "", "Face-to-Face Standard:", f2f)}
${row2("Operating Pressure:", "", "Flange Standard:", flangeStd, true)}
${row2("Operating Temperature:", "", "End Connection Standard:", endStd, true)}
${row2("Fluid Type / State:", fluid, "Testing Standard:", testStd)}
${row2("Sour Service (NACE MR0175):", isSourStr, "Hydrostatic Test:", "", false, true)}
${row2("Fire Safe:", fireSafeDisplay, "Seat Leak Test:", "", false, true)}
${row2("ANSI Pressure-Temperature Rating:", `ASME B16.5 ${cls}`, "Material Certification:", "", false, true)}

<!-- ══ ADDITIONAL REQUIREMENTS | EXTERNAL PROTECTION ══ -->
${twoColHdr("ADDITIONAL REQUIREMENTS", "EXTERNAL PROTECTION")}
${row2("Actuator / Special Operator:", isCheck || isPSV ? "N/A" : "", "Painting:", paintRec, !(isCheck || isPSV))}
${row2("ATEX / IECEx Required:", atexVal, "To suit environment:", suitEnvRec, atexVal === "")}
${row2("Low Emission (API 622):", lowEmitVal, "To suit insulation over:", insulRec, lowEmitVal === "")}
${row2("ESD / SIS Function:", esdVal, "Estimated Weight – Shipping (kg):", "", esdVal === "", true)}
${row2("Bidirectional / Cavity Relief:", cavityVal, "Estimated Weight – Operating (kg):", "", cavityVal === "", true)}
${row2("Face-to-Face Dimension (mm):", "", "NACE MR0175 Required:", naceRec, true)}

<!-- ══ TEST REQUIREMENTS ══ -->
${fullHdr("TEST REQUIREMENTS")}
${row2("Hydrostatic Test:", hydroRec, "EAL Inspection:", ealRec)}
${row2("Leak Test:", leakRec, "Material Certification:", matCertRec)}
${row2("Radiography:", radioRec, "NACE MR0175 Certification:", naceRec)}

<!-- ══ ENGINEERING NOTES & WARNINGS ══ -->
${fullHdr("ENGINEERING NOTES &amp; WARNINGS")}
${warningRows}
<tr>
  <td style="${LBL}white-space:nowrap;font-size:8pt;">Note ${warnings.length + 1}.</td>
  <td colspan="4" style="${YEL}font-size:8pt;color:#aaa;font-style:italic;">Additional notes to be added by engineer.</td>
</tr>
<tr>
  <td style="${LBL}white-space:nowrap;font-size:8pt;">Note ${warnings.length + 2}.</td>
  <td colspan="4" style="${YEL}font-size:8pt;">&nbsp;</td>
</tr>

<!-- Spacer -->
<tr><td colspan="5" style="height:6px;border:none;"></td></tr>

<!-- ══ REVISION TABLE ══ -->
<tr>
  <td style="${LBL}font-size:8pt;">Rev.</td>
  <td style="${LBL}font-size:8pt;">Date</td>
  <td colspan="1" style="${LBL}font-size:8pt;">Issue Description</td>
  <td style="${LBL}font-size:8pt;">Originated</td>
  <td style="${LBL}font-size:8pt;">Checked / Approved / Client</td>
</tr>
<tr>
  <td style="${YEL}font-size:8pt;">0</td>
  <td style="${YEL}font-size:8pt;">${today}</td>
  <td style="${YEL}font-size:8pt;">Issued for Review</td>
  <td style="${YEL}font-size:8pt;color:#aaa;font-style:italic;">Name</td>
  <td style="${YEL}font-size:8pt;color:#aaa;font-style:italic;">Name / Name / Client</td>
</tr>

<!-- ══ FOOTER ══ -->
<tr>
  <td colspan="2" style="${HDR}padding:4px 8px;font-size:10pt;">COMPANY LOGO &amp; NAME</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Client Name:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">Client name</td>
</tr>
<tr>
  <td colspan="2" style="border:1px solid #999;padding:2px 6px;font-size:7.5pt;color:#888;">Generated by Valve Selection Guide — API 615 Based</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Project Title:</td>
  <td style="${YEL}font-style:italic;color:#aaa;">${project !== "—" ? project : "Project title"}</td>
</tr>
<tr>
  <td colspan="2" style="border:1px solid #999;padding:2px 6px;">&nbsp;</td>
  <td style="${GAP}"></td>
  <td style="${LBL}">Datasheet No.:</td>
  <td style="${VAL}">${dsNumber}</td>
</tr>

</tbody>
</table>
</body>
</html>`;
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
