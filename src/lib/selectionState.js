// Local-only selection state persistence (no auth)
const KEY = "valve_selection_state_v1";
const SAVED_KEY = "valve_saved_selections_v1";

export function saveSelectionState(state) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function loadSelectionState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSelectionState() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch {}
}

export function listSavedSelections() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSelection(entry) {
  const list = listSavedSelections();
  const id = `S-${Date.now().toString(36).toUpperCase()}`;
  const withId = { id, savedAt: new Date().toISOString(), ...entry };
  list.unshift(withId);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 50))); } catch {}
  return withId;
}

export function deleteSavedSelection(id) {
  const list = listSavedSelections().filter((s) => s.id !== id);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {}
}
