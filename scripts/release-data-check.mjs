import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function fail(message, details) {
  console.error(message);
  if (details) console.error(JSON.stringify(details, null, 2));
  process.exitCode = 1;
}

function textIssues(value) {
  const text = JSON.stringify(value);
  const issues = [];
  for (const marker of ["â", "Â", "Ã", "�"]) {
    if (text.includes(marker)) issues.push(`mojibake marker ${marker}`);
  }
  if (/\bundefined\b/i.test(text)) issues.push("visible undefined");
  if (/\bNaN\b/.test(text)) issues.push("visible NaN");
  return issues;
}

async function importTs(file) {
  const source = await readFile(file, "utf8");
  const js = source
    .replace(/^import type .*;\r?\n/, "")
    .replace(/export interface SampleCase extends SelectionInput \{[\s\S]*?\r?\n\}\r?\n/, "")
    .replace("export const SAMPLE_CASES: SampleCase[] =", "export const SAMPLE_CASES =")
    .replace(
      "export function pickRandomSample(exclude?: string): SampleCase {",
      "export function pickRandomSample(exclude) {",
    );
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}

const samples = await importTs(`${root}/src/lib/sampleCases.ts`);
const engine = await import(pathToFileURL(`${root}/src/lib/valveSelectionEngine.js`));
const ratings = await import(pathToFileURL(`${root}/src/lib/asmeB165Ratings.js`));
const governancePolicy = await import(pathToFileURL(`${root}/src/lib/governance.js`));
const datasheets = await import(pathToFileURL(`${root}/src/lib/datasheetUtils.js`));

const governance = ratings.validateRatingDatasetGovernance();
if (!governance.ok) fail("ASME rating governance failed.", governance);

for (const key of [
  "sourceStandardReference",
  "standardEdition",
  "dataOwner",
  "reviewer",
  "copyrightNotice",
]) {
  if (!governance.metadata[key]) fail(`ASME rating governance missing ${key}.`);
}
if (governancePolicy.APP_GOVERNANCE.defaultReadiness !== "Screening Only") {
  fail("Default readiness must remain Screening Only until the governance checklist is approved.");
}

const templateValidation = ratings.validateUserAsmeDataset(ratings.buildAsmeTableTemplate());
if (!templateValidation.ok) {
  fail("User ASME table template validation failed.", templateValidation);
}
const templateImportValidation = ratings.validateUserAsmeDataset(ratings.buildAsmeTableTemplate(), {
  requireNonTemplate: true,
});
if (templateImportValidation.ok) {
  fail("ASME table template must not be directly importable without replacing placeholders.");
}

const approvedTemplate = {
  ...ratings.buildAsmeTableTemplate(),
  metadata: {
    ...ratings.buildAsmeTableTemplate().metadata,
    datasetId: "RELEASE-TEST-ASME-B16-TABLES",
    verificationStatus: "USER_APPROVED",
    verificationStatusLabel: "User-approved ASME table set - licensee supplied",
    approvedBy: "Release test checker",
    approvedAt: "2026-05-06T00:00:00.000Z",
    approvalBasis: "Automated schema validation of user-owned table workflow",
    templatePlaceholder: false,
    licenseResponsibilityAccepted: true,
  },
};
const approvedTemplateValidation = ratings.validateUserAsmeDataset(approvedTemplate, {
  requireApproval: true,
  requireNonTemplate: true,
});
if (!approvedTemplateValidation.ok) {
  fail("User ASME table approval validation failed.", approvedTemplateValidation);
}

const requiredFields = [
  "valveType",
  "bodyMaterial",
  "bodyMaterialSpec",
  "seatMaterial",
  "endConnection",
  "operator",
  "valveStandard",
  "testingStandard",
];

const failures = [];
for (const sample of samples.SAMPLE_CASES) {
  const result = engine.selectValve(sample);
  const group = ratings.resolveMaterialRatingGroup({
    bodyMaterial: result.bodyMaterial,
    bodyMaterialSpec: result.bodyMaterialSpec,
  });
  const b1634 = ratings.checkAsmeB1634BodyRating({
    pressureClass: sample.pressureClass,
    designTemp: sample.designTemp,
    bodyMaterial: result.bodyMaterial,
    bodyMaterialSpec: result.bodyMaterialSpec,
  });
  const rec = ratings.recommendPressureClass({
    designTemp: sample.designTemp,
    designPressure: sample.designPressure,
    bodyMaterial: result.bodyMaterial,
    bodyMaterialSpec: result.bodyMaterialSpec,
  });
  const missing = requiredFields.filter((field) => !result[field]);
  const issues = textIssues({ sample, result, group, b1634, rec });
  const html = datasheets.generatePdfHtml({
    ...sample,
    ...result,
    materialRatingGroup: group,
    status: "Release Check",
  });
  const hostileHtml = datasheets.generatePdfHtml({
    ...sample,
    ...result,
    projectName: `<script>alert("x")</script>`,
    tagNumber: `=HYPERLINK("http://bad.example","x")`,
    warnings: [`<img src=x onerror=alert(1)>`],
    materialRatingGroup: group,
    status: "Release Check",
  });
  const governanceMarkers = [
    governancePolicy.APP_GOVERNANCE.releaseId,
    governancePolicy.APP_GOVERNANCE.defaultReadiness,
    governancePolicy.USER_RESPONSIBILITY_NOTICE,
    governancePolicy.STANDARDS_COPYRIGHT_NOTICE,
    governancePolicy.EXPORT_GOVERNANCE_NOTICE,
  ].filter((marker) => !html.includes(marker));
  const injectionIssues = [];
  if (hostileHtml.includes("<script>") || hostileHtml.includes("<img src=x")) {
    injectionIssues.push("Generated HTML export did not escape hostile input.");
  }
  if (datasheets.safeExportFilename(`../=bad*tag`, "draft").includes("..")) {
    injectionIssues.push("Export filename sanitizer allows path traversal markers.");
  }

  if (
    missing.length ||
    issues.length ||
    governanceMarkers.length ||
    injectionIssues.length ||
    !group?.b165Table ||
    !b1634?.source?.b1634Table ||
    !rec
  ) {
    failures.push({
      title: sample.caseTitle,
      tag: sample.tagNumber,
      missing,
      issues,
      governanceMarkers,
      injectionIssues,
      group: group?.label,
      b1634: b1634?.reference,
      recommendedClass: rec?.recommendedClass,
    });
  }
}

const boundaryCases = [
  { designTemp: "440", designPressure: "115", bodyMaterialSpec: "ASTM A217 WC6 / WC9" },
  { designTemp: "-50", designPressure: "20", bodyMaterialSpec: "ASTM A352 LCB / LCC" },
  { designTemp: "610", designPressure: "45", bodyMaterialSpec: "ASTM A217 WC9" },
  { designTemp: "70", designPressure: "210", bodyMaterialSpec: "ASTM A351 CF8M" },
];

for (const boundary of boundaryCases) {
  const body = ratings.checkAsmeB1634BodyRating(boundary);
  const rec = ratings.recommendPressureClass(boundary);
  if (!body?.source?.dataset || !rec?.source?.dataset) {
    failures.push({ title: "Boundary case missing dataset metadata", boundary, body, rec });
  }
}

if (failures.length) {
  fail("Release data integrity checks failed.", failures);
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        sampleCount: samples.SAMPLE_CASES.length,
        materialGroupCount: governance.groupCount,
        dataset: governance.metadata,
      },
      null,
      2,
    ),
  );
}
