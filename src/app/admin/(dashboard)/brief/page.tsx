import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnSecondary } from "@/components/admin/ui";
import type { MarketRead } from "@/lib/types";
import { refreshMarketReads } from "../actions";

export const revalidate = 0;

const SECTION_LABELS: Record<string, string> = {
  opportunities: "Deals & Opportunities",
  practices: "How We Build",
  systems_codes: "Policy & Codes",
  vision: "The Big Picture",
};

const SECTION_ORDER = ["opportunities", "practices", "systems_codes", "vision"];

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// The first story in a section reads like a lede — full headline, full
// blurb. The rest are scannable "quick hits" — one clamped line each, so
// the whole section can be combed by headline alone before deciding what
// to click into.
function LeadStory({ a }: { a: MarketRead }) {
  return (
    <div className="py-6">
      <p className="eyebrow-sm text-navy/40">{a.source}</p>
      <p className="mt-2 font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-navy">
        {a.title}
      </p>
      {a.summary && (
        <p
          className="mt-3 max-w-[52ch] text-[15px] leading-[1.7]"
          style={{ color: "color-mix(in srgb, var(--navy) 78%, transparent)" }}
        >
          {a.summary}
        </p>
      )}
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow-sm mt-3 inline-block text-blue underline decoration-blue decoration-2 underline-offset-4"
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
      className="group flex items-start gap-3 border-t border-sand/70 py-3.5 first:border-t-0"
    >
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/25 group-hover:bg-gold" />
      <div className="min-w-0">
        <p className="font-medium leading-snug text-navy group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
          {a.title}
        </p>
        <p className="mt-0.5 text-xs text-navy/40">{a.source}</p>
      </div>
    </a>
  );
}

function Section({
  label,
  color,
  reads,
}: {
  label: string;
  color: "gold" | "blue";
  reads: MarketRead[];
}) {
  if (reads.length === 0) return null;
  const [lead, ...rest] = reads;
  return (
    <div className="mt-10">
      <div
        className={`flex items-baseline justify-between border-b-2 pb-2 ${
          color === "blue" ? "border-blue" : "border-navy"
        }`}
      >
        <p className={`eyebrow ${color === "blue" ? "text-blue" : "text-gold"}`}>{label}</p>
        <p className="eyebrow-sm text-navy/30">
          {reads.length} {reads.length === 1 ? "story" : "stories"}
        </p>
      </div>
      <LeadStory a={lead} />
      {rest.length > 0 && (
        <div className="border-t border-sand">
          {rest.map((a) => (
            <QuickHit key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminBriefPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("market_reads")
    .select("*")
    .eq("kept", true)
    .order("published_at", { ascending: false })
    .limit(40);

  const reads = (data as MarketRead[]) ?? [];
  const spotlight = reads.filter((a) => a.theme === "rates" || a.theme === "san_diego");
  const sections = SECTION_ORDER.map((theme) => ({
    theme,
    label: SECTION_LABELS[theme],
    reads: reads.filter((a) => a.theme === theme),
  })).filter((s) => s.reads.length > 0);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin"
        className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
      >
        &larr; Dashboard
      </Link>

      <div className="mt-6 border-b-4 border-double border-navy pb-6">
        <p className="eyebrow text-gold">The Morning Brief</p>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-navy">
          Good morning, Mark.
        </h1>
        <div className="mt-3 flex items-baseline justify-between">
          <p className="eyebrow-sm text-navy/50">{formatToday()}</p>
          <form action={refreshMarketReads}>
            <button
              type="submit"
              className="eyebrow-sm text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
            >
              Refresh Articles
            </button>
          </form>
        </div>
      </div>

      {reads.length === 0 && (
        <div className="mt-10 border border-dashed border-navy/20 p-8 text-center">
          <p className="text-navy/50">No brief pulled yet today.</p>
          <form action={refreshMarketReads} className="mt-4">
            <button type="submit" className={btnSecondary}>
              Refresh Articles
            </button>
          </form>
        </div>
      )}

      <Section label="Rates & San Diego" color="blue" reads={spotlight} />
      {sections.map((section) => (
        <Section key={section.theme} label={section.label} color="gold" reads={section.reads} />
      ))}
    </div>
  );
}
