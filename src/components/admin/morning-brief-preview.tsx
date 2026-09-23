"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isBriefReadToday } from "@/lib/morning-brief-read-state";
import type { GroupedSection } from "./morning-brief-content";

// Shown only once today's brief has been read (see MorningBriefTeaser) —
// a lightweight reminder of what was in it, not a re-render of the full
// page. The full read (key points, "Bottom Line", etc.) stays on
// /admin/brief; this is just enough to jog memory without it entirely
// disappearing off the dashboard once read.
export function MorningBriefPreview({ sections }: { sections: GroupedSection[] }) {
  const [readToday, setReadToday] = useState(false);

  useEffect(() => {
    setReadToday(isBriefReadToday());
  }, []);

  if (!readToday || sections.length === 0) return null;

  return (
    <div className="mt-14 border-t border-sand pt-8">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-navy/40">Today&apos;s Brief, at a Glance</p>
        <Link
          href="/admin/brief"
          className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
        >
          View Full Brief &rarr;
        </Link>
      </div>
      <div className="mt-4 flex flex-col divide-y divide-sand">
        {sections.map(({ theme, meta, reads }) => (
          <Link
            key={theme}
            href={`/admin/brief#${meta.id}`}
            className="group flex items-start gap-3 py-3"
          >
            <span className="mt-0.5 text-lg leading-none">{meta.emoji}</span>
            <div className="min-w-0">
              <p className="eyebrow-sm" style={{ color: meta.color }}>
                {meta.label} ({reads.length})
              </p>
              <p className="mt-0.5 text-sm text-navy/70 group-hover:text-navy group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                {reads[0]?.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
