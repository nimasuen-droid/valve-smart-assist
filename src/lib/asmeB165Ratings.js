// ASME pressure-temperature screening data.
//
// This module is a preliminary decision-support layer, not a replacement for
// the governing ASME B16.5 / B16.34 tables. Values are intentionally traceable
// to material groups and table references so a checker can verify the final
// selection against the purchased standard and project piping class.

export const CLASS_ORDER = ["150#", "300#", "600#", "900#", "1500#", "2500#"];

export const ASME_DATASET_METADATA = {
  datasetId: "VALVE-ASME-SCREENING-2026-05",
  datasetVersion: "2026.05-screening",
  sourceStandardReference: "ASME B16.5 / ASME B16.34 short references only",
  standardEdition: "Not bundled - user must verify against licensed/current edition",
  dataOwner: "Valve Selection Guide app owner",
  verificationStatus: "SCREENING_ONLY",
  verificationStatusLabel: "Screening data - independent ASME verification required",
  owner: "Engineering data steward",
  reviewer: "Pending qualified piping/mechanical engineer review",
  approvalDate: null,
  screeningOnly: true,
  lastReviewed: null,
  nextReviewDue: "Before production release",
  licensedSourceRequired: true,
  copyrightNotice:
    "No licensed ASME tables are reproduced as official standards content. Built-in values are draft screening factors and must be verified against licensed/current standards.",
  releaseGate:
    "Do not use for procurement or fabrication until checked against licensed/current ASME B16.5 and B16.34 tables.",
};

const CLASS_AMBIENT_MAX = {
  "Class 150": 19.6,
  "Class 300": 51.1,
  "Class 600": 102.1,
  "Class 900": 153.2,
  "Class 1500": 255.4,
  "Class 2500": 425.6,
};

export const ASME_RATING_SOURCES = {
  b165: {
    standard: "ASME B16.5",
    title: "Pipe Flanges and Flanged Fittings",
    note: "Pressure-temperature rating tables by material group. Verify final class against the current purchased standard.",
  },
  b1634: {
    standard: "ASME B16.34",
    title: "Valves - Flanged, Threaded, and Welding End",
    note: "Valve body material, temperature limit, special class, and limited class verification.",
  },
  astm: {
    standard: "ASTM material specifications",
    title: "Cast valve body material grades",
    note: "Material grade must match the ordered valve body specification and applicable service restrictions.",
  },
};

export const ASME_USER_TABLE_SCHEMA = "valve-smart-assist.asme-rating-dataset.v1";
const USER_ASME_DATASET_KEY = "valve-smart-assist.user-asme-dataset.v1";
const MAX_USER_DATASET_BYTES = 750_000;
const MAX_USER_MATERIAL_GROUPS = 80;
const MAX_FACTOR_ROWS_PER_GROUP = 80;
const MAX_SOURCE_NOTES_PER_GROUP = 10;
const TEMPLATE_DATASET_ID = "COMPANY-ASME-B16-TABLES";

