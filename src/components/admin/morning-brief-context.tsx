"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "admin-morning-brief-state";

// The brief "day" rolls over at 3am Pacific, not midnight local — matches
// when the scheduled sweep has usually finished writing fresh content, so
// re-opening the dashboard after that resets to collapsed rather than
// showing yesterday's expanded state.
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

type MorningBriefState = { expanded: boolean; toggle: () => void };
const MorningBriefContext = createContext<MorningBriefState | null>(null);

export function MorningBriefProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const todayKey = getBriefDayKey();
      if (raw) {
        const parsed = JSON.parse(raw) as { day: string; expanded: boolean };
        if (parsed.day === todayKey) {
          setExpanded(parsed.expanded);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: todayKey, expanded: false }));
    } catch {
      // private browsing or blocked storage — default stays collapsed
    }
  }, []);

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: getBriefDayKey(), expanded: next }));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <MorningBriefContext.Provider value={{ expanded, toggle }}>{children}</MorningBriefContext.Provider>
  );
}

export function useMorningBrief() {
  const ctx = useContext(MorningBriefContext);
  if (!ctx) throw new Error("useMorningBrief must be used within MorningBriefProvider");
  return ctx;
}
