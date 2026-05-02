// API 615 based valve selection engine
// Covers material selection, valve type, trim, end connections, and operator per process conditions

export const SERVICE_TYPES = [
  "General Hydrocarbon",
  "Corrosive / Sour Service",
  "High Pressure Steam",
  "Low Pressure Steam",
  "Cooling Water",
  "Instrument Air",
  "Hydrogen Service",
  "Oxygen Service",
  "Cryogenic Service",
  "High Temperature (>425°C)",
  "Chloride / Caustic",
  "Amine Service",
  "Flare / Relief",
  "Drain / Vent",
  "Utility Water",
  "Lube Oil",
  "Fuel Gas",
  "BFW (Boiler Feed Water)",
];

export const FLUID_TYPES = [
  "Liquid - Clean",
  "Liquid - Dirty/Slurry",
  "Gas / Vapor",
  "Two-Phase (Gas + Liquid)",
  "Steam",
  "Flashing Liquid",
];

export const INSTALLATION_LOCATIONS = [
  "Onshore - Open Air",
  "Onshore - Sheltered / Building",
  "Offshore - Topside",
  "Offshore - Subsea",
  "Arctic / Cold Climate",
  "Desert / High Ambient",
  "Marine / Coastal (Saline Atmosphere)",
];

export const ADDITIONAL_REQUIREMENTS = [
  "Piggable Line (Full Bore Required)",
  "ESD / Emergency Shutdown",
  "Hazardous Area (ATEX / IECEx)",
  "Low Emission (Fugitive Emissions)",
  "Cryogenic Extended Bonnet",
  "Anti-Static Device Required",
  "Cavity Relief Required",
  "Subsea / Submerged Service",
  "Bidirectional Sealing",
  "Thermal Insulation (Jacketed)",
  "Noise / Vibration Sensitive",
  "HIPPS (High Integrity Pressure Protection)",
];

export const VALVE_FUNCTIONS = [
  "Isolation (On/Off)",
  "Throttling / Control",
  "Non-Return (Check)",
  "Pressure Relief / Safety",
  "Blowdown",
  "Sampling",
  "Drain",
  "Vent",
];

export const PIPE_SIZES = [
  '1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"',
  '14"', '16"', '18"', '20"', '24"', '30"', '36"', '42"', '48"',
];

export const PRESSURE_CLASSES = [
  "150#", "300#", "600#", "900#", "1500#", "2500#",
];

export const VALVE_STANDARDS = {
  gate: "API 600 / API 603",
  globe: "API 623 / BS 1873",
  ball: "API 6D / API 608",
  butterfly: "API 609",
  check_swing: "API 6D / BS 1868",
  check_dual: "API 594",
  check_piston: "BS 1873 / API 623",
  plug: "API 6D / API 599",
  needle: "ASME B16.34",
  relief: "API 526 / API 520",
};

export const FACE_TO_FACE_STANDARDS = {
  gate: "ASME B16.10",
  globe: "ASME B16.10",
  ball: "ASME B16.10 / API 6D",
  butterfly: "API 609 / ASME B16.10",
  check_swing: "ASME B16.10",
  check_dual: "API 594",
  plug: "ASME B16.10",
};

export const FLANGE_STANDARDS = {
  "ASME B16.5": 'NPS ≤ 24"',
  "ASME B16.47": 'NPS > 24"',
};

export const TESTING_STANDARD = "API 598";

function parsePipeSize(sizeStr) {
  const map = {
    '1/2"': 0.5, '3/4"': 0.75, '1"': 1, '1-1/2"': 1.5, '2"': 2, '3"': 3,
    '4"': 4, '6"': 6, '8"': 8, '10"': 10, '12"': 12, '14"': 14,
    '16"': 16, '18"': 18, '20"': 20, '24"': 24, '30"': 30, '36"': 36,
    '42"': 42, '48"': 48,
  };
  return map[sizeStr] || 2;
}

function getPressureClassNum(cls) {
  return parseInt(cls.replace("#", ""));
}