const GROUPS = {
  1.1: {
    id: "1.1",
    label: "Group 1.1 - Carbon Steel",
    representativeMaterials: ["A216 WCB", "A105", "A350 LF2"],
    defaultSpec: "ASTM A216 WCB",
    minTempC: -29,
    maxTempC: 425,
    b165Table: "ASME B16.5 Table 2-1.1",
    b1634Table: "ASME B16.34 Table A-1 / material group cross-reference",
    sourceNotes: [
      "Current screening baseline from existing Group 1.1 WCB curve.",
      "Carbon steel is not a high-temperature alloy; verify creep and graphitisation limits above normal process temperatures.",
    ],
    factors: [
      [-29, 1.0],
      [38, 1.0],
      [50, 0.98],
      [100, 0.903],
      [150, 0.806],
      [200, 0.704],
      [250, 0.668],
      [300, 0.617],
      [325, 0.587],
      [350, 0.561],
      [375, 0.52],
      [400, 0.474],
      [425, 0.429],
    ],
  },
  1.2: {
    id: "1.2",
    label: "Group 1.2 - Low Temperature Carbon Steel",
    representativeMaterials: ["A352 LCB", "A352 LCC", "A350 LF2"],
    defaultSpec: "ASTM A352 LCB / LCC",
    minTempC: -46,
    maxTempC: 345,
    b165Table: "ASME B16.5 Table 2-1.2",
    b1634Table: "ASME B16.34 Table A-1 / impact-tested carbon steel",
    sourceNotes: [
      "Use for low-temperature carbon steel services where impact testing is required.",
      "Screening curve follows Group 1.1 at low-to-moderate temperature and caps the material at lower high-temperature service.",
    ],
    factors: [
      [-46, 1.0],
      [-29, 1.0],
      [38, 1.0],
      [50, 0.98],
      [100, 0.903],
      [150, 0.806],
      [200, 0.704],
      [250, 0.668],
      [300, 0.617],
      [345, 0.561],
    ],
  },
  1.9: {
    id: "1.9",
    label: "Group 1.9 - 1.25Cr-0.5Mo Alloy Steel",
    representativeMaterials: ["A217 WC6", "A182 F11"],
    defaultSpec: "ASTM A217 WC6",
    minTempC: -29,
    maxTempC: 565,
    b165Table: "ASME B16.5 Table 2-1.9",
    b1634Table: "ASME B16.34 Table A-1 / Cr-Mo alloy steel",
    sourceNotes: [
      "Used for high-temperature steam and hydrocarbon services where carbon steel is not suitable.",
      "Screening curve is intentionally conservative at elevated temperature pending project table verification.",
    ],
    factors: [
      [-29, 1.0],
      [38, 1.0],
      [100, 0.92],
      [150, 0.86],
      [200, 0.8],
      [250, 0.75],
      [300, 0.7],
      [350, 0.66],
      [400, 0.62],
      [450, 0.56],
      [500, 0.49],
      [538, 0.43],
      [565, 0.38],
    ],
  },
  "1.10": {
    id: "1.10",
    label: "Group 1.10 - 2.25Cr-1Mo Alloy Steel",
    representativeMaterials: ["A217 WC9", "A182 F22"],
    defaultSpec: "ASTM A217 WC9",
    minTempC: -29,
    maxTempC: 595,
    b165Table: "ASME B16.5 Table 2-1.10",
    b1634Table: "ASME B16.34 Table A-1 / Cr-Mo alloy steel",
    sourceNotes: [
      "Higher chromium-molybdenum alloy for more severe high-temperature service.",
      "Verify PWHT, creep, and project-specific hydrogen service limits.",
    ],
    factors: [
      [-29, 1.0],
      [38, 1.0],
      [100, 0.94],
      [150, 0.88],
      [200, 0.83],
      [250, 0.78],
      [300, 0.74],
      [350, 0.7],
      [400, 0.65],
      [450, 0.59],
      [500, 0.53],
      [538, 0.48],
      [565, 0.43],
      [595, 0.38],
    ],
  },
  2.1: {
    id: "2.1",
    label: "Group 2.1 - Austenitic Stainless Steel",
    representativeMaterials: ["A351 CF8M", "A182 F316", "A182 F316L"],
    defaultSpec: "ASTM A351 CF8M",
    minTempC: -196,
    maxTempC: 538,
    b165Table: "ASME B16.5 Table 2-2.1",
    b1634Table: "ASME B16.34 Table A-1 / austenitic stainless steel",
    sourceNotes: [
      "Common 316 stainless valve body group for corrosive and cryogenic screening.",
      "Low-temperature suitability still requires impact, bolting, gasket, and trim verification.",
    ],
    factors: [
      [-196, 1.0],
      [-29, 1.0],
      [38, 1.0],
      [100, 0.88],
      [150, 0.78],
      [200, 0.72],
      [250, 0.67],
      [300, 0.63],
      [350, 0.59],
      [400, 0.55],
      [450, 0.51],
      [500, 0.47],
      [538, 0.44],
    ],
  },
  2.2: {
    id: "2.2",
    label: "Group 2.2 - Stabilized Austenitic Stainless Steel",
    representativeMaterials: ["A351 CF8C", "A182 F347"],
    defaultSpec: "ASTM A351 CF8C",
    minTempC: -196,
    maxTempC: 650,
    b165Table: "ASME B16.5 Table 2-2.2",
    b1634Table: "ASME B16.34 Table A-1 / stabilized stainless steel",
    sourceNotes: [
      "Stabilized stainless group for elevated-temperature services where carbide precipitation resistance is needed.",
      "Verify service-specific creep, oxidation, and sensitization limits.",
    ],
    factors: [
      [-196, 1.0],
      [-29, 1.0],
      [38, 1.0],
      [100, 0.9],
      [150, 0.82],
      [200, 0.76],
      [250, 0.71],
      [300, 0.67],
      [350, 0.62],
      [400, 0.58],
      [450, 0.54],
      [500, 0.5],
      [538, 0.47],
      [595, 0.42],
      [650, 0.36],
    ],
  },
  2.8: {
    id: "2.8",
    label: "Group 2.8 - High Alloy / Duplex Screening",
    representativeMaterials: ["A351 CN7M", "A995 CD3MN", "A494 N7M", "N06625"],
    defaultSpec: "High alloy body material",
    minTempC: -196,
    maxTempC: 425,
    b165Table: "ASME B16.5 Table 2 high-alloy material group - verify exact grade",
    b1634Table: "ASME B16.34 Table A-1 / special alloy material group",
    sourceNotes: [
      "Used as a conservative holding group for Alloy 20, duplex, Hastelloy, Inconel, and Monel selections.",
      "Exact ASME material group is grade-specific and must be checked before procurement.",
    ],
    factors: [
      [-196, 1.0],
      [-29, 1.0],
      [38, 1.0],
      [100, 0.9],
      [150, 0.84],
      [200, 0.78],
      [250, 0.72],
      [300, 0.66],
      [350, 0.6],
      [400, 0.54],
      [425, 0.5],
    ],
    requiresExactGradeReview: true,
  },
};

