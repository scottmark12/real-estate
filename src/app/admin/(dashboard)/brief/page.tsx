import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary } from "@/components/admin/ui";
import { BriefSections, groupIntoSections } from "@/components/admin/morning-brief-content";
import type { MarketRead } from "@/lib/types";
import { refreshMarketReads } from "../actions";

export const revalidate = 0;

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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
  const sections = groupIntoSections(reads);

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
            <button type="submit" className={btnPrimary}>
              Refresh Articles
            </button>
          </form>
        </div>
      )}

      <BriefSections sections={sections} />
    </div>
  );
}
