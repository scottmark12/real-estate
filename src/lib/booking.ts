// Free intro call booking: Mark's set hours, in San Diego time.

export const TZ = "America/Los_Angeles";
export const SLOT_MINUTES = 15;
export const DAYS_AHEAD = 14;
/** Times at least this far out confirm instantly; sooner ones are requests. */
export const AUTO_CONFIRM_HOURS = 24;

// Day of week (0 = Sunday) → [start hour, end hour). Sunday off.
export const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [7, 19],
  2: [7, 19],
  3: [7, 19],
  4: [7, 19],
  5: [7, 19],
  6: [8, 12],
};

export type Slot = { start: string; kind: "book" | "request" };

/** Offset of San Diego time from UTC, in minutes, at a given instant. */
function tzOffsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** A San Diego wall-clock time as a real instant. */
export function sdTime(y: number, m: number, d: number, h: number, min: number) {
  const guess = new Date(Date.UTC(y, m - 1, d, h, min));
  const offset = tzOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}

/** Today's date in San Diego. */
function sdToday(now: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now).split("-");
  return { y: Number(p[0]), m: Number(p[1]), d: Number(p[2]) };
}

/** Every open start time in the window, minus taken ones. */
export function openSlots(taken: Set<string>, now = new Date()): Slot[] {
  const { y, m, d } = sdToday(now);
  const out: Slot[] = [];
  const earliest = now.getTime() + 60 * 60000; // no one books a call for the next hour
  const confirmAfter = now.getTime() + AUTO_CONFIRM_HOURS * 3600000;
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i));
    const hours = HOURS[day.getUTCDay()];
    if (!hours) continue;
    for (let mins = hours[0] * 60; mins < hours[1] * 60; mins += SLOT_MINUTES) {
      const start = sdTime(
        day.getUTCFullYear(),
        day.getUTCMonth() + 1,
        day.getUTCDate(),
        Math.floor(mins / 60),
        mins % 60,
      );
      const t = start.getTime();
      const iso = start.toISOString();
      if (t < earliest || taken.has(iso)) continue;
      out.push({ start: iso, kind: t >= confirmAfter ? "book" : "request" });
    }
  }
  return out;
}

/** True when a start time is one of Mark's real slots (guards the API). */
export function isRealSlot(iso: string, now = new Date()) {
  return openSlots(new Set(), now).find((s) => s.start === iso) ?? null;
}

export function formatSlot(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