const MATERIAL_GROUP_RULES = [
  { group: "1.10", patterns: [/WC9/i, /F22/i, /2\.25Cr/i] },
  { group: "1.9", patterns: [/WC6/i, /F11/i, /Cr-Mo/i, /Chrome-Moly/i] },
  { group: "2.2", patterns: [/CF8C/i, /F347/i, /347/i] },
  { group: "2.1", patterns: [/CF8M/i, /F316/i, /316/i, /O2 Cleaned/i] },
  { group: "1.2", patterns: [/A352/i, /LCB/i, /LCC/i, /Low Temperature/i, /LTCS/i] },
  {
    group: "2.8",
    patterns: [
      /CN7M/i,
      /CD3MN/i,
      /Alloy 20/i,
      /Duplex/i,
      /Hastelloy/i,
      /Inconel/i,
      /Monel/i,
      /N06625/i,
      /N7M/i,
    ],
  },
  { group: "1.1", patterns: [/WCB/i, /WCC/i, /Carbon Steel/i, /PWHT/i, /NACE/i] },
];

function canUseLocalStorage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return false;
  try {
    const key = "__valve_storage_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function normalizeClassAmbientMax(value = {}) {
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    const normalizedKey = key.startsWith("Class ") ? key : `Class ${String(key).replace("#", "")}`;
    const pressure = Number(raw);
    if (Number.isFinite(pressure) && pressure > 0) out[normalizedKey] = pressure;
  }
  return out;
}

function normalizeMaterialGroups(value = []) {
  if (!Array.isArray(value)) return [];
  return value.map((group) => ({
    ...group,
    id: String(group.id ?? ""),
    label: String(group.label ?? ""),
    representativeMaterials: Array.isArray(group.representativeMaterials)
      ? group.representativeMaterials.map(String)
      : [],
    defaultSpec: String(group.defaultSpec ?? ""),
    minTempC: Number(group.minTempC),
    maxTempC: Number(group.maxTempC),
    b165Table: String(group.b165Table ?? ""),
    b1634Table: String(group.b1634Table ?? ""),
    sourceNotes: Array.isArray(group.sourceNotes) ? group.sourceNotes.map(String) : [],
    factors: Array.isArray(group.factors)
      ? group.factors.map(([temp, factor]) => [Number(temp), Number(factor)])
      : [],
    requiresExactGradeReview: !!group.requiresExactGradeReview,
  }));
}

