"use client";

import { useEffect } from "react";
import { markBriefReadToday } from "@/lib/morning-brief-read-state";

// Marks today's brief as read regardless of how this page was reached —
// the Dashboard teaser already marks it on click, but a bookmark or a
// direct URL visit skips that, so the brief page marks it itself too.
export function MarkMorningBriefRead() {
  useEffect(() => {
    markBriefReadToday();
  }, []);
  return null;
}
