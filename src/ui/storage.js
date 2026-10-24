// localStorage access. Every call is wrapped: storage may be missing, full or blocked.
import { normalizeConfig } from '../core/index.js';

const CONFIG_KEY = 'flux-rc:config';
const SAVED_KEY = 'flux-rc:saved';

function read(key) {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}

export function storageAvailable() {
  try {
    localStorage.setItem('flux-rc:probe', '1');
    localStorage.removeItem('flux-rc:probe');
    return true;
  } catch (error) {
    console.warn('flux-rc: localStorage is not available', error);
    return false;
  }
}

export function loadAutosave() {
  try {
    const stored = read(CONFIG_KEY);
    return stored === null ? null : normalizeConfig(stored);
  } catch (error) {
    console.warn('flux-rc: could not read the autosaved config', error);
    return null;
  }
}

export function autosave(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('flux-rc: could not autosave', error);
  }
}

/** Returns { ok, items }. items: [{ id, name, savedAt, config }], newest first. */
export function listSaved() {
  if (!storageAvailable()) return { ok: false, items: [] };
  try {
    const items = read(SAVED_KEY) || [];
    // Anything that is not an object with an id (hand-edited or damaged storage) is ignored.
    const valid = Array.isArray(items) ? items.filter((i) => i && typeof i === 'object' && typeof i.id === 'string') : [];
    return { ok: true, items: valid };
  } catch (error) {
    console.warn('flux-rc: saved list is unreadable', error);
    return { ok: true, items: [] };
  }
}

function writeSaved(items) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.warn('flux-rc: could not write the saved list', error);
    return false;
  }
}

export function addSaved(name, config) {
  const { items } = listSaved();
  const entry = { id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, savedAt: Date.now(), config };
  return writeSaved([entry, ...items]);
}

export function renameSaved(id, name) {
  const { items } = listSaved();
  return writeSaved(items.map((item) => (item.id === id ? { ...item, name } : item)));
}

export function deleteSaved(id) {
  const { items } = listSaved();
  return writeSaved(items.filter((item) => item.id !== id));
}

/** A small string preference (e.g. flux-rc:switch). Returns fallback when storage fails. */
export function readPref(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    console.warn(`flux-rc: could not read ${key}`, error);
    return fallback;
  }
}

export function writePref(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    console.warn(`flux-rc: could not save ${key}`, error);
  }
}
