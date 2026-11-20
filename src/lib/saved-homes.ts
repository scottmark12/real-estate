"use client";

// Saved homes live in the visitor's browser (no account needed).
const KEY = "ms_saved_homes";
const EVENT = "ms-saved-homes";

export function getSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): boolean {
  const ids = getSaved();
  const on = !ids.includes(id);
  const next = on ? [id, ...ids] : ids.filter((x) => x !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, 60)));
  } catch {
    // Private browsing or storage full: the heart just won't stick.
  }
  window.dispatchEvent(new Event(EVENT));
  return on;
}

export function subscribeSaved(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

// For useSyncExternalStore: a stable string snapshot.
export function savedSnapshot() {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
