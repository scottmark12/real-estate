import Link from "next/link";
import { Fraunces } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary } from "@/components/admin/ui";
import { Bolded, ResearchList, groupIntoSections } from "@/components/admin/morning-brief-content";
import { MarkMorningBriefRead } from "@/components/admin/mark-morning-brief-read";
import { refreshMarketReads } from "../actions";
import type { DailyBrief, MarketRead } from "@/lib/types";

export const revalidate = 0;

const fraunces = Fraunces({ subsets: ["latin"], weight: "600", style: "normal" });

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBriefPage() {
  const supabase = await createClient();
  const todayIso = new Date().toISOString().slice(0, 10);

  const [{ data }, { data: dailyBriefData }] = await Promise.all([
    supabase.from("market_reads").select("*").eq("kept", true).order("published_at", { ascending: false }).limit(40),
    supabase.from("daily_briefs").select("*").eq("brief_date", todayIso).maybeSingle(),
  ]);

  const reads = (data as MarketRead[]) ?? [];
  const sections = groupIntoSections(reads);
  const dayPlan = (dailyBriefData as DailyBrief | null)?.day_plan ?? null;

  return (
    <div className="-m-6 min-h-screen bg-[#FCFCFB] sm:-m-10">
      <MarkMorningBriefRead />

      {/* Masthead — a dedicated wash band, distinct from the admin's navy/cream chrome. */}
      <div className="border-b border-[#E1E1DF] bg-[#F9F9F7] px-6 py-11 sm:px-10">
        <div className="mx-auto max-w-[860px]">
          <Link href="/admin" className="text-[13px] text-[#6B6A63] underline decoration-[#B4B3A8] underline-offset-2">
            &larr; Dashboard
          </Link>
          <p className="mt-4 text-[13px] text-[#6B6A63]">{formatToday()}</p>
          <h1
            className={`${fraunces.className} mt-2 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-[#2E2C27] sm:text-[40px]`}
          >
            {dayPlan ? <Bolded text={dayPlan} /> : "Good morning, Mark."}
          </h1>
          <form action={refreshMarketReads} className="mt-4">
            <button type="submit" className="text-[13px] text-[#6B6A63] underline decoration-[#B4B3A8] underline-offset-2 hover:text-[#2E2C27]">
              Refresh Articles
            </button>
          </form>
        </div>
      </div>

      <div className="px-6 py-9 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-[860px]">
          {reads.length === 0 ? (
            <div className="border border-dashed border-[#E4E3DC] p-8 text-center">
              <p className="text-[#6B6A63]">No brief pulled yet today.</p>
              <form action={refreshMarketReads} className="mt-4">
                <button type="submit" className={btnPrimary}>
                  Refresh Articles
                </button>
              </form>
            </div>
          ) : (
            <>
              <h2 className="mb-3 text-[15px] font-semibold text-[#2E2C27]">Research</h2>
              <ResearchList sections={sections} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
