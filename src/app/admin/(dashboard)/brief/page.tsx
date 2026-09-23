import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { currentWeekNumber } from "@/lib/format";
import type { DailyBrief, Goal, GoalWeeklyTarget } from "@/lib/types";

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
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: briefData },
    { count: clientsDueCount },
    { count: dealsDueCount },
    { data: goalsData },
  ] = await Promise.all([
    supabase.from("daily_briefs").select("*").eq("brief_date", today).maybeSingle(),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .lte("next_follow_up_date", today),
    supabase
      .from("deal_companies")
      .select("id", { count: "exact", head: true })
      .lte("next_action_date", today),
    supabase
      .from("goals")
      .select("*")
      .lte("period_start", today)
      .gte("period_end", today)
      .order("sort_order", { ascending: true }),
  ]);

  const brief = briefData as DailyBrief | null;
  const goals = (goalsData as Goal[]) ?? [];
  const totalDue = (clientsDueCount ?? 0) + (dealsDueCount ?? 0);

  let weeklyTargets = new Map<string, string>();
  if (goals.length > 0) {
    const { data: targetsData } = await supabase
      .from("goal_weekly_targets")
      .select("*")
      .in(
        "goal_id",
        goals.map((g) => g.id)
      );
    const targets = (targetsData as GoalWeeklyTarget[]) ?? [];
    weeklyTargets = new Map(
      targets
        .filter((t) => t.week_number === currentWeekNumber(goals.find((g) => g.id === t.goal_id)?.period_start ?? today))
        .map((t) => [t.goal_id, t.target_text])
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-gold">{formatToday()}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        {brief?.headline || "Today"}
      </h1>

      <div className="mt-8 border border-navy/10 bg-white/60 p-6">
        <p className="eyebrow text-navy/40">Your Day</p>
        <p className="mt-3 text-lg text-navy">
          {totalDue > 0 ? (
            <>
              <strong>{totalDue}</strong> {totalDue === 1 ? "call is" : "calls are"}{" "}
              due today.{" "}
              <Link
                href="/admin/calls"
                className="underline decoration-gold decoration-2 underline-offset-4"
              >
                Start the Call Center &rarr;
              </Link>
            </>
          ) : (
            "Nothing is due in the call queue today."
          )}
        </p>
        {brief?.call_summary && (
          <p className="mt-2 text-sm text-navy/60">{brief.call_summary}</p>
        )}
      </div>

      <div className="mt-8">
        <p className="eyebrow text-gold">This Week&apos;s Goals</p>
        {goals.length === 0 ? (
          <p className="mt-3 text-navy/50">
            No active goals right now.{" "}
            <Link
              href="/admin/goals/new"
              className="underline decoration-gold decoration-2 underline-offset-4"
            >
              Set one up &rarr;
            </Link>
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {goals.map((g) => (
              <div key={g.id} className="py-4">
                <div className="flex items-baseline justify-between">
                  <Link
                    href={`/admin/goals/${g.id}/edit`}
                    className="font-medium text-navy underline decoration-gold decoration-2 underline-offset-4"
                  >
                    {g.title}
                  </Link>
                  <span className="eyebrow text-navy/40">
                    Week {currentWeekNumber(g.period_start)} of 12
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-navy/70">
                  {weeklyTargets.get(g.id) || "No target set for this week yet."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {brief && brief.articles.length > 0 && (
        <div className="mt-8">
          <p className="eyebrow text-gold">Reading</p>
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {brief.articles.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 hover:bg-sand/20"
              >
                <p className="eyebrow text-navy/40">{a.source}</p>
                <p className="mt-1 font-medium text-navy">{a.title}</p>
                <p className="mt-1 text-sm text-navy/60">{a.summary}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {brief?.deep_report && (
        <div className="mt-8 border border-gold/30 bg-gold/5 p-6">
          <p className="eyebrow text-gold">Deep Dive</p>
          <a
            href={brief.deep_report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block"
          >
            <p className="font-medium text-navy">{brief.deep_report.title}</p>
            <p className="mt-1 text-sm text-navy/60">{brief.deep_report.summary}</p>
          </a>
        </div>
      )}

      {!brief && (
        <p className="mt-10 text-xs text-navy/40">
          No brief has been generated for today yet — this is a live view
          built from your goals and call queue.
        </p>
      )}
    </div>
  );
}