function normalizeUserAsmeDataset(raw) {
  const rawText = typeof raw === "string" ? raw : JSON.stringify(raw);
  if (rawText.length > MAX_USER_DATASET_BYTES) {
    throw new Error(`ASME dataset exceeds ${MAX_USER_DATASET_BYTES} bytes.`);
  }
  const source = typeof raw === "string" ? JSON.parse(raw) : raw;
  const metadata = source?.metadata ?? {};
  return {
    schema: source?.schema,
    metadata: {
      datasetId: String(metadata.datasetId ?? ""),
      datasetVersion: String(metadata.datasetVersion ?? ""),
      sourceStandardReference: String(metadata.sourceStandardReference ?? "ASME B16.5 / B16.34"),
      standardEdition: String(metadata.standardEdition ?? ""),
      dataOwner: String(metadata.dataOwner ?? metadata.owner ?? ""),
      verificationStatus: String(metadata.verificationStatus ?? "USER_PROVIDED_PENDING_APPROVAL"),
      verificationStatusLabel: String(
        metadata.verificationStatusLabel ?? "User-provided ASME table set pending approval",
      ),
      owner: String(metadata.owner ?? ""),
      reviewer: String(metadata.reviewer ?? ""),
      approvedBy: metadata.approvedBy ? String(metadata.approvedBy) : "",
      approvedAt: metadata.approvedAt ? String(metadata.approvedAt) : "",
      approvalDate: metadata.approvalDate ? String(metadata.approvalDate) : "",
      approvalBasis: metadata.approvalBasis ? String(metadata.approvalBasis) : "",
      templatePlaceholder: !!metadata.templatePlaceholder,
      lastReviewed: metadata.lastReviewed ? String(metadata.lastReviewed) : null,
      nextReviewDue: metadata.nextReviewDue ? String(metadata.nextReviewDue) : "",
      screeningOnly: metadata.screeningOnly !== false,
      licensedSourceRequired: metadata.licensedSourceRequired !== false,
      licenseResponsibilityAccepted: !!metadata.licenseResponsibilityAccepted,
      copyrightNotice: String(
        metadata.copyrightNotice ??
          "User dataset is supplied under the user's standards license and approval process.",
      ),
      releaseGate: String(
        metadata.releaseGate ??
          "User-approved licensed ASME tables are applied under the user's responsibility.",
      ),
    },
    classAmbientMax: normalizeClassAmbientMax(source?.classAmbientMax),
    materialGroups: normalizeMaterialGroups(source?.materialGroups),
  };
}

export function validateUserAsmeDataset(
  raw,
  { requireApproval = false, requireNonTemplate = false } = {},
) {
  const issues = [];
  let dataset;
  try {
    dataset = normalizeUserAsmeDataset(raw);
  } catch (error) {
    return {
      ok: false,
      issues: [error instanceof Error ? error.message : "Could not parse ASME table JSON."],
      dataset: null,
    };
  }

  if (dataset.schema !== ASME_USER_TABLE_SCHEMA) {
    issues.push(`schema must be ${ASME_USER_TABLE_SCHEMA}.`);
  }
  for (const key of [
    "datasetId",
    "datasetVersion",
    "sourceStandardReference",
    "standardEdition",
    "dataOwner",
    "owner",
    "reviewer",
    "copyrightNotice",
  ]) {
    if (!dataset.metadata[key]) issues.push(`metadata.${key} is required.`);
  }
  if (Object.keys(dataset.classAmbientMax).length < CLASS_ORDER.length) {
    issues.push("classAmbientMax must include Class 150, 300, 600, 900, 1500, and 2500.");
  }
  if (!dataset.materialGroups.length) {
    issues.push("materialGroups must include at least one ASME material group.");
  }
  if (dataset.materialGroups.length > MAX_USER_MATERIAL_GROUPS) {
    issues.push(`materialGroups must not exceed ${MAX_USER_MATERIAL_GROUPS} groups.`);
  }
  if (
    requireNonTemplate &&
    (dataset.metadata.datasetId === TEMPLATE_DATASET_ID || dataset.metadata.templatePlaceholder)
  ) {
    issues.push("metadata.datasetId must be changed from the template placeholder before import.");
  }

  const groupIds = new Set();
  for (const group of dataset.materialGroups) {
    if (!group.id) issues.push("Each material group must include id.");
    if (groupIds.has(group.id)) issues.push(`Duplicate material group id: ${group.id}.`);
    groupIds.add(group.id);

    for (const key of ["label", "defaultSpec", "b165Table", "b1634Table"]) {
      if (!group[key]) issues.push(`${group.id || "(unknown group)"} is missing ${key}.`);
    }
    if (!Number.isFinite(group.minTempC) || !Number.isFinite(group.maxTempC)) {
      issues.push(`${group.id} must include numeric minTempC and maxTempC.`);
    }
    if (group.minTempC >= group.maxTempC) {
      issues.push(`${group.id} minTempC must be lower than maxTempC.`);
    }
    if (!Array.isArray(group.factors) || group.factors.length < 2) {
      issues.push(`${group.id} must include at least two P-T factor rows.`);
    }
    if (group.factors.length > MAX_FACTOR_ROWS_PER_GROUP) {
      issues.push(`${group.id} must not exceed ${MAX_FACTOR_ROWS_PER_GROUP} factor rows.`);
    }
    if (group.sourceNotes.length > MAX_SOURCE_NOTES_PER_GROUP) {
      issues.push(`${group.id} must not exceed ${MAX_SOURCE_NOTES_PER_GROUP} source notes.`);
    }
    for (let i = 0; i < group.factors.length; i++) {
      const [temp, factor] = group.factors[i];
      if (!Number.isFinite(temp) || !Number.isFinite(factor) || factor <= 0) {
        issues.push(`${group.id} factor row ${i + 1} must contain numeric temp and factor.`);
      }
      if (i > 0 && temp <= group.factors[i - 1][0]) {
        issues.push(`${group.id} factor temperatures must be strictly increasing.`);
      }
    }
    if (!group.sourceNotes.length) {
      issues.push(`${group.id} must include sourceNotes for traceability.`);
    }
  }

  if (requireApproval) {
    if (dataset.metadata.verificationStatus !== "USER_APPROVED") {
      issues.push("metadata.verificationStatus must be USER_APPROVED.");
    }
    if (!dataset.metadata.licenseResponsibilityAccepted) {
      issues.push("metadata.licenseResponsibilityAccepted must be true.");
    }
    if (!dataset.metadata.approvedBy || !dataset.metadata.approvedAt) {
      issues.push("approvedBy and approvedAt are required before use.");
    }
    if (!dataset.metadata.approvalBasis) {
      issues.push("approvalBasis is required before use.");
    }
    if (dataset.metadata.screeningOnly !== false) {
      issues.push("metadata.screeningOnly must be false for approved user datasets.");
    }
    if (dataset.metadata.templatePlaceholder) {
      issues.push("Template placeholder datasets cannot be approved.");
    }
  }

  return { ok: issues.length === 0, issues, dataset };
}

