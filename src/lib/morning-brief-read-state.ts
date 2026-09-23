// Tracks "has Mark opened today's brief yet" in localStorage, purely a
// per-browser UI convenience (which teaser variant to show) — not synced
// anywhere, never read server-side. The "day" rolls over at 3am Pacific
// rather than local midnight, matching when the scheduled sweep has
// usually finished writing fresh content.

const STORAGE_KEY = "admin-morning-brief-read-day";

function getBriefDayKey(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  let y = Number(map.year);
  let m = Number(map.month);
  let d = Number(map.day);
  const h = Number(map.hour);

  if (h < 3) {
    const prev = new Date(Date.UTC(y, m - 1, d));
    prev.setUTCDate(prev.getUTCDate() - 1);
    y = prev.getUTCFullYear();
    m = prev.getUTCMonth() + 1;
    d = prev.getUTCDate();
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function isBriefReadToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === getBriefDayKey();
  } catch {
    return false;
  }
}

export function markBriefReadToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getBriefDayKey());
  } catch {
    // private browsing / blocked storage — nothing to persist, no-op
  }
}
