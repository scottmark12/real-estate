import type { MarketRead } from "@/lib/types";

export type SectionMeta = { id: string; label: string; emoji: string; color: string };

// Each section gets its own real hue (not a shade of the same navy) and its
// own emoji anchor — that's most of what makes a newsletter feel like a
// sequence of distinct "stops" while you scroll, rather than one long list.
export const SECTION_META: Record<string, SectionMeta> = {
  rates: { id: "rates", label: "Rates", emoji: "💰", color: "#2b57a8" },
  san_diego: { id: "san-diego", label: "San Diego & SoCal", emoji: "🌴", color: "#0d7a6e" },
  opportunities: { id: "opportunities", label: "Deals & Opportunities", emoji: "🤝", color: "#a3690a" },
  practices: { id: "how-we-build", label: "How We Build", emoji: "🏗️", color: "#b0492f" },
  systems_codes: { id: "policy-codes", label: "Policy & Codes", emoji: "📜", color: "#1f6b3a" },
  vision: { id: "big-picture", label: "The Big Picture", emoji: "🔭", color: "#6b3fa0" },
};

export const SECTION_ORDER = ["rates", "san_diego", "opportunities", "practices", "systems_codes", "vision"];

export type GroupedSection = { theme: string; meta: SectionMeta; reads: MarketRead[] };

export function groupIntoSections(reads: MarketRead[]): GroupedSection[] {
  return SECTION_ORDER.map((theme) => ({
    theme,
    meta: SECTION_META[theme],
    reads: reads.filter((a) => a.theme === theme),
  })).filter((s) => s.reads.length > 0);
}

// Renders "**bold**" spans as real emphasis — lets the sweep bold the
// numbers/facts that matter, Morning-Brew style, without a full markdown
// parser or dangerouslySetInnerHTML.
export function Bolded({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-navy">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

function KeyPoints({ a, color }: { a: MarketRead; color: string }) {
  if (!a.key_points || a.key_points.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {a.key_points.map((point, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-0.5" style={{ color }}>
            &#10003;
          </span>
          <span
            className="text-[15px] leading-[1.55]"
            style={{ color: "color-mix(in srgb, var(--navy) 82%, transparent)" }}
          >
            <Bolded text={point} />
          </span>
        </div>
      ))}
    </div>
  );
}

// The first story in a section reads like a lede — full headline, full
// treatment. The rest are scannable "quick hits" — headline only, visually
// grouped apart so they don't read as sub-points of the lede.
function LeadStory({ a, color }: { a: MarketRead; color: string }) {
  return (
    <div className="py-6">
      <p className="eyebrow-sm" style={{ color: "color-mix(in srgb, " + color + " 70%, var(--navy))" }}>
        {a.source}
      </p>
      <p className="mt-2 font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-navy">
        {a.title}
      </p>
      {a.summary && (
        <p
          className="mt-3 max-w-[52ch] text-[15px] leading-[1.7]"
          style={{ color: "color-mix(in srgb, var(--navy) 78%, transparent)" }}
        >
          <Bolded text={a.summary} />
        </p>
      )}
      <KeyPoints a={a} color={color} />
      {a.why_it_matters && (
        <div className="mt-3 max-w-[52ch] border-l-2 pl-3" style={{ borderColor: color + "66" }}>
          <p className="eyebrow-sm text-navy/40">Bottom Line</p>
          <p className="mt-1 text-sm text-navy/70">
            <Bolded text={a.why_it_matters} />
          </p>
        </div>
      )}
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow-sm mt-3 inline-block underline decoration-2 underline-offset-4"
        style={{ color, textDecorationColor: color }}
      >
        Read the Full Story &rarr;
      </a>
    </div>
  );
}

function QuickHit({ a }: { a: MarketRead }) {
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-t border-sand/70 py-4 first:border-t-0"
    >
      <p className="eyebrow-sm text-navy/35">{a.source}</p>
      <p className="mt-1 font-display text-base font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
        {a.title}
      </p>
    </a>
  );
}

function Section({ meta, reads }: { meta: SectionMeta; reads: MarketRead[] }) {
  if (reads.length === 0) return null;
  const [lead, ...rest] = reads;
  return (
    <div id={meta.id} className="mt-12 scroll-mt-6">
      <div className="flex items-baseline justify-between border-b-2 pb-2" style={{ borderColor: meta.color }}>
        <p className="eyebrow" style={{ color: meta.color }}>
          <span className="mr-1.5">{meta.emoji}</span>
          {meta.label}
        </p>
        <p className="eyebrow-sm text-navy/30">
          {reads.length} {reads.length === 1 ? "story" : "stories"}
        </p>
      </div>
      <LeadStory a={lead} color={meta.color} />
      {rest.length > 0 && (
        <div className="border-t-2 border-sand bg-sand/15 px-4">
          <p className="eyebrow-sm pt-3 text-navy/35">More From This Section</p>
          {rest.map((a) => (
            <QuickHit key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

// The jump-list + every section, in order. Used by both the standalone
// /admin/brief page and the inline panel on the Dashboard.
export function BriefSections({ sections }: { sections: GroupedSection[] }) {
  const totalStories = sections.reduce((sum, s) => sum + s.reads.length, 0);

  if (sections.length === 0) return null;

  return (
    <>
      <p className="mt-6 text-navy/70">
        <strong className="text-navy">{totalStories} stories</strong> across {sections.length} beats
        today — here&apos;s what&apos;s on deck.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {sections.map(({ theme, meta, reads: sectionReads }) => (
          <a
            key={theme}
            href={`#${meta.id}`}
            className="flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:text-white hover:[background-color:var(--pill-color)]"
            style={
              {
                borderColor: meta.color,
                "--pill-color": meta.color,
              } as React.CSSProperties
            }
          >
            <span>{meta.emoji}</span>
            {meta.label}
            <span className="text-navy/40">({sectionReads.length})</span>
          </a>
        ))}
      </div>

      {sections.map(({ theme, meta, reads: sectionReads }) => (
        <Section key={theme} meta={meta} reads={sectionReads} />
      ))}
    </>
  );
}
