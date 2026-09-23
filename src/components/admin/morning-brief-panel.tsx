"use client";

import { useMorningBrief } from "./morning-brief-context";
import { BriefSections, type GroupedSection } from "./morning-brief-content";
import { refreshMarketReads } from "@/app/admin/(dashboard)/actions";

export function MorningBriefPanel({ sections }: { sections: GroupedSection[] }) {
  const { expanded } = useMorningBrief();
  if (!expanded) return null;

  return (
    <div className="mt-14 border-t-4 border-double border-navy pt-8">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-gold">The Morning Brief</p>
        <form action={refreshMarketReads}>
          <button
            type="submit"
            className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
          >
            Refresh Articles
          </button>
        </form>
      </div>
      {sections.length === 0 ? (
        <p className="mt-6 text-navy/50">No brief pulled yet today.</p>
      ) : (
        <BriefSections sections={sections} />
      )}
    </div>
  );
}
