// Local-only selection state persistence (no auth)
const KEY = "valve_selection_state_v1";
const SAVED_KEY = "valve_saved_selections_v1";
const REPORTS_KEY = "valve_saved_reports_v1";
const MAX_SAVED_REPORTS = 5;

export function saveSelectionState(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function loadSelectionState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSelectionState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function listSavedSelections() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedSelection(id) {
  return listSavedSelections().find((s) => s.id === id) ?? null;
}

export function saveSelection(entry) {
  const list = listSavedSelections();
  const id = `S-${Date.now().toString(36).toUpperCase()}`;
  const withId = { id, savedAt: new Date().toISOString(), ...entry };
  list.unshift(withId);
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
  return withId;
}

export function deleteSavedSelection(id) {
  const list = listSavedSelections().filter((s) => s.id !== id);
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {}
}

export function listSavedReports() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedReport(id) {
  return listSavedReports().find((report) => report.id === id) ?? null;
}

export function saveReport(entry) {
  const list = listSavedReports();
  const id = `R-${Date.now().toString(36).toUpperCase()}`;
  const report = { id, savedAt: new Date().toISOString(), ...entry };
  const next = [report, ...list.filter((item) => item.id !== id)].slice(0, MAX_SAVED_REPORTS);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  } catch {}
  return report;
}

export function deleteSavedReport(id) {
  const list = listSavedReports().filter((report) => report.id !== id);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  } catch {}
}

export function exportSelectionSnapshot(state, savedSelections = listSavedSelections()) {
  return {
    schema: "valve-smart-assist.selection-snapshot.v1",
    exportedAt: new Date().toISOString(),
    currentSelection: state,
    savedSelections,
    savedReports: listSavedReports(),
  };
}

export function importSelectionSnapshot(snapshot) {
  if (!snapshot || snapshot.schema !== "valve-smart-assist.selection-snapshot.v1") {
    throw new Error("Unsupported selection snapshot format.");
  }
  if (snapshot.currentSelection) saveSelectionState(snapshot.currentSelection);
  if (Array.isArray(snapshot.savedSelections)) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(snapshot.savedSelections.slice(0, 50)));
  }
  if (Array.isArray(snapshot.savedReports)) {
    localStorage.setItem(
      REPORTS_KEY,
      JSON.stringify(snapshot.savedReports.slice(0, MAX_SAVED_REPORTS)),
    );
  }
  return snapshot;
}
