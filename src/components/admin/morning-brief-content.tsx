import type { MarketRead } from "@/lib/types";

export type SectionMeta = { id: string; label: string; emoji: string; color: string };

// Kept for the Dashboard's compact preview (morning-brief-preview.tsx),
// which still groups by section with a color/emoji per theme. The full
// /admin/brief page below no longer uses color/emoji — see ResearchList.
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
// numbers/facts that matter, without a full markdown parser or
// dangerouslySetInnerHTML.
export function Bolded({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

// A single flat numbered list, priority-ordered (rates/San Diego first,
// matching SECTION_ORDER) rather than six separate colored sections —
// each entry: a small caps theme tag, a bold title, one flowing
// paragraph (summary + the "why it matters" angle folded in), and a
// muted "via Source" close. Matches the reference format directly.
export function ResearchList({ sections }: { sections: GroupedSection[] }) {
  const items = sections.flatMap((s) => s.reads.map((a) => ({ theme: s.meta.label, read: a })));
  if (items.length === 0) return null;

  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {items.map(({ theme, read: a }, i) => {
        const description = [a.summary, a.why_it_matters].filter(Boolean).join(" ");
        return (
          <li key={a.id} className="grid grid-cols-[22px_1fr] gap-2">
            <span className="text-sm tabular-nums text-[#B4B3A8]">{i + 1}</span>
            <div>
              <p className="eyebrow-sm mb-0.5 text-[#B4B3A8]">{theme}</p>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink no-underline hover:underline"
              >
                {a.title}
              </a>
              {description && (
                <p className="m-0 mt-0.5 text-[14px] text-[#6B6A63]">
                  <Bolded text={description} />{" "}
                  <span className="text-[#B4B3A8] underline decoration-[#B4B3A8] underline-offset-2">
                    via {a.source}
                  </span>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