export function buildAsmeTableTemplate() {
  return {
    schema: ASME_USER_TABLE_SCHEMA,
    instructions: [
      "Populate this template only with ASME tables your organization is licensed to use.",
      "The app does not provide licensed ASME content. The bundled data is draft screening data.",
      "Placeholder numeric values below are examples only. Replace every class rating, factor, material group, source note, and metadata field before import.",
      "Importing stages the dataset. Approve it in Settings before it becomes the active calculation basis.",
      "classAmbientMax values are in barg. factors multiply the ambient class rating at the listed temperature in deg C.",
    ],
    metadata: {
      datasetId: "COMPANY-ASME-B16-TABLES",
      datasetVersion: "YYYY.MM.company",
      sourceStandardReference: "ASME B16.5 / ASME B16.34",
      standardEdition: "ASME B16.5 / B16.34 edition used by licensee",
      dataOwner: "Company / licensed data owner",
      verificationStatus: "USER_PROVIDED_PENDING_APPROVAL",
      verificationStatusLabel: "User-provided ASME table set pending approval",
      owner: "Company / discipline owner",
      reviewer: "Qualified checker name",
      approvalDate: "",
      templatePlaceholder: true,
      lastReviewed: null,
      nextReviewDue: "Project or company review date",
      screeningOnly: false,
      licensedSourceRequired: true,
      licenseResponsibilityAccepted: false,
      copyrightNotice:
        "This template must be populated only with data the user organization is licensed and authorized to use.",
      releaseGate:
        "User/licensee accepts responsibility for ASME licensing, table accuracy, and engineering approval.",
    },
    classAmbientMax: {
      "Class 150": 1,
      "Class 300": 1,
      "Class 600": 1,
      "Class 900": 1,
      "Class 1500": 1,
      "Class 2500": 1,
    },
    materialGroups: [
      {
        id: "REPLACE_GROUP_ID",
        label: "Replace with licensed/company material group label",
        representativeMaterials: ["Replace with material grades"],
        defaultSpec: "Replace with default body material specification",
        minTempC: 0,
        maxTempC: 100,
        b165Table: "Short source reference only; do not paste licensed table text",
        b1634Table: "Short source reference only; do not paste licensed table text",
        sourceNotes: ["Replace with traceable source, edition, checker, and assumptions."],
        factors: [
          [0, 1],
          [100, 1],
        ],
        requiresExactGradeReview: true,
      },
    ],
  };
}
function readStoredUserAsmeDataset() {
  if (!canUseLocalStorage()) return null;
  const raw = window.localStorage.getItem(USER_ASME_DATASET_KEY);
  if (!raw) return null;
  const validation = validateUserAsmeDataset(raw);
  return validation.ok ? validation.dataset : null;
}

export function getAsmeDatasetStatus() {
  const dataset = readStoredUserAsmeDataset();
  if (!dataset) {
    return {
      mode: "bundled-draft",
      active: false,
      metadata: ASME_DATASET_METADATA,
      groupCount: Object.keys(GROUPS).length,
    };
  }
  return {
    mode: dataset.metadata.verificationStatus === "USER_APPROVED" ? "user-approved" : "pending",
    active: dataset.metadata.verificationStatus === "USER_APPROVED",
    metadata: dataset.metadata,
    groupCount: dataset.materialGroups.length,
  };
}

