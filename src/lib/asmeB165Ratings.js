// ASME B16.5 Pressure-Temperature Ratings (barg) for Material Group 1.1 (A216 WCB — most common carbon steel)
// Source: ASME B16.5 Table 2-1.1
// Each entry: { tempC: max temp (°C), maxPressure: barg }

const GROUP_1_1_RATINGS = [
  { tempC: -29,  maxPressure: 19.6  },  // Class 150
  { tempC: 38,   maxPressure: 19.6  },
  { tempC: 50,   maxPressure: 19.2  },
  { tempC: 100,  maxPressure: 17.7  },
  { tempC: 150,  maxPressure: 15.8  },
  { tempC: 200,  maxPressure: 13.8  },
  { tempC: 250,  maxPressure: 13.1  },
  { tempC: 300,  maxPressure: 12.1  },
  { tempC: 325,  maxPressure: 11.5  },
  { tempC: 350,  maxPressure: 11.0  },
  { tempC: 375,  maxPressure: 10.2  },
  { tempC: 400,  maxPressure: 9.3   },
  { tempC: 425,  maxPressure: 8.4   },
];

// Max pressures (barg) per class at ambient (-29 to 38°C) for Group 1.1
const CLASS_AMBIENT_MAX = {
  "Class 150": 19.6,
  "Class 300": 51.1,
  "Class 600": 102.1,
  "Class 900": 153.2,
  "Class 1500": 255.4,
  "Class 2500": 425.6,
};

// Temperature derating factors relative to ambient (approximated from B16.5 Table 2-1.1 Class 150 curve)
// We apply these proportionally across all classes
const TEMP_DERATING = [
  { maxTempC: -29,  factor: 1.000 },
  { maxTempC: 38,   factor: 1.000 },
  { maxTempC: 50,   factor: 0.980 },
  { maxTempC: 100,  factor: 0.903 },
  { maxTempC: 150,  factor: 0.806 },
  { maxTempC: 200,  factor: 0.704 },
  { maxTempC: 250,  factor: 0.668 },
  { maxTempC: 300,  factor: 0.617 },
  { maxTempC: 325,  factor: 0.587 },
  { maxTempC: 350,  factor: 0.561 },
  { maxTempC: 375,  factor: 0.520 },
  { maxTempC: 400,  factor: 0.474 },
  { maxTempC: 425,  factor: 0.429 },
  // Above 425°C: WCB is not rated — use Cr-Mo
  { maxTempC: 538,  factor: 0.0   },
];

function getDeratingFactor(tempC) {
  const t = parseFloat(tempC);
  if (isNaN(t)) return null;
  if (t > 538) return 0; // Beyond carbon steel range
  for (let i = TEMP_DERATING.length - 1; i >= 0; i--) {
    if (t >= TEMP_DERATING[i].maxTempC) return TEMP_DERATING[i].factor;
  }
  return TEMP_DERATING[0].factor;
}

const CLASS_ORDER = ["150#", "300#", "600#", "900#", "1500#", "2500#"];

// Map "150#" → "Class 150" for lookup
function toClassKey(cls) {
  return "Class " + cls.replace("#", "");
}

/**
 * Recommend the minimum ASME B16.5 pressure class (Group 1.1) that satisfies
 * the given design temperature and pressure (both in metric: °C and barg).
 * Returns { recommendedClass, maxAllowed, factor, note } or null if conditions are missing.
 */
export function recommendPressureClass({ designTemp, designPressure }) {
  const temp = parseFloat(designTemp);
  const pressure = parseFloat(designPressure);
  if (isNaN(temp) || isNaN(pressure)) return null;

  const factor = getDeratingFactor(temp);
  if (factor === null || factor === 0) return null;

  for (const cls of CLASS_ORDER) {
    const ambientMax = CLASS_AMBIENT_MAX[toClassKey(cls)];
    if (!ambientMax) continue;
    const maxAllowed = parseFloat((ambientMax * factor).toFixed(1));
    if (pressure <= maxAllowed) {
      return {
        recommendedClass: cls,
        maxAllowed,
        factor,
        note: `ASME B16.5 Group 1.1 (A216 WCB): ${cls} rated ${maxAllowed} barg at ${temp}°C (derating factor ${factor.toFixed(3)})`,
      };
    }
  }
  // Exceeds 2500#
  return {
    recommendedClass: "2500#",
    maxAllowed: parseFloat((CLASS_AMBIENT_MAX["Class 2500"] * factor).toFixed(1)),
    factor,
    note: `Design conditions exceed ASME B16.5 Class 2500# at ${temp}°C. Engineering review required.`,
    exceeded: true,
  };
}

/**
 * Check if the given pressure class is adequate for the given design conditions.
 * Returns null if no issue, or an object { warning, maxAllowedPressure, classMaxAtAmbient } if the rating is exceeded.
 */
export function checkAsmeB165Rating({ pressureClass, designTemp, designPressure }) {
  const ambientMax = CLASS_AMBIENT_MAX[pressureClass];
  if (!ambientMax) return null; // Unknown class — skip

  const temp = parseFloat(designTemp);
  const pressure = parseFloat(designPressure);

  if (isNaN(temp) || isNaN(pressure)) return null; // Can't check without values

  const factor = getDeratingFactor(temp);
  if (factor === null) return null;

  const maxAllowed = parseFloat((ambientMax * factor).toFixed(1));

  if (factor === 0) {
    return {
      type: "material",
      warning: `⚠ ASME B16.5: Carbon steel (Group 1.1 / A216 WCB) is not rated above 538°C. At ${temp}°C, a high-temperature alloy body (e.g. A217 WC9 or A351 CF8C) is required. Verify body material rating per ASME B16.34 Table A1.`,
      maxAllowedPressure: null,
      classMaxAtAmbient: ambientMax,
      reference: "ASME B16.5 Table 2-1.1 / ASME B16.34 Table A1",
    };
  }

  if (pressure > maxAllowed) {
    return {
      type: "pressure",
      warning: `⚠ ASME B16.5 Rating Exceeded: ${pressureClass} carbon steel (Group 1.1) is rated ${maxAllowed} barg at ${temp}°C, but design pressure is ${pressure} barg. Upgrade to the next pressure class or verify actual body material group rating per ASME B16.5 Table 2.`,
      maxAllowedPressure: maxAllowed,
      classMaxAtAmbient: ambientMax,
      reference: "ASME B16.5 Table 2-1.1 (Group 1.1 — Carbon Steel WCB)",
    };
  }

  // Also warn if close (>85% of limit)
  if (pressure > maxAllowed * 0.85) {
    return {
      type: "caution",
      warning: `ℹ ASME B16.5 Caution: Design pressure (${pressure} barg) is within 15% of the ${pressureClass} Group 1.1 limit (${maxAllowed} barg at ${temp}°C). Confirm the exact body material group from ASME B16.5 Table 2 before finalising class selection.`,
      maxAllowedPressure: maxAllowed,
      classMaxAtAmbient: ambientMax,
      reference: "ASME B16.5 Table 2-1.1 (Group 1.1 — Carbon Steel WCB)",
    };
  }

  return null;
}
