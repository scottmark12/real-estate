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

  // toggle() only flips React state — the panel further down the page
  // (a separate component) doesn't exist in the DOM until that state
  // change re-renders it, so a plain click otherwise looks like nothing
  // happened. Wait two animation frames (render + paint) before scrolling.
  const handleExpand = () => {
    toggle();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("morning-brief")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  // Once read, this shouldn't keep holding the most valuable spot on the
  // page — collapse to a thin line and let the full brief live at the
  // bottom instead (see MorningBriefPanel, id="morning-brief"). A plain
  // anchor link (not the toggle) so this scrolls down rather than hiding
  // the panel again.
  if (expanded) {
    return (
      <a
        href="#morning-brief"
        className="mt-6 flex w-full items-center justify-between border border-navy/15 bg-white/60 px-4 py-2.5 transition-colors hover:border-navy/30"
      >
        <span className="eyebrow-sm text-navy/50">
          &#10003; Morning Brief read — {totalBriefCount} {totalBriefCount === 1 ? "story" : "stories"}
        </span>
        <span className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4">
          Jump to Brief &darr;
        </span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleExpand}
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
        Read the Brief &darr;
      </span>
    </button>
  );
}