export function importUserAsmeDataset(raw) {
  const validation = validateUserAsmeDataset(raw, { requireNonTemplate: true });
  if (!validation.ok) return validation;
  const dataset = {
    ...validation.dataset,
    metadata: {
      ...validation.dataset.metadata,
      verificationStatus: "USER_PROVIDED_PENDING_APPROVAL",
      verificationStatusLabel: "User-provided ASME table set pending approval",
      approvedBy: "",
      approvedAt: "",
      approvalDate: "",
      screeningOnly: true,
      licenseResponsibilityAccepted: false,
    },
  };
  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(USER_ASME_DATASET_KEY, JSON.stringify(dataset));
    } catch (error) {
      return {
        ok: false,
        issues: [
          error instanceof Error ? error.message : "Could not save ASME dataset to local storage.",
        ],
        dataset: null,
      };
    }
  }
  return { ok: true, issues: [], dataset };
}

export function approveUserAsmeDataset({ approvedBy, approvalBasis }) {
  const validation = validateUserAsmeDataset(readStoredUserAsmeDataset());
  if (!validation.ok) return validation;
  const dataset = {
    ...validation.dataset,
    metadata: {
      ...validation.dataset.metadata,
      verificationStatus: "USER_APPROVED",
      verificationStatusLabel: "User-approved ASME table set - licensee supplied",
      approvedBy: String(approvedBy || "").trim(),
      approvedAt: new Date().toISOString(),
      approvalBasis: String(approvalBasis || "").trim(),
      approvalDate: new Date().toISOString().slice(0, 10),
      screeningOnly: false,
      licenseResponsibilityAccepted: true,
      releaseGate:
        "Calculations use user-approved ASME tables supplied under the user's licensing responsibility.",
    },
  };
  const approvedValidation = validateUserAsmeDataset(dataset, {
    requireApproval: true,
    requireNonTemplate: true,
  });
  if (!approvedValidation.ok) return approvedValidation;
  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(USER_ASME_DATASET_KEY, JSON.stringify(dataset));
    } catch (error) {
      return {
        ok: false,
        issues: [error instanceof Error ? error.message : "Could not save approved ASME dataset."],
        dataset: null,
      };
    }
  }
  return { ok: true, issues: [], dataset };
}

export function clearUserAsmeDataset() {
  if (canUseLocalStorage()) window.localStorage.removeItem(USER_ASME_DATASET_KEY);
}

function getActiveAsmeDataset() {
  const stored = readStoredUserAsmeDataset();
  if (stored?.metadata?.verificationStatus === "USER_APPROVED") {
    return {
      metadata: stored.metadata,
      groups: stored.materialGroups,
      groupMap: Object.fromEntries(stored.materialGroups.map((group) => [group.id, group])),
      classAmbientMax: stored.classAmbientMax,
      isUserApproved: true,
    };
  }
  return {
    metadata: ASME_DATASET_METADATA,
    groups: Object.values(GROUPS),
    groupMap: GROUPS,
    classAmbientMax: CLASS_AMBIENT_MAX,
    isUserApproved: false,
  };
}

function toClassKey(cls) {
  if (!cls) return "";
  return cls.startsWith("Class ") ? cls : "Class " + cls.replace("#", "");
}

function getFactor(group, tempC) {
  const t = parseFloat(tempC);
  if (Number.isNaN(t)) return null;
  if (t < group.minTempC || t > group.maxTempC) return 0;

  const points = group.factors;
  for (let i = 0; i < points.length; i++) {
    const [pointTemp, factor] = points[i];
    if (t === pointTemp) return factor;
    if (t < pointTemp) {
      if (i === 0) return factor;
      const [prevTemp, prevFactor] = points[i - 1];
      const ratio = (t - prevTemp) / (pointTemp - prevTemp);
      return prevFactor + ratio * (factor - prevFactor);
    }
  }
  return points[points.length - 1][1];
}

function classAmbientMax(pressureClass, dataset = getActiveAsmeDataset()) {
  return dataset.classAmbientMax[toClassKey(pressureClass)] ?? null;
}

export function getMaterialRatingGroups() {
  return getActiveAsmeDataset().groups;
}

export function resolveMaterialRatingGroup({ bodyMaterial = "", bodyMaterialSpec = "" } = {}) {
  const dataset = getActiveAsmeDataset();
  const haystack = `${bodyMaterial} ${bodyMaterialSpec}`;
  const match = MATERIAL_GROUP_RULES.find((rule) =>
    rule.patterns.some((pattern) => pattern.test(haystack)),
  );
  return dataset.groupMap[match?.group ?? "1.1"] ?? dataset.groups[0];
}