export function selectValve(input) {
  const {
    serviceType,
    fluidType,
    valveFunction,
    pipeSize,
    pressureClass,
    designTemp,
    designPressure,
    installationLocation = "",
    additionalRequirements = [],
  } = input;

  const size = parsePipeSize(pipeSize);
  const classNum = getPressureClassNum(pressureClass);
  const temp = parseFloat(designTemp) || 20;
  const warnings = [];
  const alternatives = [];

  // rationale collects the "why" for each decision, with references
  const rationale = {};

  // --- VALVE TYPE SELECTION ---
  let valveType = "";
  let valveSubtype = "";

  if (valveFunction === "Isolation (On/Off)") {
    if (fluidType === "Liquid - Dirty/Slurry") {
      valveType = "Plug Valve";
      valveSubtype = "Lubricated";
      rationale.valveType = {
        reason: `Plug valve selected for dirty/slurry isolation. The rotating plug wipes the seat on operation, making it self-cleaning and tolerant of particles. Ball valves are avoided as slurry can trap in the cavity and damage soft seats.`,
        rule: "Slurry/dirty fluid — plug or full-bore ball preferred to prevent seat damage and seat cavity packing",
        refs: ["API 615 §6.3 (Valve selection for difficult fluids)", "API 6D §5.3"],
      };
      alternatives.unshift({ type: "Ball Valve (Full Bore)", reason: "Self-cleaning, full bore preferred for slurry if plug unavailable" });
    } else if (serviceType === "Hydrogen Service" || serviceType === "Oxygen Service") {
      valveType = "Ball Valve";
      valveSubtype = size <= 2 ? "Floating Ball" : "Trunnion Mounted";
      rationale.valveType = {
        reason: `Ball valve is preferred for ${serviceType}. It provides reliable bubble-tight shutoff with minimal dead volume, reducing the risk of trapped gas. Soft seats must be compatible with the service.`,
        rule: `Hydrogen and Oxygen service require reliable, tight shutoff with minimal internal volume`,
        refs: ["API 615 §6.2", "API 6D", serviceType === "Oxygen Service" ? "CGA G-4.1 (Oxygen cleaning)" : "API 941 (Nelson Curves)"],
      };
      warnings.push("Special cleaning and material selection required for " + serviceType);
    } else if (size <= 2) {
      valveType = "Ball Valve";
      valveSubtype = "Floating Ball";
      rationale.valveType = {
        reason: `Ball valve (floating ball) is the industry-standard choice for small bore (≤ 2") isolation. It offers fast quarter-turn operation, low pressure drop (full bore), and reliable shutoff. The floating ball design is cost-effective at lower pressures and sizes.`,
        rule: "NPS ≤ 2\": Ball valve (floating ball) — quarter-turn, compact, reliable. API 615 preferred type for small bore isolation.",
        refs: ["API 615 §6.2", "API 608", "API 6D §5.2"],
        basicExplanation: {
          designRequirement: "We need a valve that fully opens and closes a small-bore line reliably. It must seal tight, fit in a small space, and be easy to operate by hand.",
          engineeringLogic: "A floating ball valve does the job perfectly at this size. The ball sits between two PTFE seats. Turning a lever 90° moves the ball from open to closed — simple, fast, and reliable. The ball 'floats' slightly so line pressure pushes it firmly against the downstream seat, improving the seal.",
          alternativesRejected: "Gate valves were the old standard but take many turns to open and are taller. Globe valves add pressure drop and are for throttling, not isolation. Plug valves are bulkier and costlier for this size.",
          codeReference: "API 615 Table 1 directs ball valves for small bore isolation. API 608 covers the ball valve design standard. API 6D is used where pipeline specification applies.",
        },
        expertExplanation: {
          designRequirement: "NPS ≤ 2\" isolation service. Required characteristics: Class A or B seat leakage per API 598, quarter-turn operation, fire-safe certificate per API 607 for hydrocarbon service, anti-static device per API 6D Annex E if PTFE seated.",
          engineeringLogic: "Floating ball design: ball is not mechanically constrained — it translates laterally under differential pressure, loading the downstream seat. Seating load = π/4 × d² × ΔP where d is ball port diameter. At NPS ≤ 2\" and Class ≤ 600#, seat stress is within PTFE yield limits (~14 MPa). For Class 900# and above, trunnion mounting or metal seats required to prevent seat extrusion.",
          alternativesRejected: "Gate valves (API 600): Rising stem, multi-turn (typically 8–20 turns), risk of galling on stainless trim in H₂S service. Globe valves: High Cv loss (~factor of 3–5 vs. ball), not suitable for pure isolation. Plug valves: Higher torque, better for slurry — over-specified for clean small-bore service.",
          codeReference: "API 615 §6.2, Table 1 — valve type matrix. API 608 §6 Table 1 — body/trim. API 6D §5.2 — full/reduced bore. API 598 Table 3 — seat leakage Class A. API 607 §5 — fire test procedure.",
        },
      };
      alternatives.push({ type: "Gate Valve", reason: "Traditional isolation for small bore, multi-turn" });
      alternatives.push({ type: "Plug Valve", reason: "Suitable for on/off, lubricated or non-lubricated" });
    } else if (size <= 12) {
      valveType = "Ball Valve";
      valveSubtype = "Trunnion Mounted";
      rationale.valveType = {
        reason: `Ball valve (trunnion mounted) is selected for mid-range sizes (3"–12"). At these sizes and pressures, a trunnion-mounted ball offloads seat loading via fixed trunnion supports, reducing operating torque and improving seat life. Full bore options give negligible pressure drop.`,
        rule: "NPS 3\"–12\": Trunnion ball valve preferred — lower operating torque than floating ball at higher pressures and sizes.",
        refs: ["API 615 §6.2", "API 6D §5.2", "API 608"],
        basicExplanation: {
          designRequirement: "We need reliable isolation for a mid-size line. The valve must handle the pressure without requiring excessive operating force, and seats must last.",
          engineeringLogic: "The trunnion design fixes the ball to the valve body via top and bottom trunnion pins. This means line pressure does NOT push the ball into the seat — the seats instead spring-load against the ball. This dramatically reduces operating torque at larger sizes, making manual or gear operation practical.",
          alternativesRejected: "A floating ball at 6\" and above would generate very high torque (>1000 Nm) at full pressure — requiring a large gear operator or actuator even for moderate pressures. A butterfly valve is an option but gives less positive shutoff and is harder to pig through.",
          codeReference: "API 6D §5.2 defines full bore vs. reduced bore. API 615 §6.2 recommends trunnion for larger sizes. API 608 covers the design standard for metal ball valves.",
        },
        expertExplanation: {
          designRequirement: "NPS 3\"–12\" isolation. Trunnion mounting required above NPS 4\" or Class 600# to keep operating torque within manual operator limits. Maximum rim pull typically 360 N per EN 12570.",
          engineeringLogic: "Floating ball seating torque: T_seat ≈ μ × F_seat × r, where F_seat = π/4 × d² × ΔP. At NPS 6\" Class 300 (ΔP ~50 bar): F_seat ≈ 89 kN — this exceeds lever capability. Trunnion design: spring-loaded seats isolate ball from pressure load. Operating torque dominated by friction (μ × seat preload × r), typically 20–30% of equivalent floating ball torque. Spring preload set to maintain Class A leak rate per API 598.",
          alternativesRejected: "Floating ball (API 608): Seat extrusion risk at Class ≥ 600# for NPS > 4\". Gate valve (API 600): Multi-turn, rising stem — larger installation height. Triple offset butterfly: Viable at Class 150–300 but requires face-to-face reduction compared to ball valve and gives lower Cv.",
          codeReference: "API 6D §5.2 — Bore classification. API 608 §6 Table 1 — trim materials. API 615 §6.2 — selection guidance. EN 12570 — max rim pull. API 598 Table 3 — seat leakage.",
        },
      };
      alternatives.push({ type: "Gate Valve", reason: "Cost-effective for clean service, multi-turn operation" });
      alternatives.push({ type: "Butterfly Valve", reason: "Lighter, space-saving for Class 150/300" });
    } else {
      valveType = "Butterfly Valve";
      valveSubtype = "Triple Offset";
      rationale.valveType = {
        reason: `Triple offset butterfly valve (TOV) is recommended for large bore (> 12") isolation. TOVs provide metal-to-metal sealing with zero leakage capability, in a compact, light-weight package. The triple offset geometry eliminates seat rubbing on operation, giving long service life. Ball valves at these sizes become very heavy and expensive.`,
        rule: "NPS > 12\": Triple offset butterfly valve — compact, fire-safe, metal seated, cost-effective vs. large ball valves.",
        refs: ["API 615 §6.4", "API 609", "ASME B16.10"],
        basicExplanation: {
          designRequirement: "We need isolation for a large pipe. It must seal reliably, be operable by a gearbox, and not be excessively heavy or expensive.",
          engineeringLogic: "A triple offset butterfly valve works by rotating a cone-shaped disc that seats into a matching cone in the body. The 'triple offset' means the shaft and disc geometry are arranged so the disc lifts away from the seat immediately on opening — no rubbing. This gives zero-wear metal-to-metal sealing and a very long service life. The whole valve is a fraction of the weight and size of an equivalent ball valve at large bore.",
          alternativesRejected: "Ball valves above 16\" cost 3–5× more and weigh significantly more. Gate valves are full bore but very tall (rising stem) and slow to operate. Standard concentric butterfly valves have elastomeric seats which degrade at temperature and don't provide Class A shutoff.",
          codeReference: "API 609 Category B covers triple offset high performance butterfly valves. API 615 §6.4 provides the selection guidance. ASME B16.10 governs face-to-face dimensions.",
        },
        expertExplanation: {
          designRequirement: "NPS > 12\" isolation. Triple offset geometry required for Class A leakage (API 598). Metal-seated for fire-safe compliance per API 607. Suitable to Class 600# in standard configurations; Class 900# available in special designs.",
          engineeringLogic: "Three offsets: (1) shaft behind disc centre-line — prevents radial rubbing on opening; (2) shaft above pipe axis — asymmetric seating; (3) cone half-angle ≠ 90° — laminar seating geometry. Result: disc contacts seat only at fully closed position, eliminating hysteresis and wear. Cv typically 75–85% of equivalent ball valve Cv. Fire test per API 607: metal-to-metal backup seating maintains post-fire shutoff. Ensure shaft/disc material rated for operating temperature.",
          alternativesRejected: "Ball valve (API 6D): NPS 16\" Class 300 ball valve: ~2.5 tonnes vs ~400 kg for equivalent TOV. Gate valve (API 600): Rising stem height exceeds structural envelope at large bore. Concentric butterfly (Category A): Elastomeric seat — temperature limit ~200°C, no Class A shutoff at high pressure.",
          codeReference: "API 609 §5.2 — Category A/B definition. API 609 §6 Table 1 — trim materials. API 615 §6.4 — large bore selection. ASME B16.10 — face-to-face. API 607 §5 — fire test.",
        },
      };
      alternatives.push({ type: "Ball Valve (Trunnion)", reason: "Bubble-tight shutoff, higher cost and weight" });
      alternatives.push({ type: "Gate Valve", reason: "Full bore, traditional choice for large sizes" });
    }
  } else if (valveFunction === "Throttling / Control") {
    if (size <= 8) {
      valveType = "Globe Valve";
      valveSubtype = "Standard Pattern";
      rationale.valveType = {
        reason: `Globe valve is the primary selection for throttling/control service up to 8". The plug-and-seat geometry allows precise flow modulation across a wide range. The linear flow characteristic suits most control applications. Ball and butterfly valves can throttle but have less stable characteristics at low openings and risk seat erosion.`,
        rule: "Throttling ≤ 8\": Globe valve — linear characteristic, precise control, robust against erosion at intermediate openings.",
        refs: ["API 615 §6.5", "API 623", "IEC 60534-1 (Control valve sizing)", "ISA 75.01"],
      };
      alternatives.push({ type: "Ball Valve (V-Port)", reason: "Better rangeability for some applications, lower pressure drop" });
      alternatives.push({ type: "Butterfly Valve", reason: "Large capacity control, cost-effective for larger sizes" });
    } else {
      valveType = "Butterfly Valve";
      valveSubtype = "Triple Offset";
      rationale.valveType = {
        reason: `For large bore (> 8") throttling, a triple offset butterfly valve is recommended. Globe valves at large sizes become very heavy and expensive, and the pressure drop becomes unacceptably high. The TOV provides reasonable control characteristics and can be automated.`,
        rule: "Throttling > 8\": Triple offset butterfly valve — acceptable control characteristic, cost-effective at large sizes.",
        refs: ["API 615 §6.4", "API 609", "IEC 60534"],
      };
      alternatives.push({ type: "Globe Valve", reason: "Precise control, high pressure drop — usually not practical above 8\"" });
    }
    warnings.push("Control valve sizing calculation per IEC 60534 / ISA 75 required");
  } else if (valveFunction === "Non-Return (Check)") {
    // Pre-evaluate location/requirements flags needed for check valve type selection
    const _isOffshoreCheck = installationLocation.startsWith("Offshore") || installationLocation === "Marine / Coastal (Saline Atmosphere)";
    const _isSubseaCheck   = additionalRequirements.includes("Subsea / Submerged Service") || installationLocation === "Offshore - Subsea";
    const _isPiggableCheck = additionalRequirements.includes("Piggable Line (Full Bore Required)");
    const _isTwoPhasePulse = fluidType === "Two-Phase (Gas + Liquid)" || fluidType === "Flashing Liquid";
    // Dual plate is preferred when: offshore/marine (weight/space), two-phase/pulsating, or large bore
    const _preferDualPlate = _isOffshoreCheck || _isSubseaCheck || _isTwoPhasePulse;

    if (size <= 2) {
      valveType = "Check Valve";
      valveSubtype = "Piston Type";
      rationale.valveType = {
        reason: `Piston (lift) check valve for small bore (≤ 2"). The guided piston design gives a controlled, positive seat contact and handles pulsating flow better than swing checks. Suitable for vertical and horizontal installation.`,
        rule: "NPS ≤ 2\": Piston (lift) check — suitable for pulsating or high velocity service, compact.",
        refs: ["API 615 §6.6", "BS 1873", "ASME B16.34"],
      };
      alternatives.push({ type: "Check Valve (Swing)", reason: "Lower pressure drop for clean, steady flow" });
    } else if (size <= 16) {
      valveType = "Check Valve";
      if (_preferDualPlate) {
        valveSubtype = "Dual Plate (Wafer)";
        const dualReasons = [];
        if (_isOffshoreCheck) dualReasons.push("Offshore/marine installations favour dual plate check valves — the wafer design is significantly lighter and more compact than a swing check, reducing topside structural load and saving space. Fast spring-assisted closure also reduces water-hammer risk in offshore pump systems.");
        if (_isTwoPhasePulse) dualReasons.push("Two-phase or pulsating flow increases slam risk with swing checks; dual plate spring-assisted closure mitigates this.");
        rationale.valveType = {
          reason: dualReasons.join(" ") || "Dual plate wafer check selected based on installation or service requirements.",
          rule: _isOffshoreCheck
            ? "Offshore/marine NPS 3\"–16\": Dual plate wafer check preferred over swing — lighter, more compact, faster closure. Swing checks add weight and bulk that is critical offshore."
            : "NPS 3\"–16\" (two-phase/pulsating): Dual plate check — spring-assisted fast closure reduces slam.",
          refs: ["API 615 §6.6", "API 594", "ASME B16.10", ...(_isOffshoreCheck ? ["NORSOK M-001 (Materials selection)"] : [])],
        };
        alternatives.push({ type: "Check Valve (Swing)", reason: "Full bore, lower pressure drop — heavier and longer, not preferred offshore" });
        alternatives.push({ type: "Check Valve (Tilting Disc)", reason: "Low-slam alternative for pump discharge" });
      } else {
        valveSubtype = "Swing Type";
        rationale.valveType = {
          reason: `Swing check valve for mid-range sizes (3"–16"). The hinged disc swings clear of the flow path, giving low pressure drop and full bore opening. Suitable for horizontal pipelines with clean liquids or gases. Not recommended for vertical downward flow or pulsating service.`,
          rule: "NPS 3\"–16\": Swing check — full bore, low dP, standard for clean steady onshore flow. Avoid vertical down-flow or pulsating service.",
          refs: ["API 615 §6.6", "API 6D / BS 1868", "ASME B16.10"],
        };
        alternatives.push({ type: "Check Valve (Dual Plate)", reason: "Compact wafer style, lighter — preferred offshore or for pulsating flow" });
        alternatives.push({ type: "Check Valve (Tilting Disc)", reason: "Reduced slam for pulsating flow or pump discharge" });
      }
    } else {
      valveType = "Check Valve";
      valveSubtype = "Dual Plate (Wafer)";
      rationale.valveType = {
        reason: `Dual plate (wafer) check valve for large bore (> 16"). The two spring-loaded half-discs close quickly on flow reversal, significantly reducing water-hammer slam. The wafer design saves considerable weight and face-to-face length vs. a swing check at large sizes.`,
        rule: "NPS > 16\": Dual plate wafer check — fast closure reduces water hammer, compact and light for large bore.",
        refs: ["API 615 §6.6", "API 594", "ASME B16.10"],
      };
      alternatives.push({ type: "Check Valve (Swing)", reason: "Full bore, lower pressure drop — heavier and longer" });
    }
    if (_isTwoPhasePulse) {
      warnings.push("Check valve slam analysis recommended for two-phase/flashing service");
    }
  } else if (valveFunction === "Pressure Relief / Safety") {
    const isGas = fluidType === "Gas / Vapor" || fluidType === "Steam";
    valveType = "Safety Relief Valve";
    valveSubtype = isGas ? "Spring Loaded (Pop Action)" : "Spring Loaded (Modulating)";
    rationale.valveType = {
      reason: `Spring-loaded safety relief valve per API 526. ${isGas ? "Pop-action (full-lift) type for compressible fluids — opens rapidly to full bore on reaching set pressure, providing high capacity gas/vapor relief." : "Modulating type for liquid service — opens proportionally to overpressure, avoiding excessive loss of process fluid."} Must be sized per API 520 and installed per API 521.`,
      rule: `Gas/Steam → Full lift (pop-action). Liquid → Modulating. Sizing per API 520. Orifice designation per API 526.`,
      refs: ["API 526 (PSV specification)", "API 520 Part I (Sizing)", "API 521 (Installation)", "ASME Section I / VIII (Code stamping)"],
    };
    alternatives.push({ type: "Pilot Operated Relief Valve", reason: "Higher capacity, better for high backpressure or to minimize chatter near set pressure" });
    warnings.push("Relief valve sizing per API 520/521 required. Must be registered and certified per API 526");
  } else if (valveFunction === "Blowdown") {
    valveType = "Ball Valve";
    valveSubtype = size <= 2 ? "Floating Ball" : "Trunnion Mounted";
    rationale.valveType = {
      reason: `Ball valve for blowdown service. Blowdown valves must open fully and quickly to allow maximum flow during an emergency depressurization event. The quarter-turn ball valve is reliable, provides full bore flow, and is easily automated. Fire-safe design is mandatory for hydrocarbon blowdown.`,
      rule: "Blowdown: Ball valve — full bore, quick quarter-turn actuation, fire-safe mandatory per API 607.",
      refs: ["API 615 §6.2", "API 521 §5 (Blowdown systems)", "API 607 (Fire test)", "API 6D"],
    };
    alternatives.push({ type: "Globe Valve", reason: "Throttling blowdown control only — not recommended for full-bore emergency blowdown" });
    warnings.push("Blowdown valve must be fire-safe per API 607");
  } else if (valveFunction === "Sampling" || valveFunction === "Drain" || valveFunction === "Vent") {
    valveType = "Ball Valve";
    valveSubtype = "Floating Ball";
    rationale.valveType = {
      reason: `Ball valve (floating ball) for small bore sampling, drain, and vent connections. Quarter-turn operation, compact, reliable shutoff. Typically NPS ¾" or 1". For high pressure (≥ 600#), consider a needle valve for fine flow control during sampling.`,
      rule: "Drain/Vent/Sample: Small bore floating ball valve — simple, reliable, quarter-turn. Needle valve for fine control at high pressure.",
      refs: ["API 615 §6.2", "API 608", "ASME B16.34"],
    };
    if (classNum >= 600) {
      alternatives.push({ type: "Needle Valve", reason: "Fine flow control for high-pressure sampling" });
    }
    alternatives.push({ type: "Gate Valve", reason: "Simple isolation, multi-turn" });
  }

  // --- BODY MATERIAL SELECTION ---
  let bodyMaterial = "";
  let bodyMaterialSpec = "";

  if (serviceType === "Cryogenic Service") {
    bodyMaterial = "Stainless Steel 316";
    bodyMaterialSpec = "ASTM A351 CF8M";
    rationale.bodyMaterial = {
      reason: "Austenitic stainless steel (CF8M/316) retains ductility and toughness at cryogenic temperatures, unlike carbon steel which becomes brittle below -29°C (DBTT). No impact test exemption applies at these temperatures.",
      rule: "Cryogenic (< -46°C): Austenitic SS required — retains toughness below ductile-to-brittle transition temperature.",
      refs: ["ASME B16.34 Table A1", "ASTM A351", "ASME B31.3 Table A-1"],
    };
    warnings.push("Cryogenic service: Extended bonnet required. Impact testing per ASME B16.34 required");
  } else if (serviceType === "Corrosive / Sour Service") {
    bodyMaterial = "Carbon Steel (NACE)";
    bodyMaterialSpec = "ASTM A352 LCC / A216 WCC (HIC/SSC tested)";
    rationale.bodyMaterial = {
      reason: "In H₂S-containing (sour) service, carbon steel is susceptible to Hydrogen Induced Cracking (HIC) and Sulphide Stress Cracking (SSC). NACE-compliant steel with controlled hardness (≤ 22 HRC per MR0175) and HIC-tested plate is required to resist these damage mechanisms.",
      rule: "Sour/H₂S service: NACE MR0175 / ISO 15156 compliance. Hardness ≤ 22 HRC. HIC/SSC tested material mandatory.",
      refs: ["NACE MR0175 / ISO 15156 Part 2", "API 615 §7.2", "ASTM A352"],
      basicExplanation: {
        designRequirement: "The body must not crack or fail when exposed to H₂S in the process fluid. H₂S is extremely dangerous — if a valve body cracks and leaks, the consequences can be catastrophic.",
        engineeringLogic: "H₂S dissolves in water and produces hydrogen ions that get absorbed into the steel. If the steel is too hard, atomic hydrogen collects at grain boundaries and causes cracking — this is SSC (Sulphide Stress Cracking). HIC (Hydrogen Induced Cracking) is a related mechanism at inclusions. The fix: use softer, cleaner steel with hardness ≤ 22 HRC and low sulphur content. This is what NACE MR0175 specifies.",
        alternativesRejected: "Standard WCB without NACE testing will crack in sour service — not acceptable. Stainless steel is not automatically better — austenitic SS can also be susceptible to SSC under certain conditions. The correct fix is NACE-tested carbon steel, not just switching to SS.",
        codeReference: "NACE MR0175 / ISO 15156 Part 2 §7 gives the hardness limits for carbon steel. Figure 1 shows the H₂S partial pressure threshold. API 615 §7.2 references this directly.",
      },
      expertExplanation: {
        designRequirement: "H₂S partial pressure threshold: SSC risk if pH₂S > 0.0003 MPa (0.05 psia) in aqueous phase per NACE MR0175 Part 1 Fig. 1. HIC assessment required if H₂S > 0.0003 MPa and pH < 5.5 (worst case).",
        engineeringLogic: "SSC mechanism: H⁺ + e⁻ → H (atomic); atomic H diffuses into steel lattice, accumulates at high-stress sites (weld HAZ, inclusions). Hardness limit (≤ 22 HRC = ~248 HV10) controls martensite formation — higher hardness materials have more susceptible microstructure. HIC: hydrogen accumulates at MnS inclusions, creating blisters. Remedy: PWHT to temper HAZ, HIC-tested base plate (low S, Ca-treated), NACE-compliant chemical composition.",
        alternativesRejected: "Standard WCB without HIC test: Non-conforming to NACE MR0175 — unacceptable per most EPC sour service specifications. 316 SS: Susceptible to SSC at high H₂S and low pH (Part 3, Table A.2 of MR0175). Duplex SS: Generally acceptable but must verify PRE ≥ 25 and confirm with Part 3.",
        codeReference: "NACE MR0175 / ISO 15156 Part 2 §7 — hardness limits. Part 2 Fig. 1 — SSC severity region. API 615 §7.2. ASTM A216 WCC (lower carbon than WCB, better for NACE). ASME B31.3 §331 — PWHT requirements.",
      },
    };
    warnings.push("NACE MR0175 / ISO 15156 compliance required for sour service");
  } else if (serviceType === "Chloride / Caustic") {
    bodyMaterial = "Alloy 20 / Duplex SS";
    bodyMaterialSpec = "ASTM A351 CN7M / A995 CD3MN";
    rationale.bodyMaterial = {
      reason: "Carbon steel corrodes rapidly in chloride or caustic environments. Austenitic SS 304/316 is susceptible to Chloride Stress Corrosion Cracking (ClSCC). Duplex SS or Alloy 20 provides superior resistance due to higher Cr, Mo, and N content and duplex microstructure.",
      rule: "Chloride/Caustic: Duplex SS or Alloy 20 — ClSCC resistance. Avoid standard austenitic 304/316 where chlorides are present above ~60°C.",
      refs: ["API 615 §7.3", "ASTM A995 (Duplex)", "ASTM A351 CN7M (Alloy 20)"],
    };
    warnings.push("Chloride stress corrosion cracking assessment required. Consider Alloy 625 or Hastelloy for severe conditions");
  } else if (serviceType === "High Temperature (>425°C)" || temp > 425) {
    if (temp > 565) {
      bodyMaterial = "Stainless Steel 347";
      bodyMaterialSpec = "ASTM A351 CF8C";
      rationale.bodyMaterial = {
        reason: "Above 565°C, even Cr-Mo alloy steel is approaching its creep rupture limits. Stabilised austenitic SS 347 (Nb-stabilised) resists sensitisation and has better high-temperature strength. Creep analysis is required.",
        rule: "T > 565°C: Stabilised austenitic SS (347/CF8C) for creep resistance. Creep assessment mandatory.",
        refs: ["ASME B16.34 Table A1", "ASTM A351 CF8C", "ASME B31.3 Appendix A"],
      };
      warnings.push("Extended high temperature service: Creep analysis and material verification required");
    } else {
      bodyMaterial = "Alloy Steel (Cr-Mo)";
      bodyMaterialSpec = "ASTM A217 WC6 / WC9";
      rationale.bodyMaterial = {
        reason: "Above 425°C, carbon steel loses strength rapidly due to graphitisation and creep. 1.25Cr-0.5Mo (WC6) or 2.25Cr-1Mo (WC9) alloy steel maintains adequate strength and oxidation resistance up to ~565°C.",
        rule: "425°C–565°C: Cr-Mo alloy steel required — carbon steel loses strength above 425°C (graphitisation / creep limit).",
        refs: ["API 941 (Nelson Curves)", "ASTM A217 WC6/WC9", "ASME B31.3 Appendix A"],
      };
    }
  } else if (serviceType === "High Pressure Steam" || serviceType === "BFW (Boiler Feed Water)") {
    if (temp > 425) {
      bodyMaterial = "Alloy Steel (Cr-Mo)";
      bodyMaterialSpec = "ASTM A217 WC6";
      rationale.bodyMaterial = {
        reason: "High pressure steam above 425°C exceeds the safe operating limit for carbon steel (graphitisation risk). WC6 (1.25Cr-0.5Mo) is the standard alloy for steam service up to 565°C.",
        rule: "HP Steam > 425°C: WC6 alloy steel — carbon steel WCB not acceptable above 425°C.",
        refs: ["ASME B16.34", "ASTM A217 WC6", "ASME B31.1 (Power piping)"],
      };
    } else {
      bodyMaterial = "Carbon Steel";
      bodyMaterialSpec = "ASTM A216 WCB";
      rationale.bodyMaterial = {
        reason: "Carbon steel WCB is acceptable for steam below 425°C. It is the standard, cost-effective material for general process service within its pressure-temperature rating.",
        rule: "HP Steam ≤ 425°C: WCB carbon steel acceptable — within P-T rating per ASME B16.34.",
        refs: ["ASME B16.34 Table A1", "ASTM A216 WCB"],
      };
    }
  } else if (serviceType === "Hydrogen Service") {
    bodyMaterial = "Carbon Steel (H2 Service)";
    bodyMaterialSpec = "ASTM A216 WCB (Nelson Curve verified)";
    rationale.bodyMaterial = {
      reason: "Carbon steel is susceptible to High Temperature Hydrogen Attack (HTHA) at elevated temperatures and partial pressures of hydrogen. Material suitability must be verified against the API 941 Nelson Curves. The operating point (T, PH2) must fall safely below the applicable curve.",
      rule: "Hydrogen service: Verify operating T & PH₂ against API 941 Nelson Curves. Operating above the curve risks HTHA — catastrophic and irreversible.",
      refs: ["API 941 (Steels for hydrogen service — Nelson Curves)", "API 615 §7.4", "ASME B16.34"],
    };
    warnings.push("Hydrogen service: Verify material suitability per API 941 Nelson Curves. HTHA assessment required");
  } else if (serviceType === "Oxygen Service") {
    bodyMaterial = "Stainless Steel 316 (O2 Cleaned)";
    bodyMaterialSpec = "ASTM A351 CF8M";
    rationale.bodyMaterial = {
      reason: "In oxygen service, ignition of hydrocarbon contamination can cause catastrophic fire or explosion. SS 316 is used for its compatibility with O₂ and ability to be thoroughly cleaned. All components must be oxygen-cleaned per CGA G-4.1 to remove hydrocarbon residues.",
      rule: "O₂ service: SS 316, oxygen-cleaned per CGA G-4.1. Avoid copper alloys in some configurations. Lubrication with O₂-compatible grease only.",
      refs: ["CGA G-4.1 (Oxygen cleaning)", "ASTM A351 CF8M", "API 615 §7.5"],
    };
    warnings.push("Oxygen service: All components must be oxygen cleaned per CGA G-4.1. Special lubricants required");
  } else if (serviceType === "Amine Service") {
    bodyMaterial = "Carbon Steel (PWHT)";
    bodyMaterialSpec = "ASTM A216 WCB (PWHT required)";
    rationale.bodyMaterial = {
      reason: "Carbon steel in amine service is susceptible to amine stress corrosion cracking (SCC) if residual weld stresses are present. Post Weld Heat Treatment (PWHT) is mandatory to relieve residual stresses and reduce susceptibility. Hardness must be controlled.",
      rule: "Amine service: Carbon steel WCB with mandatory PWHT per API 945. Without PWHT, SCC risk is high in MEA, DEA, MDEA environments.",
      refs: ["API 945 (Avoiding cracking in amine units)", "ASTM A216 WCB", "ASME B31.3 §331"],
    };
    warnings.push("Amine service: Post Weld Heat Treatment (PWHT) required per API 945");
  } else if (temp < -29) {
    bodyMaterial = "Low Temperature Carbon Steel";
    bodyMaterialSpec = "ASTM A352 LCB / LCC";
    rationale.bodyMaterial = {
      reason: "Standard carbon steel (WCB) has a minimum design temperature of -29°C without impact testing. Below this, the steel approaches its ductile-to-brittle transition. Low temperature grades (LCB, LCC) are impact-tested at -46°C or lower to demonstrate adequate toughness.",
      rule: "T < -29°C: Low temp carbon steel (LCB/LCC) required — impact tested at MDMT. WCB not permitted below -29°C.",
      refs: ["ASME B16.34 Table A1", "ASTM A352 LCB/LCC", "ASME B31.3 Table A-1"],
    };
    warnings.push("Low temperature service: Impact testing required at MDMT per ASME B16.34");
  } else {
    bodyMaterial = "Carbon Steel";
    bodyMaterialSpec = "ASTM A216 WCB";
    rationale.bodyMaterial = {
      reason: "Carbon steel WCB is the standard, cost-effective body material for general hydrocarbon and utility service within the temperature range -29°C to 425°C and applicable pressure class.",
      rule: "General service (-29°C to 425°C): WCB carbon steel — standard API/ASME material, good strength, weldability, and availability.",
      refs: ["ASTM A216 WCB", "ASME B16.34 Table A1", "API 615 §7.1"],
      basicExplanation: {
        designRequirement: "The body material must contain the process fluid at design pressure and temperature without losing strength or corroding excessively over the design life.",
        engineeringLogic: "WCB (cast carbon steel) is the workhorse of the process industry. It handles most hydrocarbon and utility services from -29°C to 425°C. It's strong, weldable, well-understood, and available everywhere. When nothing unusual is happening to the process — no H₂S, no extremes of temperature, no corrosive chemistry — WCB is the right choice.",
        alternativesRejected: "Stainless steel costs 3–4× more with no benefit in clean hydrocarbon service. Low temp grades (LCC) have tighter tolerances and cost more — not needed above -29°C. Alloy steels (WC6) are only needed above 425°C.",
        codeReference: "ASTM A216 WCB defines the cast carbon steel specification. ASME B16.34 Table A1 confirms its pressure class limits. API 615 §7.1 covers general material selection guidance.",
      },
      expertExplanation: {
        designRequirement: "Body material must satisfy ASME B16.34 Table A1 P-T rating at design conditions. WCB: MDMT = -29°C (no impact testing), max 425°C. Yield strength (Fy) = 250 MPa min. Tensile strength = 485 MPa min per ASTM A216.",
        engineeringLogic: "WCB (A216 Grade WCB) is Group 1.1 in ASME B16.5 — the baseline material group for all P-T rating tables. Corrosion allowance: typically 1.6–3.2 mm in hydrocarbon service (per piping class). Carbon content: 0.25% max — controls weldability (CE = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15 ≤ 0.43 for good weldability). Not suitable if H₂S partial pressure > 0.0003 MPa (NACE Fig. 1) — switch to HIC-tested material.",
        alternativesRejected: "CF8M (316 SS): Unnecessary cost for clean service, susceptible to ClSCC in chloride-containing water. WC6: Only justified above 425°C or if API 941 HTHA check requires Cr-Mo. LCC: Requires Charpy impact testing at -46°C — adds cost, not needed above -29°C.",
        codeReference: "ASTM A216 §5 — chemical composition. ASME B16.34 Table A1 — P-T rating table for WCB. ASME B16.5 Table 2 — Group 1.1 P-T ratings. API 615 §7.1 — material selection overview.",
      },
    };
  }

  // --- TRIM SELECTION ---
  let seatMaterial = "";
  let discBallMaterial = "";
  let stemMaterial = "";

  if (valveType.includes("Ball")) {
    if (temp > 200 || serviceType === "High Pressure Steam" || classNum >= 900) {
      seatMaterial = "Metal Seat (Stellite 6 overlay)";
      discBallMaterial = "SS 316 + ENP / Stellite overlay";
      rationale.trim = {
        reason: "Metal-to-metal seats selected for high temperature (> 200°C) or high pressure (≥ 900#) service. PTFE and soft seats degrade above ~200°C and cannot withstand the cyclic thermal and mechanical loads. Stellite 6 provides excellent hardness, corrosion resistance, and galling resistance.",
        rule: "T > 200°C or Class ≥ 900#: Metal seats mandatory — soft seats (PTFE) not suitable. Stellite 6 hardfacing per API 6D.",
        refs: ["API 6D §6.3", "API 608 §6", "ASTM B3 (Stellite)"],
      };
    } else if (serviceType === "Oxygen Service") {
      seatMaterial = "PTFE (O2 compatible)";
      discBallMaterial = "SS 316 (O2 cleaned)";
      rationale.trim = {
        reason: "PTFE seats selected — compatible with oxygen and free from hydrocarbons. PTFE does not ignite in O₂ at normal service conditions. All trim components must be oxygen-cleaned.",
        rule: "O₂ service: PTFE seats, all parts O₂-cleaned. No hydrocarbon-based lubricants or elastomers.",
        refs: ["CGA G-4.1", "API 615 §7.5"],
      };
    } else if (serviceType === "Cryogenic Service") {
      seatMaterial = "PTFE / DEVLON";
      discBallMaterial = "SS 316";
      rationale.trim = {
        reason: "PTFE or DEVLON (nylon-based) seats maintain flexibility and sealing ability at cryogenic temperatures where elastomers become brittle. SS 316 ball retains toughness at low temperatures.",
        rule: "Cryogenic: PTFE/DEVLON seats — elastomers become brittle at low temperatures, causing seat failure.",
        refs: ["API 615 §6.2", "BS EN ISO 28921 (Cryogenic valves)"],
      };
    } else {
      seatMaterial = "PTFE / RPTFE";
      discBallMaterial = "SS 316 + ENP";
      rationale.trim = {
        reason: "PTFE (or glass-reinforced PTFE / RPTFE) seats are standard for ball valves in general service below 200°C. PTFE provides low friction, chemical resistance, and reliable sealing. Electroless Nickel Plating (ENP) on the SS 316 ball improves hardness and corrosion resistance.",
        rule: "General service (T ≤ 200°C, Class ≤ 600#): PTFE seats — standard soft-seat ball valve. ENP on ball improves hardness.",
        refs: ["API 6D §6.3", "API 608 §6", "ASME B16.34"],
        basicExplanation: {
          designRequirement: "Seats must seal the ball reliably at operating pressure and temperature, and must withstand repeated cycling without losing their sealing ability.",
          engineeringLogic: "PTFE is a plastic that deforms slightly under bolt/pressure load to conform to the ball surface — this gives a bubble-tight seal without needing precision-ground metal surfaces. It's chemically resistant to almost everything, has low friction (so the valve is easy to operate), and is self-lubricating. ENP on the ball hardens the surface so the PTFE doesn't scratch or gouge the ball over repeated cycles.",
          alternativesRejected: "Metal seats are harder to make bubble-tight and require much more precision. They're needed above 200°C where PTFE softens, but unnecessary cost here. PEEK and Nylon seats exist but are less universal than PTFE.",
          codeReference: "API 6D §6.3 and API 608 §6 Table 1 list acceptable trim combinations. API 598 Table 3 gives the seat leakage test requirements that PTFE seats are designed to meet.",
        },
        expertExplanation: {
          designRequirement: "Seat leakage: Class A (zero leakage, measured per API 598 Table 3) for hydrocarbon isolation. PTFE maximum service temperature: 200°C continuous (240°C intermittent). At Class 600#, seat stress = F_seat/A_seat — verify PTFE yield strength at max temperature > contact stress.",
          engineeringLogic: "PTFE creep relaxation over time reduces seat preload — glass-filled RPTFE (typically 25% glass) has lower creep rate and better compressive strength (~40 MPa vs. 12 MPa for virgin PTFE). ENP hardness: typically 50–60 HRC (as plated) — provides hardness differential over PTFE to prevent galling. Ball surface roughness: Ra ≤ 0.4 μm required for Class A sealing with PTFE seats. Anti-static resistance < 10 Ω per API 6D Annex E — PTFE seat breaks electrical continuity between ball and body.",
          alternativesRejected: "Stellite seats: Metal-to-metal sealing requires lapping and higher closing torque; not justified below 200°C. PEEK seats: Higher temperature range (250°C) and lower creep than PTFE, but 3–4× cost premium, typically specified only for sour/special service. Graphite seats: No longer common for ball valves; packing application instead.",
          codeReference: "API 6D §6.3 — Table 2: Acceptable material combinations. API 608 §6 Table 1 — trim combinations. API 598 Table 3 — Class A leakage limits. API 6D Annex E — anti-static test requirements.",
        },
      };
    }
    stemMaterial = "SS 316 / 17-4 PH";
  } else if (valveType.includes("Gate")) {
    seatMaterial = "Stellite 6 Hardfaced";
    discBallMaterial = "Stellite 6 Hardfaced Wedge";
    stemMaterial = "AISI 410 / F6a";
    rationale.trim = {
      reason: "Stellite 6 hardfacing on gate and wedge faces provides excellent resistance to galling, erosion, and wear — critical for gate valves where seating surfaces slide against each other. 13Cr (F6a/410) stem provides corrosion resistance and sufficient strength.",
      rule: "Gate valve: Stellite 6 hardfaced seats/wedge — prevents galling during operation. 13Cr stem per API 600.",
      refs: ["API 600 §6.5 (Trim materials)", "API 615 §7.6", "ASTM A182 F6a"],
    };
  } else if (valveType.includes("Globe")) {
    seatMaterial = "Stellite 6 Hardfaced";
    discBallMaterial = "Stellite 6 Disc/Plug";
    stemMaterial = "AISI 410 / F6a";
    rationale.trim = {
      reason: "Globe valves in throttling service experience high velocity flow at intermediate openings, causing erosion and wire-drawing on seats. Stellite 6 hardfacing resists this erosion and provides the hardness needed for reliable shutoff.",
      rule: "Globe valve throttling: Stellite 6 on seat and disc — hardness resists wire-drawing erosion at partial openings.",
      refs: ["API 623 §6 (Trim)", "API 615 §7.6"],
    };
  } else if (valveType.includes("Butterfly")) {
    if (temp > 200 || classNum >= 600) {
      seatMaterial = "Metal-to-Metal (Stellite)";
      discBallMaterial = "CF8M + Stellite Overlay";
      rationale.trim = {
        reason: "Metal-to-metal seats for high temperature or high pressure butterfly valves. Soft seats (PTFE/elastomers) cannot seal reliably above ~200°C or at higher pressures. Stellite overlay on the disc provides the hardness needed for metal-to-metal sealing.",
        rule: "T > 200°C or Class ≥ 600#: Metal-seated butterfly valve — triple offset geometry required for metal-to-metal sealing.",
        refs: ["API 609 §6", "API 615 §6.4"],
      };
    } else {
      seatMaterial = "PTFE / RTFE Laminated";
      discBallMaterial = "CF8M (SS 316 Cast)";
      rationale.trim = {
        reason: "PTFE or resilient seat for standard service butterfly valves provides reliable sealing and is cost-effective. Laminated PTFE construction handles minor disc misalignment. CF8M disc provides corrosion resistance.",
        rule: "Standard service BFV: PTFE/resilient seat — good sealing, cost-effective. Not suitable above 200°C or in abrasive service.",
        refs: ["API 609 §6", "ASME B16.34"],
      };
    }
    stemMaterial = "SS 316 / 17-4 PH";
  } else if (valveType.includes("Check")) {
    seatMaterial = "Stellite 6 Hardfaced";
    discBallMaterial = "Stellite 6 Hardfaced Disc";
    stemMaterial = "N/A (Hinge Pin: SS 316)";
    rationale.trim = {
      reason: "Check valves experience repeated impact loading as the disc closes against the seat on flow reversal. Stellite 6 hardfacing on both seat ring and disc is required to resist this impact and the resulting wear/galling over thousands of operating cycles.",
      rule: "Check valve: Stellite 6 on seat and disc — impact-resistant hardfacing required for repeated disc closure.",
      refs: ["API 6D §6.3", "BS 1868 (Check valves)", "API 615 §6.6"],
    };
  } else if (valveType.includes("Plug")) {
    seatMaterial = "PTFE Sleeve / Lubricated";
    discBallMaterial = "SS 316 Plug";
    stemMaterial = "AISI 410";
    rationale.trim = {
      reason: "Plug valves use either a PTFE sleeve (non-lubricated) or injected lubricant sealant (lubricated) to form the seal between plug and body. The PTFE sleeve provides low-friction operation and chemical resistance. Lubricated plugs use grease injection to maintain sealing in dirty/abrasive service.",
      rule: "Plug valve: PTFE sleeve for clean service, lubricated type for slurry/dirty. Sealant injection maintains tight shutoff.",
      refs: ["API 6D §5.3", "API 599 (Plug valves)", "API 615 §6.3"],
    };
  } else if (valveType.includes("Relief")) {
    seatMaterial = "Stellite 6 / SS 316 Lapped";
    discBallMaterial = "SS 316 / Stellite";
    stemMaterial = "SS 316";
    rationale.trim = {
      reason: "Precision-lapped seat and disc are critical for relief valve tightness at operating pressures up to 90% of set pressure. Stellite or SS 316 lapped seats minimise leakage and ensure repeatable set pressure performance. API 598 tightness test must be passed.",
      rule: "Relief valve: Lapped seat/disc — precision seating required. Must meet API 598 leakage test below set pressure.",
      refs: ["API 526 §5", "API 598 (Valve testing)", "API 520 Part I"],
    };
  } else {
    seatMaterial = "SS 316";
    discBallMaterial = "SS 316";
    stemMaterial = "SS 316";
    rationale.trim = {
      reason: "SS 316 trim is selected as standard corrosion-resistant material for general service.",
      rule: "General: SS 316 trim — corrosion resistant, suitable for most process fluids.",
      refs: ["ASME B16.34", "API 615"],
    };
  }

  // --- END CONNECTION ---
  let endConnection = "";
  let endConnectionStd = "";

  const isSmallBoreDrainSW = size <= 1.5 && classNum <= 600 &&
    (valveFunction === "Sampling" || valveFunction === "Drain" || valveFunction === "Vent");
  const isHighPressureSmall = size <= 1.5 && classNum >= 900;

  if (isSmallBoreDrainSW || isHighPressureSmall) {
    endConnection = "Socket Weld (SW)";
    endConnectionStd = "ASME B16.11";
    rationale.endConnection = {
      reason: "Socket weld end connections are selected for small bore (≤ 1.5\") drain/vent/sample and high pressure connections. SW provides a leak-free joint without the need for flanges, reducing potential leak paths — important for small bore and high pressure instrumentation connections.",
      rule: "NPS ≤ 1.5\" (drain/vent/sample or ≥ 900#): Socket weld — compact, leak-free, no flange required.",
      refs: ["ASME B16.11 (Forged fittings — SW)", "ASME B31.3 §328.5", "API 615 §8.2"],
    };
  } else if (valveType.includes("Butterfly") && !valveSubtype.includes("Triple")) {
    endConnection = "Wafer / Lug Type";
    endConnectionStd = "API 609";
    rationale.endConnection = {
      reason: "Wafer/lug end connection for standard butterfly valves. The valve body is clamped between flanges using through-bolts (wafer) or tapped into lug holes. This is the standard and most economical BFV installation. Lug type allows one side to be blinded for line removal.",
      rule: "Standard BFV: Wafer or lug — standard installation, clamps between flanges. Lug type where pipeline removable from one side.",
      refs: ["API 609 §5.2", "ASME B16.10"],
    };
  } else if (valveType.includes("Check") && valveSubtype.includes("Dual")) {
    endConnection = "Wafer Type";
    endConnectionStd = "API 594";
    rationale.endConnection = {
      reason: "Dual plate check valves are inherently wafer-type — the thin body is clamped between pipe flanges, making them extremely compact. Face-to-face dimensions per API 594.",
      rule: "Dual plate check: Wafer — compact face-to-face, clamps between flanges per API 594.",
      refs: ["API 594", "ASME B16.10"],
    };
  } else {
    endConnection = classNum >= 900 ? "Flanged (RTJ)" : "Flanged (RF)";
    endConnectionStd = size > 24 ? "ASME B16.47" : "ASME B16.5";
    rationale.endConnection = {
      reason: classNum >= 900
        ? `Ring Type Joint (RTJ) flanges for Class ≥ 900#. At high pressures, the RTJ gasket (octagonal or oval ring) provides superior sealing integrity compared to spiral wound on a raised face, by creating a high unit stress metal-to-metal contact.`
        : `Raised Face (RF) flanged ends are standard for Class 150–600#. The spiral wound gasket on the raised face provides reliable sealing with normal bolt loads. ${size > 24 ? "ASME B16.47 applies for NPS > 24\"." : "ASME B16.5 covers NPS ½\" through 24\"."}`,
      rule: classNum >= 900
        ? "Class ≥ 900#: RTJ flange mandatory — higher contact stress gasket for high pressure sealing."
        : "Class 150–600#: RF flange with SWG — standard flanged joint. ASME B16.5 (≤ 24\") or B16.47 (> 24\").",
      refs: classNum >= 900
        ? ["ASME B16.5 §6.4 (RTJ)", "ASME B16.20 (RTJ gaskets)", "API 615 §8.2"]
        : ["ASME B16.5", size > 24 ? "ASME B16.47" : "ASME B16.5", "ASME B16.20 (SWG)"],
      basicExplanation: classNum >= 900 ? {
        designRequirement: "At very high pressures (Class 900# and above), the gasket joint must not leak even under extreme bolt load cycling, vibration, and thermal expansion.",
        engineeringLogic: "An RTJ gasket is a solid metal ring (oval or octagonal cross-section) that fits into a groove machined into both flanges. When you tighten the bolts, the ring is crushed into the groove, creating a metal-to-metal seal with very high unit contact stress — much higher than a spiral wound gasket on a flat face. This is needed at high pressure because a spiral wound gasket would blow out.",
        alternativesRejected: "Raised face with spiral wound gasket (Class 900 RF) is not standard practice — the SWG does not develop sufficient contact stress at Class 900# bolt loads to seal reliably at high pressure. Flat face gaskets are only for Class 150 cast iron flanges — not acceptable in process service.",
        codeReference: "ASME B16.5 §6.4 covers RTJ groove dimensions. ASME B16.20 §5 Table 5 gives the ring dimensions. Specify ring material as soft iron (non-corrosive) or SS 316 (corrosive/elevated temperature).",
      } : {
        designRequirement: "The flange connection must contain the process fluid at operating pressure with a reliable, repeatable seal that can be assembled in the field without special skills.",
        engineeringLogic: "A Raised Face (RF) flange has a small raised area in the centre where the gasket sits. The spiral wound gasket (alternating steel winding and graphite filler) accommodates minor surface irregularities and bolt load relaxation. Bolts compress the gasket onto the raised face, creating the seal. This is the most widely used flange joint in process plants because it's reliable, well-understood, and easy to assemble.",
        alternativesRejected: "Full face flanges are used with flat-face cast iron equipment — not standard for steel process pipe. RTJ flanges are over-specified for Class 150–600# service and require precision-machined grooves. Ring joint flanges cost more and are harder to align in the field.",
        codeReference: `ASME B16.5 Table 2 provides P-T ratings for all material groups and pressure classes. ASME B16.20 §4 covers spiral wound gasket dimensions. ${size > 24 ? "ASME B16.47 covers large bore flanges NPS > 24\"." : ""}`,
      },
      expertExplanation: classNum >= 900 ? {
        designRequirement: "Class ≥ 900# flanges per ASME B16.5: RTJ facing required per §6.4. Ring dimensions per ASME B16.20 Table 5 (R-numbers). Flange bore and ring R-number must match.",
        engineeringLogic: "RTJ contact stress: σ_contact = F_bolt / A_contact (projected ring area). For octagonal ring: A_contact = 2 × π × d_ring × b, where b = contact width (typically 3–5 mm). At Class 900#, σ_contact typically 500–800 MPa — well above minimum seating stress for soft iron (~140 MPa) and SS 316 (~280 MPa). Ring hardness must be less than flange hardness to prevent groove damage on re-use. Soft iron (HB 90–120), SS 316 (HB 160), Inconel 625 (HB 220).",
        alternativesRejected: "Raised face SWG at Class 900# (API 6D does allow this for some pipeline service but not per ASME B16.5 convention): m-factor for SWG ≈ 3–3.5; at Class 900# bolt loads, gasket seating stress is marginally adequate but no margin for upset conditions. RTJ provides 3–4× higher contact stress. Flat face: Only for flanges where bending would damage mating equipment — not applicable to steel valve bodies.",
        codeReference: "ASME B16.5 §6.4 — RTJ groove geometry. ASME B16.20 §5 Table 5 — ring gasket dimensions and R-numbers. ASME PCC-1 — bolt tightening procedure. API 615 §8.2.",
      } : {
        designRequirement: "ASME B16.5 §6.3.1: Class 150–600 flanges — raised face standard. Gasket seating stress (y) and maintenance factor (m) per ASME VIII Div 1 Appendix 2 for SWG: y = 69 MPa, m = 3.0.",
        engineeringLogic: "Spiral wound gasket design: metal winding (SS 316 or CS) provides resilience; graphite filler fills surface irregularities and prevents blowout. Gasket factor y ensures minimum seating stress is achieved at design bolt load. Centring ring prevents inward buckling. For Class ≥ 600# or hydrogen/sour service: specify SWG with inner ring to prevent inner winding collapse. Bolt load: F_bolt = 2 × π × W × G × m × P (where G = mean gasket diameter) per ASME VIII Div 1 App. 2.",
        alternativesRejected: `Full face gasket: Only with flat face flanges on cast iron — not compatible with steel RF flanges (flanges would bend). Kammprofile gasket: Used in specialised or heat exchanger service — higher cost, limited availability. RTJ: Over-specified for Class ≤ 600# and adds cost and difficulty in field assembly. ${size > 24 ? "ASME B16.47 Series A (MSS SP-44, heavier) vs Series B (API 605, lighter) — confirm with pipe line class." : ""}`,
        codeReference: `ASME B16.5 Table 2 — P-T ratings by material group. ASME B16.20 §4 — SWG dimensions and materials. ASME VIII Div 1 App. 2 — gasket design factors. ${size > 24 ? "ASME B16.47 — large diameter flanges." : "API 615 §8.2 — end connection selection."}`,
      },
    };
  }

  // --- OPERATOR SELECTION ---
  let operator = "";

  if (valveFunction === "Pressure Relief / Safety" || valveFunction === "Non-Return (Check)") {
    operator = "Self-Actuated (No Operator)";
    rationale.operator = {
      reason: "Relief valves and check valves are self-actuated by process conditions — they open and close in response to pressure differential or flow direction. No external operator is fitted or required.",
      rule: "PSV / Check valves: Self-actuated by process conditions. No manual operator.",
      refs: ["API 526 §4", "API 6D §6.7"],
    };
  } else if (valveType.includes("Ball") || valveType.includes("Butterfly") || valveType.includes("Plug")) {
    // Quarter-turn valves: lever vs gear based on torque (size + class)
    if (size <= 2 && classNum <= 300) {
      operator = "Lever Operated";
      rationale.operator = {
        reason: `Lever operator for small quarter-turn valves (≤ 2\", ≤ Class 300). At these sizes the operating torque is low enough (typically < 80 Nm) for comfortable manual lever operation. The lever also provides a clear visual indication of valve position (open = lever parallel to pipe; closed = lever perpendicular).`,
        rule: "Quarter-turn valve ≤ 2\", ≤ 300#: Lever — low torque, quarter-turn visual position indicator. ISO 5211 mounting pad standard.",
        refs: ["API 6D §6.7", "ISO 5211 (Actuator mounting flanges)", "API 615 §9.2"],
      };
    } else if (size <= 4 && classNum <= 600) {
      operator = "Lever Operated";
      rationale.operator = {
        reason: `Lever operator still feasible for this size/class combination. Torque remains within manual lever capability. For Class 600#, operator torque should be verified against the maximum lever force (typically 360 N) per manufacturer torque data.`,
        rule: "Quarter-turn ≤ 4\", ≤ 600#: Lever — torque typically manageable. Verify against manufacturer torque curves at maximum differential pressure.",
        refs: ["API 6D §6.7", "ISO 5211", "EN 12570 (Sizing of manually operated actuators)"],
      };
    } else if (size <= 12 && classNum <= 600) {
      operator = "Gear Operated";
      rationale.operator = {
        reason: `Gear operator required for larger quarter-turn valves (5\"–12\", Class 150–600). As valve size and pressure class increase, the seating/unseating torque rises rapidly. Gear operators (worm gear) multiply the input handwheel force by the gear ratio, making operation safe and practical. They also prevent sudden opening/closing.`,
        rule: "Quarter-turn 5\"–12\", ≤ 600#: Gear operator — torque too high for lever. Worm gear ratio reduces required operating force.",
        refs: ["API 6D §6.7", "ISO 5210 (Multi-turn actuator flanges)", "EN 12570"],
      };
    } else if (size <= 4 && classNum >= 900) {
      operator = "Gear Operated";
      rationale.operator = {
        reason: `Gear operator selected even for this smaller size because Class 900# and above significantly increases operating torque due to higher seat loads from pressure. Lever operation would exceed ergonomic safe limits.`,
        rule: "Quarter-turn ≤ 4\", ≥ 900#: Gear operator — high pressure class drives high torque, lever not suitable.",
        refs: ["API 6D §6.7", "EN 12570", "ISO 5211"],
      };
    } else {
      operator = "Gear Operated";
      rationale.operator = {
        reason: `Gear operator for large and/or high pressure quarter-turn valves. At these sizes and pressures, seating torque is high. Worm gear operators provide the required mechanical advantage. For sizes ≥ 20\", consider motorised or pneumatic actuator for remote operation and to reduce cycle time.`,
        rule: "Large quarter-turn (> 12\") or high class: Gear operator mandatory. Consider powered actuator ≥ 20\" for practical operation.",
        refs: ["API 6D §6.7", "ISO 5210", "API 615 §9.3"],
      };
      if (size >= 20) {
        warnings.push(`Consider motorized or pneumatic actuator for valves ≥ 20" for ease of operation`);
      }
    }
  } else if (valveType.includes("Gate") || valveType.includes("Globe")) {
    // Multi-turn valves: handwheel vs gear
    if (size <= 8 && classNum <= 600) {
      operator = "Handwheel";
      rationale.operator = {
        reason: `Handwheel for multi-turn valves (gate/globe) up to 8\", ≤ 600#. The multi-turn operation inherently multiplies force, making handwheel operation feasible at these sizes. Minimum handwheel diameter per ASME B16.41 or valve standard.`,
        rule: "Gate/Globe ≤ 8\", ≤ 600#: Handwheel — multi-turn provides sufficient mechanical advantage for manual operation.",
        refs: ["API 600 §6.8 (Handwheel)", "ASME B16.41", "API 615 §9.2"],
      };
    } else {
      operator = "Gear Operated";
      rationale.operator = {
        reason: `Gear operator for large or high-pressure gate/globe valves. Above 8\" or Class 900+, the stem thrust required to open against differential pressure and body distortion exceeds what a handwheel alone can practically deliver. A bevel or spur gear reduces the required input torque.`,
        rule: "Gate/Globe > 8\" or ≥ 900#: Gear operator — stem thrust too high for direct handwheel. Gear ratio per valve manufacturer data.",
        refs: ["API 600 §6.8", "ISO 5210", "API 615 §9.3"],
      };
      if (size >= 20) {
        warnings.push(`Consider motorized or pneumatic actuator for valves ≥ 20" for ease of operation`);
      }
    }
  } else {
    operator = "Handwheel";
    rationale.operator = {
      reason: "Handwheel as default manual operator.",
      rule: "Default: Handwheel for manual operation.",
      refs: ["ASME B16.34", "API 615"],
    };
  }

  // --- GASKET ---
  let gasket = "";
  if (endConnection.includes("RTJ")) {
    gasket = "Ring Type Joint (RTJ) - Soft Iron / SS 316";
    rationale.gasket = {
      reason: "RTJ gaskets (oval or octagonal ring) for Class ≥ 900# flanges. The metal ring creates a high unit stress seal in the groove, maintaining integrity at high pressure and temperature. Soft iron for non-corrosive service; SS 316 for corrosive or elevated temperature.",
      rule: "RTJ flange (≥ 900#): Metal ring gasket — oval or octagonal per ASME B16.20. Material matched to service.",
      refs: ["ASME B16.20 §5", "ASME B16.5 §6.4"],
    };
  } else if (serviceType === "Hydrogen Service" || serviceType === "Corrosive / Sour Service") {
    gasket = "Spiral Wound with SS 316 Inner Ring - ASME B16.20";
    rationale.gasket = {
      reason: "For hydrogen and sour service, a spiral wound gasket (SWG) with an inner ring is used to prevent inward buckling of the winding under bolt load, and to ensure consistent sealing performance. The inner ring fills the bore and prevents spiral relaxation. SS 316 windings resist H₂S corrosion.",
      rule: "H₂ / Sour service: SWG with inner ring — inner ring prevents winding collapse and maintains sealing. SS 316 winding material.",
      refs: ["ASME B16.20 §4", "ASME PCC-1 (Flange joint assembly)", "API 615 §8.3"],
    };
  } else {
    gasket = "Spiral Wound (SS 316 / Graphite) - ASME B16.20";
    rationale.gasket = {
      reason: "Spiral wound gasket (SWG) is the industry standard for process flanged joints. The alternating metal winding (SS 316) and filler (flexible graphite) provides resilience to bolt load relaxation, temperature cycling, and vibration. ASME B16.20 governs dimensions and performance.",
      rule: "Standard service: SWG per ASME B16.20 — resilient, resistant to temperature cycling and bolt relaxation. Do not substitute with sheet gaskets in process service.",
      refs: ["ASME B16.20 §4", "API 615 §8.3", "ASME PCC-1"],
      basicExplanation: {
        designRequirement: "The gasket must seal the flanged joint reliably throughout the operating life — including during temperature cycles, vibration, and bolt relaxation over time.",
        engineeringLogic: "A spiral wound gasket is made by winding a thin metal strip (SS 316) and a soft filler (flexible graphite) in a spiral. When bolts are tightened, the gasket compresses and the soft graphite fills any surface irregularities on the flange faces. When temperature changes, the metal spring-back of the winding maintains contact pressure even as bolts relax. This resilience is why SWGs are so reliable in process service.",
        alternativesRejected: "Sheet gaskets (compressed fibre or rubber sheet) are only for low-pressure utility service — they creep under bolt load and do not recover when temperature changes. Kammprofile gaskets are for special high-integrity joints (heat exchangers). RTJ is unnecessary at Class 150–600#.",
        codeReference: "ASME B16.20 §4 and Table 1 give SWG dimensions for each pipe size and pressure class. ASME PCC-1 covers bolt tightening procedure to achieve the required gasket seating stress.",
      },
      expertExplanation: {
        designRequirement: "SWG gasket factors per ASME VIII Div 1 App. 2: m = 3.0, y = 69 MPa (seating stress). Minimum bolt load: W_m2 = π × G × y (seating condition). For Class ≥ 600# or hydrogen service: inner ring required to prevent inward winding collapse (inner ring min. bore = pipe ID).",
        engineeringLogic: "SWG spring constant: typically 1.0–1.5 kN/mm per mm of gasket face. Graphite filler: maximum continuous temperature 450°C in oxidising atmosphere, 650°C in non-oxidising. SS 316 winding: max ~550°C. For higher temperatures, specify Inconel 625 winding + flexible graphite filler. Outer ring (carbon steel or SS) acts as compression stop — prevents over-tightening and maintains minimum load even after thermal relaxation. ASME PCC-1 tightening: target bolt stress typically 275–345 MPa for SA-193 B7 studs.",
        alternativesRejected: "Kammprofile (grooved metal gasket): Used where high seating stress is needed with lower bolt loads (e.g., heat exchangers). Higher precision required — not cost-effective for standard process piping. Sheet gasket (CAF/PTFE): m ≈ 2.0, y ≈ 11 MPa — insufficient for process service above Class 150#. Ring joint: Provides higher contact stress but requires precision-machined grooves — over-specified for Class ≤ 600#.",
        codeReference: "ASME B16.20 §4 — SWG dimensions. Table 1 — inner/outer diameter by NPS and class. ASME VIII Div 1 App. 2 — gasket design factors (m, y). ASME PCC-1 — bolt tightening guidelines. API 615 §8.3.",
      },
    };
  }

  // --- PACKING ---
  let packing = "";
  if (serviceType === "Oxygen Service") {
    packing = "PTFE (Oxygen compatible)";
    rationale.packing = {
      reason: "PTFE packing is selected for oxygen service — it is compatible with O₂ and free from hydrocarbon contamination risk. Graphite packing must not be used in pure oxygen service as it can ignite.",
      rule: "O₂ service: PTFE packing only. Graphite packing prohibited — ignition risk in oxygen.",
      refs: ["CGA G-4.1", "API 615 §8.4"],
    };
  } else if (temp > 250) {
    packing = "Flexible Graphite";
    rationale.packing = {
      reason: "Flexible graphite packing for high temperature service (> 250°C). PTFE has a maximum service temperature of approximately 200–260°C before it begins to degrade. Flexible graphite maintains sealing integrity up to 550°C in non-oxidising service.",
      rule: "T > 250°C: Flexible graphite packing — PTFE max service temperature exceeded. Graphite suitable to 550°C in non-oxidising atmospheres.",
      refs: ["API 615 §8.4", "API 622 (Packing fugitive emissions testing)"],
    };
  } else {
    packing = "PTFE / Flexible Graphite";
    rationale.packing = {
      reason: "PTFE or flexible graphite packing for general service. PTFE provides excellent chemical resistance and low friction. Flexible graphite is the alternative for steam or higher temperature service. Both are accepted in API 622 fugitive emission testing.",
      rule: "General service: PTFE or graphite packing — both acceptable. Specify per service conditions.",
      refs: ["API 622", "ISO 15848-1 (Fugitive emissions type testing)", "API 615 §8.4"],
      basicExplanation: {
        designRequirement: "The stem packing must prevent leakage from the valve stem to atmosphere throughout the valve's operating life, including cycling and thermal movement.",
        engineeringLogic: "Packing rings are compressed rings of material that sit in the packing box around the valve stem. As the gland is tightened, they deform and fill any gaps between the stem and packing box. PTFE rings are soft, low-friction, and chemically resistant — good for ambient-to-moderate temperature service. Flexible graphite rings tolerate higher temperatures (up to 550°C in non-oxidising atmosphere) and are used for steam and high-temp hydrocarbons.",
        alternativesRejected: "Asbestos packing is obsolete and banned. Braided PTFE rope packing is less consistent than die-formed PTFE rings. Elastomeric O-ring stem seals are used in some designs but have temperature limits.",
        codeReference: "API 622 tests packing systems for fugitive emissions through 1500 mechanical cycles. ISO 15848-1 Class AH is the highest performance rating. API 615 §8.4 and Table 9 guide packing selection by temperature and service.",
      },
      expertExplanation: {
        designRequirement: "Fugitive emission limits: typically 100 ppm vol. (API 622 Class A) or 50 ppm (ISO 15848-1 Class AH) measured at stem. Gland load: minimum 5–7 MPa on packing cross-section to maintain seal. Packing box dimensions per valve design standard (API 600, 608, etc.).",
        engineeringLogic: "PTFE (expanded or die-formed) packing: max 200°C service, friction coefficient μ ≈ 0.05–0.10 (low operating torque). Flexible graphite (FG): max 550°C non-oxidising (> 400°C oxidising atmosphere: C oxidises to CO₂, packing degrades). FG creep rate is lower than PTFE — critical for live-loaded systems. Live-loading: Belleville disc springs maintain minimum gland load as packing creeps/relaxes. Spring load typically 2× minimum required gland load for 10-year service interval. Stem surface finish Ra ≤ 0.8 μm for low emission packing per API 622.",
        alternativesRejected: "Braided PTFE/graphite packing: Inconsistent density distribution — higher leak rate than die-formed rings. Not acceptable for API 622 Class A. Carbon fibre packing: Conductive, used in ATEX environments — but expensive and limited availability. Pure PTFE at T > 200°C: Degrades, creep rate increases dramatically → gland load lost → leakage.",
        codeReference: "API 622 §5 — test procedure, 1500 cycle endurance. Table 1 — leakage class limits. ISO 15848-1 Table 1 — Class A/B/C limits. API 615 §8.4 Table 9 — packing selection matrix.",
      },
    };
  }

  if (serviceType === "Corrosive / Sour Service" || serviceType === "Hydrogen Service" || serviceType === "Chloride / Caustic") {
    packing += " + Live Loaded Packing (API 622 / ISO 15848)";
    rationale.packing = {
      ...rationale.packing,
      reason: rationale.packing.reason + " Live-loaded (spring-loaded) packing is added for sour/hydrogen/chloride service to maintain constant gland force as packing relaxes over time, ensuring continuous low-emission sealing.",
      rule: (rationale.packing.rule || "") + " | Sour/H₂/Cl service: Live-loaded packing required — maintains gland stress as packing creeps.",
      refs: [...(rationale.packing.refs || []), "API 622 (Type testing for fugitive emissions)", "ISO 15848-1"],
    };
    warnings.push("Fugitive emission requirements: Low-E packing per API 622 / ISO 15848-1 recommended");
  }

  // --- FIRE SAFE ---
  let fireSafe = false;
  if (valveType.includes("Ball") || valveType.includes("Butterfly") || valveType.includes("Plug")) {
    if (serviceType !== "Cooling Water" && serviceType !== "Utility Water" && serviceType !== "Instrument Air") {
      fireSafe = true;
      rationale.fireSafe = {
        reason: "Fire-safe design required for quarter-turn valves (ball, butterfly, plug) in hydrocarbon or flammable fluid service. In a fire, the primary soft seat (PTFE) will burn away. A fire-safe valve has a secondary metal-to-metal seat or backup sealing to maintain shutoff after seat destruction, preventing escalation. API 607 defines the test procedure.",
        rule: "Hydrocarbon/flammable service with quarter-turn valve: Fire-safe design per API 607 mandatory — ensures shutoff if primary seat is destroyed by fire.",
        refs: ["API 607 (Fire testing of quarter-turn valves)", "API 6FA (Fire test for valves)", "API 615 §10"],
        basicExplanation: {
          designRequirement: "In a process plant fire, valves must still be able to isolate flammable fluids even after their soft seats and seals have been destroyed by the fire. Without this, a valve that fails open during a fire feeds more fuel to the flames.",
          engineeringLogic: "A fire-safe valve has two layers of sealing. First, the normal soft PTFE seats provide excellent leak-tight shutoff in normal operation. Second, behind the PTFE seat there is a metal ring or secondary sealing surface. If the PTFE burns away in a fire, the ball or disc moves slightly and seats on this metal backup surface. It won't be perfect, but it will keep the valve substantially closed. API 607 tests this by actually burning the valve for 30 minutes and then checking the leakage.",
          alternativesRejected: "Non-fire-safe valves are only acceptable for non-flammable services (water, air, inert gases). In any hydrocarbon or flammable fluid service, a non-fire-safe valve is a safety risk and typically not accepted by the client or safety authority.",
          codeReference: "API 607 §5 defines the fire test: 30-minute exposure at ≥750°C, with pressure maintained. §6 defines the acceptance criteria for post-fire leakage. The valve must carry a certificate to this standard.",
        },
        expertExplanation: {
          designRequirement: "API 607 (6th Edition) mandates post-fire seat leakage ≤ 400 mL/min for valves NPS ≤ 2\" and ≤ 900 mL/min for larger sizes. Test conducted at maximum rated pressure. Fire exposure: minimum 30 minutes at ≥750°C external flame temperature.",
          engineeringLogic: "Fire safe mechanism: Primary PTFE seat ablates at ~260°C. Secondary metal backup seat (typically SS 316 ring or direct ball-body contact) provides ≤ API 607 leakage post-fire. Stem seal backup: secondary graphite or metal lip seal prevents stem blowout if primary elastomeric O-ring fails. Anti-blowout stem design (stem shoulder prevents stem ejection if packing is lost) is also required in most EPC specifications as part of fire-safe design.",
          alternativesRejected: "API 6FA: Older standard, still referenced for gate, globe, check valves in some specifications. API 607 is the current preferred standard for quarter-turn valves. Non-fire-safe design: Acceptable per API 615 §10 only for non-flammable, non-toxic services where fire consequence is not significant.",
          codeReference: "API 607 §5 — test procedure and fire exposure requirements. §6 — post-fire leakage acceptance criteria. API 6FA — alternative for multi-turn valves. API 615 §10 — fire-safe requirement trigger. Project fire and gas philosophy document (vendor doc review).",
        },
      };
    }
  }

  // --- BORE SELECTION (Full Bore vs Reduced Bore) ---
  let boreNote = "";
  const isPiggable = additionalRequirements.includes("Piggable Line (Full Bore Required)");
  const isESD = additionalRequirements.includes("ESD / Emergency Shutdown");
  const isHIPPS = additionalRequirements.includes("HIPPS (High Integrity Pressure Protection)");
  const isSubsea = additionalRequirements.includes("Subsea / Submerged Service") || installationLocation === "Offshore - Subsea";
  const isOffshore = installationLocation.startsWith("Offshore");
  const isHazArea = additionalRequirements.includes("Hazardous Area (ATEX / IECEx)");
  const isLowEmission = additionalRequirements.includes("Low Emission (Fugitive Emissions)");
  const isAntiStatic = additionalRequirements.includes("Anti-Static Device Required");
  const isCavityRelief = additionalRequirements.includes("Cavity Relief Required");
  const isBidirectional = additionalRequirements.includes("Bidirectional Sealing");
  const isArctic = installationLocation === "Arctic / Cold Climate";
  const isNoiseReq = additionalRequirements.includes("Noise / Vibration Sensitive");

  if (valveType.includes("Ball")) {
    if (isPiggable) {
      boreNote = "Full Bore (FB) mandatory — piggable line requires unobstructed internal diameter equal to pipe bore per pipeline pigging design requirements.";
      valveSubtype = valveSubtype + " — Full Bore (Piggable)";
      rationale.bore = {
        reason: "Full bore ball valve is mandatory for piggable pipelines. Any reduction in internal diameter will obstruct the pig, preventing line cleaning or inspection. Full bore must match pipe ID throughout.",
        rule: "Piggable lines: Full bore (FB) ball valve mandatory — pig must pass without obstruction. Reduced bore (RB) not permitted.",
        refs: ["API 6D §5.2", "API 6D"],
      };
    } else if (isSubsea) {
      boreNote = "Full bore recommended for subsea — interventions are costly, reduced bore increases pressure drop and may trap debris.";
      valveSubtype = valveSubtype + " — Full Bore (Subsea)";
      rationale.bore = {
        reason: "Full bore specified for subsea service. Subsea valve maintenance or replacement is extremely costly. Full bore minimises pressure drop, reduces debris accumulation risk in the cavity, and allows future pigging without line modifications.",
        rule: "Subsea: Full bore preferred — maintenance access is expensive, full bore increases reliability and operational flexibility.",
        refs: ["API 6D §5.2", "API 6D"],
      };
    } else if (isESD || isHIPPS) {
      boreNote = "Full bore required for ESD/HIPPS — must achieve full flow isolation and fast stroking with minimum pressure loss on demand.";
      rationale.bore = {
        reason: "ESD and HIPPS valves require full bore design to ensure the full-bore flow path is available for emergency depressurisation and to minimise pressure drop in the safety function path. Reduced bore ESD valves may not meet SIL-rated closure time requirements.",
        rule: "ESD/HIPPS: Full bore — minimises dP, ensures demanded safety function (fast full closure) meets SIL target. IEC 61511 SIL verification required.",
        refs: ["API 6D §5.2", "IEC 61511 (Functional Safety — Safety Instrumented Systems)", "API 6D"],
      };
      valveSubtype = valveSubtype + " — Full Bore (ESD)";
    } else if (size >= 6) {
      boreNote = "Reduced bore (RB) acceptable for isolation duty at this size — check pressure drop allowance. Full bore if pressure drop is critical.";
      rationale.bore = {
        reason: "For larger ball valves in standard isolation service, reduced bore (RB) offers significant cost and weight savings. A one-size reduction in bore is typical (e.g., 8\" valve with 6\" bore). Verify pressure drop is within allowable limits. If pressure drop is critical or pigging is required, specify full bore.",
        rule: "Standard isolation ≥ 6\": RB acceptable — verify pressure drop. Specify FB only where pigging, ESD, or low-dP requirements apply.",
        refs: ["API 6D §5.2", "API 615 §6.2"],
      };
    }
  }

  // --- LOCATION & ENVIRONMENTAL RATIONALE ---
  if (installationLocation) {
    const locReasons = [];
    const locRules = [];
    const locRefs = ["API 615 §7.1"];

    if (isOffshore) {
      locReasons.push("Offshore installations require enhanced corrosion protection due to saline atmosphere, humidity, and potential splash zone exposure. All external surfaces should be coated or specified in duplex/super duplex where corrosion risk is high. Weight and space constraints favour compact valve types (ball, butterfly, dual plate check). Weight savings are critical for topside structural loads.");
      locRules.push("Offshore: Prefer compact, low-weight valves (ball, triple offset BFV, dual plate check). External coating/cathodic protection required. Material selection to resist marine atmosphere corrosion.");
      locRefs.push("NORSOK M-001 (Materials selection)", "ISO 21457 (Materials selection for seawater systems)");
      if (!isSubsea) {
        warnings.push("Offshore topside: Specify marine-grade external coating and corrosion allowance for saline atmosphere");
      }
    }
    if (isSubsea) {
      locReasons.push("Subsea valves require hydraulically or ROV-actuated designs, cathodic protection, and materials resistant to seawater at depth pressure. All seals must be rated for subsea pressure differential. Retrievability and intervention costs must be considered in valve type and specification.");
      locRules.push("Subsea: Hydraulic or ROV actuated. Seawater-resistant materials (super duplex, Inconel, titanium). Cathodic protection. Full bore preferred.");
      locRefs.push("ISO 13628-4 (Subsea wellhead and tree equipment)", "NORSOK D-001");
      warnings.push("Subsea service: Specialist subsea valve design required. Hydraulic actuation, cathodic protection, and ROV interface mandatory");
    }
    if (isArctic) {
      locReasons.push("Arctic environments impose low ambient temperature requirements on all materials including body, bonnet, operator, and actuator. Charpy impact testing at MDMT is mandatory. Electric actuators must be specified for low-temperature operation. Winterisation (insulation, heat tracing) may be required.");
      locRules.push("Arctic: Body and bonnet must be impact-tested at MDMT (as low as -60°C). Specify low-temperature grease in gearboxes and actuators. Consider heated enclosures.");
      locRefs.push("ASME B16.34 Table A1", "ASTM A352 LCB/LCC");
      warnings.push("Arctic service: All materials must be impact-tested at MDMT. Actuators and lubricants must be rated for low ambient temperature");
    }
    if (installationLocation === "Marine / Coastal (Saline Atmosphere)") {
      locReasons.push("Marine and coastal atmospheres have elevated chloride content causing accelerated external corrosion. Austenitic stainless steel external bolting may suffer Chloride SCC. Duplex or 316L bolting, hot-dip galvanising of carbon steel parts, and epoxy-based coatings are recommended.");
      locRules.push("Marine/Coastal: Upgrade external bolting to duplex or 316L SS. Specify external anti-corrosion coating. Avoid unprotected carbon steel external surfaces.");
      locRefs.push("ISO 12944 (Corrosion protection of steel by protective paint systems)");
    }
    if (installationLocation === "Desert / High Ambient") {
      locReasons.push("High ambient temperatures (up to 55°C+) affect actuator selection — pneumatic actuators may require stainless instrument air tubing and sun shades. Elastomers must be rated for high temperature. ATEX rating for the actuator power supply may apply.");
      locRules.push("High ambient: Verify actuator temperature rating. Sun shields for actuators. High-temperature elastomers for external seals.");
      locRefs.push("API 615 §9.3");
    }

    if (locReasons.length > 0) {
      rationale.location = {
        reason: locReasons.join(" "),
        rule: locRules.join(" | "),
        refs: locRefs,
      };
    }
  }

  // --- ADDITIONAL REQUIREMENTS RATIONALE ---
  if (additionalRequirements.length > 0) {
    const reqReasons = [];
    const reqRules = [];
    const reqRefs = [];

    if (isHazArea) {
      reqReasons.push("Hazardous area (ATEX Zone 1/2 or IECEx) designation requires all electrical equipment (actuators, limit switches, solenoids) to be certified to the appropriate Equipment Protection Level (EPL). Pneumatic actuators are often preferred in Zone 1 hazardous areas to avoid ignition sources from electrical equipment.");
      reqRules.push("ATEX/IECEx: All electrical items (actuators, solenoids, limit switches) must carry ATEX/IECEx certification for the zone. Pneumatic preferred in Zone 1.");
      reqRefs.push("ATEX Directive 2014/34/EU", "IECEx IEC 60079-14 (Electrical installations in hazardous areas)");
      warnings.push("Hazardous Area: All electrical equipment (actuators, solenoids, positioners) must be ATEX / IECEx certified for the area classification");
    }
    if (isLowEmission) {
      reqReasons.push("Low emission requirement triggers specification of API 622 / ISO 15848-1 tested packing systems. Live-loaded (spring-loaded) packing glands maintain consistent gland stress as packing creeps over time, ensuring fugitive emission compliance. The valve stem finish and packing box dimensions must meet the tested configuration.");
      reqRules.push("Low Emission: Specify API 622 Class A or ISO 15848-1 Class AH packing. Live-loaded gland. Stem surface finish Ra ≤ 0.8 μm. Do not substitute packing materials post-type test.");
      reqRefs.push("API 622 (Packing fugitive emissions testing)", "ISO 15848-1 (Fugitive emissions type testing)");
    }
    if (isESD) {
      reqReasons.push("ESD valves are part of the Safety Instrumented System (SIS). They must be specified with a Safety Integrity Level (SIL) target per IEC 61511. Valve + actuator assembly must be proof-tested and documented. Fail-safe position (fail-close or fail-open) must be defined based on process hazard analysis.");
      reqRules.push("ESD: Define fail-safe position (FC/FO). SIL verification per IEC 61511 required. Proof test interval and PFD (Probability of Failure on Demand) must be documented.");
      reqRefs.push("IEC 61511 (Functional Safety — Safety Instrumented Systems)", "IEC 61508 (Functional safety of E/E/PE safety-related systems)");
      warnings.push("ESD / SIS valve: SIL verification and functional safety assessment required per IEC 61511");
    }
    if (isHIPPS) {
      reqReasons.push("HIPPS (High Integrity Pressure Protection System) valves are SIL 2/3 rated safety devices that replace or supplement traditional pressure relief. They must close within a defined response time (typically 1–3 seconds) on high pressure demand. The full valve assembly (valve + actuator + solenoid + positioner) must be SIL-assessed as a unit. Redundancy (1oo2 or 2oo3 voting) is common.");
      reqRules.push("HIPPS: SIL 2 or SIL 3 per IEC 61511. Response time and full closure time to be verified by testing. Assembly-level SIL assessment. Full bore valve to minimise dP.");
      reqRefs.push("IEC 61511 (Functional Safety — Safety Instrumented Systems)", "API 6D §5.2");
      warnings.push("HIPPS valve: SIL 2/3 assembly assessment required. Closure time to be tested and documented");
    }
    if (isAntiStatic) {
      reqReasons.push("Static electricity can accumulate on the ball or disc of quarter-turn valves during operation due to the insulating properties of PTFE seats. For flammable or ignitable fluid service, an anti-static device (spring-loaded ball contact or stem-to-body continuity pin) is required to dissipate static charge safely.");
      reqRules.push("Anti-static: Spring contact device between ball/stem and body. Resistance < 10 Ω per API 6D Annex. Tested per API 6D §6.7.");
      reqRefs.push("API 6D §6.7", "API 6D");
    }
    if (isCavityRelief) {
      reqReasons.push("Ball valves trap fluid in the body cavity between the two seats. Thermal expansion of trapped liquid (e.g., LPG, cryogenic fluids) can cause dangerous over-pressure of the body. A cavity relief device (self-relieving seat or external relief valve) is required where trapped liquid overpressure is a risk.");
      reqRules.push("Cavity relief: Specify self-relieving seat (SRS) or external body relief valve. Required for liquid hydrocarbons, LPG, cryogenic, and any service where thermal expansion of trapped fluid creates overpressure risk.");
      reqRefs.push("API 6D §5.3", "API 6D");
    }
    if (isBidirectional) {
      reqReasons.push("Standard ball valves have a primary seating direction where higher pressure assists seating. Bidirectional sealing (equal seating in both directions) requires a double-piston effect (DPE) seat arrangement where both seats are pressure-energised. This is required for pipeline valves where flow direction may reverse.");
      reqRules.push("Bidirectional: Specify double-piston effect (DPE) seats. Both seats must be tested per API 6D in both directions. Suitable for pipeline isolation where flow reversal is possible.");
      reqRefs.push("API 6D §5.2", "API 6D");
    }
    if (isNoiseReq) {
      reqReasons.push("Noise-sensitive areas (near control rooms, residential zones, or areas with strict occupational noise limits) require acoustically evaluated valves. Throttling valves and pressure-reducing stations are the primary noise sources. Noise prediction per IEC 60534-8-3 should be performed. Multi-stage pressure reduction trims can reduce aerodynamic noise by 20–40 dB.");
      reqRules.push("Noise/vibration: Acoustic prediction per IEC 60534-8-3. Consider multi-stage trim or diffuser cage. Velocity in valve outlet must be reviewed. Insulation jacketing may be required.");
      reqRefs.push("IEC 60534-8-3 (Aerodynamic noise prediction)", "IEC 60534");
      warnings.push("Noise sensitive: Acoustic prediction (IEC 60534-8-3) required. Consider multi-stage trim for throttling valves");
    }

    if (reqReasons.length > 0) {
      rationale.requirements = {
        reason: reqReasons.join(" "),
        rule: reqRules.join(" | "),
        refs: reqRefs,
      };
    }

    // Apply requirement-driven packing upgrade
    if (isLowEmission && !packing.includes("API 622")) {
      packing += " + Live Loaded (API 622 Class A / ISO 15848-1)";
    }
    // Fire-safe override for ESD/HIPPS
    if ((isESD || isHIPPS) && (valveType.includes("Ball") || valveType.includes("Butterfly"))) {
      fireSafe = true;
    }
  }

  // --- CHECK VALVE LOCATION-SPECIFIC CRITERIA ---
  if (valveFunction === "Non-Return (Check)" && installationLocation) {
    const checkNotes = [];
    if (isSubsea) {
      checkNotes.push("Subsea check valves: Specify hydraulically damped designs with seawater-resistant materials. ROV-accessible inspection ports where practical.");
    }
    if (isArctic) {
      checkNotes.push("Arctic check valves: Ensure disc/hinge mechanism operates freely at MDMT. Spring-assisted designs prevent disc sticking due to ice formation. Materials must be Charpy impact tested.");
    }
    if (checkNotes.length > 0 && !rationale.location) {
      rationale.location = {
        reason: checkNotes.join(" "),
        rule: "Check valve location criteria: Select type based on installation constraints — weight, space, flow profile, and slam risk.",
        refs: ["API 615 §6.6", "API 594"],
      };
    } else if (checkNotes.length > 0 && rationale.location) {
      rationale.location.reason += " " + checkNotes.join(" ");
    }
  }

  // --- ADDITIONAL WARNINGS ---
  if (classNum >= 1500) {
    warnings.push("High pressure class ≥ 1500#: Engineering review of bolting, gasket, and valve design required");
  }
  if (temp > 400 && temp <= 425) {
    warnings.push("Approaching high temperature material limits: Verify creep/relaxation properties");
  }
  if (fluidType === "Flashing Liquid") {
    warnings.push("Flashing service: Cavitation/erosion analysis required. Consider anti-cavitation trim");
  }
  if (fluidType === "Liquid - Dirty/Slurry") {
    warnings.push("Dirty/slurry service: Consider full bore design. Erosion allowance may be required");
  }

  // Determine valve standard key
  let stdKey = "";
  if (valveType.includes("Ball")) stdKey = "ball";
  else if (valveType.includes("Gate")) stdKey = "gate";
  else if (valveType.includes("Globe")) stdKey = "globe";
  else if (valveType.includes("Butterfly")) stdKey = "butterfly";
  else if (valveType.includes("Plug")) stdKey = "plug";
  else if (valveType.includes("Relief") || valveType.includes("Safety")) stdKey = "relief";
  else if (valveType.includes("Check") && valveSubtype.includes("Swing")) stdKey = "check_swing";
  else if (valveType.includes("Check") && valveSubtype.includes("Dual")) stdKey = "check_dual";
  else if (valveType.includes("Check") && valveSubtype.includes("Piston")) stdKey = "check_piston";
  else stdKey = "ball";

  return {
    valveType,
    valveSubtype,
    bodyMaterial,
    bodyMaterialSpec,
    seatMaterial,
    discBallMaterial,
    stemMaterial,
    endConnection,
    endConnectionStd,
    operator,
    gasket,
    packing,
    fireSafe,
    valveStandard: VALVE_STANDARDS[stdKey] || "ASME B16.34",
    faceToFaceStd: FACE_TO_FACE_STANDARDS[stdKey] || "ASME B16.10",
    testingStandard: TESTING_STANDARD,
    flangeStandard: size > 24 ? "ASME B16.47" : "ASME B16.5",
    warnings,
    alternatives,
    rationale,
  };
}
