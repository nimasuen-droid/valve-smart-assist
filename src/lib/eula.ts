import { APP_GOVERNANCE } from "@/lib/governance";

export const EULA_VERSION = "1.0.0";
export const EULA_EFFECTIVE_DATE = "12 May 2026";
export const EULA_LAST_UPDATED = "12 May 2026";
export const EULA_APP_NAME = APP_GOVERNANCE.appName;
export const EULA_OWNER = APP_GOVERNANCE.owner;
export const EULA_SUPPORT_EMAIL = APP_GOVERNANCE.supportEmail;
export const EULA_GOVERNING_LAW = "Federal Republic of Nigeria";

const STORAGE_KEY = "eula.acceptance.v1";

export interface EulaAcceptance {
  version: string;
  acceptedAt: string;
}

export function getEulaAcceptance(): EulaAcceptance | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EulaAcceptance;
    if (parsed?.version === EULA_VERSION && parsed?.acceptedAt) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setEulaAccepted(): EulaAcceptance {
  const record: EulaAcceptance = {
    version: EULA_VERSION,
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Local acceptance storage is best-effort; the gate will still open if storage is blocked.
  }
  return record;
}

export function clearEulaAcceptance() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
