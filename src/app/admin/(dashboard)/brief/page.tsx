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

function Story({ a }: { a: MarketRead }) {
  return (
    <div className="border-b border-sand py-6 last:border-0">
      <p className="eyebrow text-navy/40">{a.source}</p>
      <p className="mt-2 font-display text-xl font-semibold leading-snug text-navy">
        {a.title}
      </p>
      {a.summary && <p className="mt-2 text-navy/70">{a.summary}</p>}
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow mt-3 inline-block text-blue underline decoration-blue decoration-2 underline-offset-4"
      >
        Read the Full Story &rarr;
      </a>
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
        className="eyebrow text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
      >
        &larr; Dashboard
      </Link>

      <div className="mt-6 border-b-2 border-navy pb-6">
        <p className="eyebrow text-gold">The Morning Brief</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
          Good morning, Mark.
        </h1>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-navy/60">{formatToday()}</p>
          <form action={refreshMarketReads}>
            <button
              type="submit"
              className="eyebrow text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
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

      {spotlight.length > 0 && (
        <div className="mt-2">
          <p className="eyebrow mt-8 text-blue">Rates &amp; San Diego</p>
          <div className="mt-1">
            {spotlight.map((a) => (
              <Story key={a.id} a={a} />
            ))}
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.theme}>
          <p className="eyebrow mt-8 text-gold">{section.label}</p>
          <div className="mt-1">
            {section.reads.map((a) => (
              <Story key={a.id} a={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
