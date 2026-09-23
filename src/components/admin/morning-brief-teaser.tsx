"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isBriefReadToday, markBriefReadToday } from "@/lib/morning-brief-read-state";
import type { MarketRead } from "@/lib/types";

export function MorningBriefTeaser({
  topStory,
  totalBriefCount,
  spotlightCount,
}: {
  topStory: MarketRead | null;
  totalBriefCount: number;
  spotlightCount: number;
}) {
  const [readToday, setReadToday] = useState(false);

  useEffect(() => {
    setReadToday(isBriefReadToday());
  }, []);

  // Once read, this shouldn't keep holding the most valuable spot on the
  // page — collapse to a thin line for the rest of the day (resets at
  // 3am Pacific). Still links to /admin/brief either way; this app
  // doesn't try to render the brief in place, it's its own page.
  if (readToday) {
    return (
      <Link
        href="/admin/brief"
        className="mt-6 flex w-full items-center justify-between border border-navy/15 bg-white/60 px-4 py-2.5 transition-colors hover:border-navy/30"
      >
        <span className="eyebrow-sm text-navy/50">
          &#10003; Morning Brief read — {totalBriefCount} {totalBriefCount === 1 ? "story" : "stories"}
        </span>
        <span className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4">
          Open the Brief &rarr;
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/admin/brief"
      onClick={() => {
        markBriefReadToday();
        setReadToday(true);
      }}
      className="mt-8 block w-full border border-navy bg-navy p-7 text-left text-cream transition-colors hover:bg-ink"
    >
      <p className="eyebrow text-gold">The Morning Brief</p>
      {topStory ? (
        <>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug">{topStory.title}</p>
          <p className="mt-3 text-sm text-cream/70">
            {totalBriefCount} {totalBriefCount === 1 ? "story" : "stories"} today
            {spotlightCount > 0 ? ` — ${spotlightCount} on rates & San Diego` : ""}.
          </p>
        </>
      ) : (
        <p className="mt-3 text-cream/70">No brief pulled yet today.</p>
      )}
      <span className="eyebrow mt-5 inline-block text-gold underline decoration-gold decoration-2 underline-offset-4">
        Read the Brief &rarr;
      </span>
    </Link>
  );
}
