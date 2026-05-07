export const APP_GOVERNANCE = {
  appName: "Valve Selection Guide",
  owner: "Nosa Imasuen",
  maintainer: "Nosa Imasuen",
  supportEmail: "nimasuen@gmail.com",
  appVersion: "0.4.0",
  buildDate: "2026-05-02",
  releaseId: "VSG-0.4.0-2026-05-screening",
  defaultReadiness: "Screening Only",
  classification:
    "Engineering Decision Support Tool - Screening / Internal Review Use unless independently validated.",
  engineeringAuthority: "To be assigned before controlled engineering or production use",
  dataSteward: "User organization / licensed table owner",
  independentChecker: "To be assigned before procurement or fabrication use",
  legalOwner: "To be assigned before external distribution",
};

export const READINESS_LEVELS = [
  {
    id: "SCREENING_ONLY",
    label: "Screening Only",
    description:
      "Default state. Outputs support early engineering screening and internal review only.",
  },
  {
    id: "INTERNAL_REVIEW",
    label: "Internal Review",
    description:
      "Engineering team may use outputs for review packages after data and logic checks are assigned.",
  },
  {
    id: "CONTROLLED_ENGINEERING_USE",
    label: "Controlled Engineering Use",
    description:
      "Use is controlled by a named engineering authority, validated datasets, revision control, and checker approval.",
  },
  {
    id: "PRODUCTION_READY",
    label: "Production Ready",
    description:
      "Allowed only after licensed data validation, legal review, release approval, auditability, and qualified engineering sign-off.",
  },
];

export const PRODUCTION_GOVERNANCE_CHECKLIST = [
  "Named responsible engineering authority",
  "Licensed/current ASME/API/IEC/ISA/ISO/MSS/NACE references verified by the user organization",
  "Built-in screening data replaced or validated against approved licensed/company datasets",
  "Independent checker review completed and dated",
  "Release notes, version, and dataset basis approved",
  "Datasheet/export acceptance test completed",
  "Terms of use, liability disclaimer, and privacy policy approved",
  "Support/maintainer process assigned",
  "Audit trail or controlled project record defined for issued work",
];

export const USER_RESPONSIBILITY_NOTICE =
  "Outputs are generated for engineering screening and decision support only. Final responsibility for standards compliance, engineering judgment, specification verification, and approved project use remains with the user organization and qualified reviewing engineer.";

export const STANDARDS_COPYRIGHT_NOTICE =
  "This app references standards by name and short citation only. It is not an official standards publication and does not replace ASME, API, IEC, ISA, ISO, MSS, NACE, ASTM, or other licensed standards. Users must validate all final selections against licensed/current standards and project specifications.";

export const DATASET_GOVERNANCE_NOTICE =
  "Built-in data and rules are screening aids. User-imported standards datasets are treated as user-owned/user-authorized data, and the importing organization remains responsible for licensing, accuracy, approval, and continued validity.";

export const EXPORT_GOVERNANCE_NOTICE =
  "Generated output is for screening/internal-review use unless independently validated. It is not certified engineering approval and shall not be issued for procurement, fabrication, construction, or safety-critical operation without qualified engineering review.";

export const PRIVACY_PLACEHOLDER =
  "Selection inputs and saved cases are stored locally in this browser unless a future cloud sync feature is explicitly enabled. A formal privacy policy must be approved before hosted or multi-user production deployment.";

export const TERMS_SUMMARY =
  "Use of this tool is limited to engineering decision support. Users are responsible for checking current licensed standards, project requirements, company specifications, exported deliverables, and final engineering approval.";

export function getGovernanceSnapshot({ datasetMetadata = {}, status = "Draft" } = {}) {
  const generatedAt = new Date().toISOString();
  return {
    appName: APP_GOVERNANCE.appName,
    appVersion: APP_GOVERNANCE.appVersion,
    releaseId: APP_GOVERNANCE.releaseId,
    generatedAt,
    status,
    readiness: APP_GOVERNANCE.defaultReadiness,
    classification: APP_GOVERNANCE.classification,
    owner: APP_GOVERNANCE.owner,
    maintainer: APP_GOVERNANCE.maintainer,
    supportEmail: APP_GOVERNANCE.supportEmail,
    engineeringAuthority: APP_GOVERNANCE.engineeringAuthority,
    dataSteward: APP_GOVERNANCE.dataSteward,
    independentChecker: APP_GOVERNANCE.independentChecker,
    datasetId: datasetMetadata.datasetId || "built-in-screening-logic",
    datasetVersion: datasetMetadata.datasetVersion || "screening",
    datasetStatus: datasetMetadata.verificationStatus || "SCREENING_ONLY",
    datasetStatusLabel:
      datasetMetadata.verificationStatusLabel || "Screening data - verification required",
    datasetOwner: datasetMetadata.owner || APP_GOVERNANCE.dataSteward,
    datasetReviewer: datasetMetadata.reviewer || APP_GOVERNANCE.independentChecker,
    datasetApprovalDate: datasetMetadata.approvedAt || datasetMetadata.lastReviewed || "Pending",
  };
}

export function getDatasetUseLabel(metadata = {}) {
  if (metadata.verificationStatus === "USER_APPROVED") {
    return "User-owned / user-authorized approved dataset";
  }
  if (metadata.verificationStatus === "USER_PROVIDED_PENDING_APPROVAL") {
    return "User-owned dataset pending approval";
  }
  return "Built-in screening logic/data";
}

export function canUseProductionReady(checklist = {}) {
  return PRODUCTION_GOVERNANCE_CHECKLIST.every((item) => checklist[item] === true);
}