export function getRatingSourceMetadata(group) {
  const dataset = getActiveAsmeDataset();
  return {
    dataset: dataset.metadata,
    groupId: group.id,
    groupLabel: group.label,
    representativeMaterials: group.representativeMaterials,
    b165Table: group.b165Table,
    b1634Table: group.b1634Table,
    sourceNotes: group.sourceNotes,
    standards: ASME_RATING_SOURCES,
    preliminary: !dataset.isUserApproved,
  };
}

export function validateRatingDatasetGovernance() {
  const issues = [];
  const groups = getMaterialRatingGroups();

  if (ASME_DATASET_METADATA.verificationStatus !== "SCREENING_ONLY") {
    issues.push(
      "Only SCREENING_ONLY is allowed until licensed ASME tables are independently verified.",
    );
  }
  if (!ASME_DATASET_METADATA.licensedSourceRequired) {
    issues.push("licensedSourceRequired must remain true before production release.");
  }
  for (const key of [
    "sourceStandardReference",
    "standardEdition",
    "dataOwner",
    "reviewer",
    "copyrightNotice",
  ]) {
    if (!ASME_DATASET_METADATA[key]) issues.push(`ASME_DATASET_METADATA.${key} is required.`);
  }
  if (ASME_DATASET_METADATA.screeningOnly !== true) {
    issues.push("Built-in ASME metadata must remain screeningOnly.");
  }

  for (const group of groups) {
    const required = ["id", "label", "b165Table", "b1634Table", "minTempC", "maxTempC"];
    for (const key of required) {
      if (group[key] === undefined || group[key] === null || group[key] === "") {
        issues.push(`${group.id || "(unknown group)"} is missing ${key}.`);
      }
    }
    if (!Array.isArray(group.factors) || group.factors.length < 2) {
      issues.push(`${group.id} must include at least two pressure-temperature screening points.`);
    }
    if (!Array.isArray(group.sourceNotes) || group.sourceNotes.length === 0) {
      issues.push(`${group.id} must include source notes.`);
    }
    for (let i = 1; i < group.factors.length; i++) {
      if (group.factors[i][0] <= group.factors[i - 1][0]) {
        issues.push(`${group.id} factor temperatures must be strictly increasing.`);
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    groupCount: groups.length,
    metadata: ASME_DATASET_METADATA,
  };
}

export function recommendPressureClass({
  designTemp,
  designPressure,
  bodyMaterial = "",
  bodyMaterialSpec = "",
} = {}) {
  const temp = parseFloat(designTemp);
  const pressure = parseFloat(designPressure);
  if (Number.isNaN(temp) || Number.isNaN(pressure)) return null;

  const group = resolveMaterialRatingGroup({ bodyMaterial, bodyMaterialSpec });
  const factor = getFactor(group, temp);
  const source = getRatingSourceMetadata(group);
  const basisLabel = source.preliminary ? "screening" : "user-approved";
  if (factor === null || factor === 0) {
    return {
      recommendedClass: "N/A",
      maxAllowed: null,
      factor,
      source,
      exceeded: true,
      note: `${group.label}: ${temp} deg C is outside the screening range (${group.minTempC} deg C to ${group.maxTempC} deg C). Verify material suitability per ASME B16.34.`,
    };
  }

  for (const cls of CLASS_ORDER) {
    const ambientMax = classAmbientMax(cls);
    if (!ambientMax) continue;
    const maxAllowed = parseFloat((ambientMax * factor).toFixed(1));
    if (pressure <= maxAllowed) {
      return {
        recommendedClass: cls,
        maxAllowed,
        factor,
        source,
        materialGroup: group,
        note: `${group.label}: ${cls} rated ${maxAllowed} barg at ${temp} deg C (${basisLabel} factor ${factor.toFixed(3)}; basis ${group.b165Table})`,
      };
    }
  }

  const maxAllowed = parseFloat((classAmbientMax("2500#") * factor).toFixed(1));
  return {
    recommendedClass: "2500#",
    maxAllowed,
    factor,
    source,
    materialGroup: group,
    exceeded: true,
    note: `${group.label}: design conditions exceed Class 2500# ${basisLabel} capacity (${maxAllowed} barg at ${temp} deg C). Engineering review required.`,
  };
}

export function checkAsmeB165Rating({
  pressureClass,
  designTemp,
  designPressure,
  bodyMaterial = "",
  bodyMaterialSpec = "",
} = {}) {
  const ambientMax = classAmbientMax(pressureClass);
  if (!ambientMax) return null;

  const temp = parseFloat(designTemp);
  const pressure = parseFloat(designPressure);
  if (Number.isNaN(temp) || Number.isNaN(pressure)) return null;

  const group = resolveMaterialRatingGroup({ bodyMaterial, bodyMaterialSpec });
  const factor = getFactor(group, temp);
  const source = getRatingSourceMetadata(group);
  const basisLabel = source.preliminary ? "screened" : "rated";
  if (factor === null) return null;

  if (factor === 0) {
    return {
      type: "material",
      warning: `ASME B16.5 / B16.34: ${bodyMaterialSpec || bodyMaterial || group.defaultSpec} maps to ${group.label}, but ${temp} deg C is outside its screening temperature range (${group.minTempC} deg C to ${group.maxTempC} deg C). Select a suitable alloy or verify the exact material group and valve body rating.`,
      maxAllowedPressure: null,
      classMaxAtAmbient: ambientMax,
      reference: `${group.b165Table} / ${group.b1634Table}`,
      source,
      materialGroup: group,
    };
  }

  const maxAllowed = parseFloat((ambientMax * factor).toFixed(1));
  if (pressure > maxAllowed) {
    return {
      type: "pressure",
      warning: `ASME B16.5 Rating Exceeded: ${pressureClass} ${group.label} is ${basisLabel} at ${maxAllowed} barg at ${temp} deg C, but design pressure is ${pressure} barg. Upgrade pressure class or verify the exact body material group rating.`,
      maxAllowedPressure: maxAllowed,
      classMaxAtAmbient: ambientMax,
      reference: group.b165Table,
      source,
      materialGroup: group,
    };
  }

  if (pressure > maxAllowed * 0.85) {
    return {
      type: "caution",
      warning: `ASME B16.5 Caution: Design pressure (${pressure} barg) is within 15% of the ${pressureClass} ${group.label} screening limit (${maxAllowed} barg at ${temp} deg C). Confirm final P-T rating against ${group.b165Table}.`,
      maxAllowedPressure: maxAllowed,
      classMaxAtAmbient: ambientMax,
      reference: group.b165Table,
      source,
      materialGroup: group,
    };
  }

  return null;
}

export function checkAsmeB1634BodyRating({
  bodyMaterial = "",
  bodyMaterialSpec = "",
  designTemp,
  pressureClass,
} = {}) {
  const temp = parseFloat(designTemp);
  if (Number.isNaN(temp)) return null;

  const group = resolveMaterialRatingGroup({ bodyMaterial, bodyMaterialSpec });
  const source = getRatingSourceMetadata(group);
  const grade = bodyMaterialSpec || bodyMaterial || group.defaultSpec;

  if (temp < group.minTempC) {
    return {
      type: "material",
      ok: false,
      warning: `ASME B16.34 body rating: ${grade} maps to ${group.label}, but design temperature ${temp} deg C is below the screening minimum ${group.minTempC} deg C. Confirm impact-tested low-temperature grade, MDMT, bolting, gasket, and trim.`,
      reference: group.b1634Table,
      source,
      materialGroup: group,
    };
  }

  if (temp > group.maxTempC) {
    return {
      type: "material",
      ok: false,
      warning: `ASME B16.34 body rating: ${grade} maps to ${group.label}, but design temperature ${temp} deg C exceeds the screening maximum ${group.maxTempC} deg C. Select a high-temperature alloy or verify special-class/limited-class body rating.`,
      reference: group.b1634Table,
      source,
      materialGroup: group,
    };
  }

  if (group.requiresExactGradeReview) {
    return {
      type: "caution",
      ok: true,
      warning: `ASME B16.34 body rating: ${grade} maps to ${group.label}. Exact grade review is mandatory because high-alloy and duplex materials use grade-specific ASME material groups.`,
      reference: group.b1634Table,
      source,
      materialGroup: group,
    };
  }

  if (pressureClass && ["1500#", "2500#"].includes(pressureClass)) {
    return {
      type: "caution",
      ok: true,
      warning: `ASME B16.34 body rating: ${grade} maps to ${group.label}. High pressure class ${pressureClass} requires valve-body wall, bolting, gasket, and end-connection verification against the purchased valve standard.`,
      reference: group.b1634Table,
      source,
      materialGroup: group,
    };
  }

  return {
    type: "ok",
    ok: true,
    warning: `${grade} maps to ${group.label}; ${temp} deg C is within the screening range (${group.minTempC} deg C to ${group.maxTempC} deg C). Verify final body rating against ${group.b1634Table}.`,
    reference: group.b1634Table,
    source,
    materialGroup: group,
  };
}
