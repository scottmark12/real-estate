"use client";

import { useMorningBrief } from "./morning-brief-context";
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
  const { expanded, toggle } = useMorningBrief();

  return (
    <button
      type="button"
      onClick={toggle}
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
        {expanded ? "Hide the Brief ↑" : "Read the Brief ↓"}
      </span>
    </button>
  );
}
