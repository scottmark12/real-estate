import { btnPrimary, textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { currentWeekNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { METRIC_LABELS, TAP_METRICS, formatMetricValue } from "@/lib/metrics";
import { scoreWeek } from "./actions";
import type { Goal, GoalWeeklyTarget, LeadLog, MetricKey, WeeklyScore, WeeklyTargetNumeric } from "@/lib/types";

export const revalidate = 0;

// Season checkpoints from the build spec — not stored anywhere, just the
// reference line for the lag panel.
const CHECKPOINTS = [
  { week: 4, weight: 177, pushups: 37, pullups: 9, run5k: 23 * 60 + 20 },
  { week: 8, weight: 176, pushups: 44, pullups: 12, run5k: 22 * 60 + 40 },
  { week: 12, weight: 175, pushups: 50, pullups: 15, run5k: 22 * 60 },
];

function weekNumberForDate(dateIso: string, seasonStart: string): number {
  const diffDays = Math.floor(
    (new Date(`${dateIso}T00:00:00Z`).getTime() - new Date(`${seasonStart}T00:00:00Z`).getTime()) / 86400000
  );
  return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
}

export default async function ScorecardPage() {
  const supabase = await createClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const isFriday = now.getDay() === 5;

  // The season anchor is read live from goals.period_start rather than
  // hardcoded — it's moved at least once already this week, and a fixed
  // constant here would silently drift out of sync with the Goals section
  // and Daily To-Do (which both already derive their week number from the
  // live column) the moment someone changes it again.
  const { data: earliestGoalData } = await supabase
    .from("goals")
    .select("period_start")
    .order("period_start", { ascending: true })
    .limit(1)
    .maybeSingle();
  const seasonStart = (earliestGoalData as { period_start: string } | null)?.period_start ?? todayIso;
  const currentWeek = currentWeekNumber(seasonStart);

  const [
    { data: allTargetsData },
    { data: allLogsData },
    { data: goalsData },
    { data: weeklyScoresData },
  ] = await Promise.all([
    supabase.from("weekly_targets_numeric").select("*"),
    supabase.from("lead_logs").select("*").gte("log_date", seasonStart).lte("log_date", todayIso),
    supabase.from("goals").select("*").lte("period_start", todayIso).gte("period_end", todayIso).order("sort_order"),
    supabase.from("weekly_scores").select("*").order("week_number"),
  ]);

  const allTargets = (allTargetsData as WeeklyTargetNumeric[]) ?? [];
  const allLogs = (allLogsData as LeadLog[]) ?? [];
  const goals = (goalsData as Goal[]) ?? [];
  const weeklyScores = (weeklyScoresData as WeeklyScore[]) ?? [];
  const scoreByWeek = new Map(weeklyScores.map((s) => [s.week_number, s]));

  const targetsByWeek = new Map<number, Map<MetricKey, number>>();
  for (const t of allTargets) {
    const m = targetsByWeek.get(t.week_number) ?? new Map();
    m.set(t.metric, t.target);
    targetsByWeek.set(t.week_number, m);
  }

  const logsByWeek = new Map<number, LeadLog[]>();
  for (const l of allLogs) {
    const wk = weekNumberForDate(l.log_date, seasonStart);
    const list = logsByWeek.get(wk) ?? [];
    list.push(l);
    logsByWeek.set(wk, list);
  }

  function tapSumsForWeek(weekNumber: number): Map<MetricKey, number> {
    const sums = new Map<MetricKey, number>();
    for (const l of logsByWeek.get(weekNumber) ?? []) {
      if (!TAP_METRICS.includes(l.metric)) continue;
      sums.set(l.metric, (sums.get(l.metric) ?? 0) + l.amount);
    }
    return sums;
  }

  function executionPctForWeek(weekNumber: number): number | null {
    const targets = targetsByWeek.get(weekNumber);
    if (!targets || targets.size === 0) return null;
    const sums = tapSumsForWeek(weekNumber);
    const ratios = [...targets.entries()].map(([metric, target]) => Math.min((sums.get(metric) ?? 0) / target, 1));
    if (ratios.length === 0) return null;
    return Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  }

  const currentTargets = targetsByWeek.get(currentWeek) ?? new Map<MetricKey, number>();
  const currentSums = tapSumsForWeek(currentWeek);
  const metricRows = [...currentTargets.entries()].map(([metric, target]) => {
    const done = currentSums.get(metric) ?? 0;
    return { metric, done, target, pct: Math.min(Math.round((done / target) * 100), 100) };
  });
  const executionPct = executionPctForWeek(currentWeek) ?? 0;

  const sparkline = Array.from({ length: 12 }, (_, i) => i + 1).map((wk) => ({
    week: wk,
    pct: wk <= currentWeek ? executionPctForWeek(wk) ?? 0 : null,
  }));

  // Lag panel — season-long totals and the latest logged checkpoint
  // measurement, regardless of which week it landed in.
  const hatsTotal = allLogs.filter((l) => l.metric === "hats_sold").reduce((sum, l) => sum + l.amount, 0);
  const dollarsClosed = allLogs.filter((l) => l.metric === "dollars_closed").reduce((sum, l) => sum + l.amount, 0);
  const dollarsUnderContract = allLogs
    .filter((l) => l.metric === "dollars_under_contract")
    .reduce((sum, l) => sum + l.amount, 0);

  function latestValue(metric: MetricKey): number | null {
    const matches = allLogs.filter((l) => l.metric === metric).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return matches[0]?.amount ?? null;
  }
  const latestWeight = latestValue("weight_lbs");
  const latestPushups = latestValue("pushups_max");
  const latestPullups = latestValue("pullups_max");
  const latest5k = latestValue("run_5k_seconds");

  let weeklyTargetTextByGoal = new Map<string, string>();
  if (goals.length > 0) {
    const { data: targetsData } = await supabase
      .from("goal_weekly_targets")
      .select("*")
      .in("goal_id", goals.map((g) => g.id))
      .eq("week_number", currentWeek);
    weeklyTargetTextByGoal = new Map(
      ((targetsData as GoalWeeklyTarget[]) ?? []).map((t) => [t.goal_id, t.target_text])
    );
  }

  const existingScore = scoreByWeek.get(currentWeek);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-gold">Week {currentWeek} of 12</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Scorecard</h1>

      <div className="mt-8 border border-sand bg-white/60 p-6 text-center">
        <p className="eyebrow text-navy/40">Execution This Week</p>
        <p className="mt-2 font-display text-6xl font-semibold text-navy">{executionPct}%</p>
        <p className="mt-1 text-xs text-navy/40">Target: 85%</p>
      </div>

      <div className="mt-8">
        <p className="eyebrow text-gold">This Week&apos;s Metrics</p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {metricRows.map((r) => (
            <div key={r.metric} className="py-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-navy">{METRIC_LABELS[r.metric]}</span>
                <span className="text-navy/60">
                  {r.done} / {r.target}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-sand">
                <div
                  className={`h-1.5 ${r.pct >= 100 ? "bg-blue" : "bg-gold"}`}
                  style={{ width: `${Math.min(r.pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
          {metricRows.length === 0 && <p className="py-6 text-sm text-navy/50">No weekly targets set for this week.</p>}
        </div>
      </div>

      <div className="mt-10">
        <p className="eyebrow text-gold">12-Week Execution</p>
        <div className="mt-4 flex h-24 items-end gap-2">
          {sparkline.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end bg-sand/50">
                {w.pct !== null && (
                  <div
                    className={`w-full ${w.week === currentWeek ? "bg-gold" : "bg-navy/40"}`}
                    style={{ height: `${Math.min(w.pct, 100)}%` }}
                  />
                )}
              </div>
              <span className="text-[10px] text-navy/40">{w.week}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <p className="eyebrow text-gold">Season Lag</p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand text-sm">
          <div className="flex items-baseline justify-between py-3">
            <span className="text-navy">AWL Hats Sold</span>
            <span className="text-navy/60">{hatsTotal} / 100</span>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <span className="text-navy">Commissions ($ closed + under contract)</span>
            <span className="text-navy/60">
              {formatMetricValue("dollars_closed", dollarsClosed + dollarsUnderContract)} / $40,000
            </span>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <span className="text-navy">Weight</span>
            <span className="text-navy/60">
              {latestWeight !== null ? formatMetricValue("weight_lbs", latestWeight) : "—"} / 175 lbs
            </span>
          </div>
        </div>

        <table className="mt-4 w-full text-left text-xs">
          <thead className="text-navy/40">
            <tr>
              <th className="py-1.5 font-medium">Checkpoint</th>
              <th className="py-1.5 font-medium">Weight</th>
              <th className="py-1.5 font-medium">Pushups</th>
              <th className="py-1.5 font-medium">Pull-ups</th>
              <th className="py-1.5 font-medium">5K</th>
            </tr>
          </thead>
          <tbody className="text-navy/70">
            {CHECKPOINTS.map((c) => (
              <tr key={c.week} className={c.week === currentWeek ? "font-semibold text-navy" : ""}>
                <td className="py-1.5">Week {c.week}</td>
                <td className="py-1.5">{c.weight} lbs</td>
                <td className="py-1.5">{c.pushups}</td>
                <td className="py-1.5">{c.pullups}</td>
                <td className="py-1.5">{formatMetricValue("run_5k_seconds", c.run5k)}</td>
              </tr>
            ))}
            <tr className="border-t border-sand text-navy">
              <td className="py-1.5 font-medium">Latest</td>
              <td className="py-1.5">{latestWeight !== null ? `${latestWeight} lbs` : "—"}</td>
              <td className="py-1.5">{latestPushups ?? "—"}</td>
              <td className="py-1.5">{latestPullups ?? "—"}</td>
              <td className="py-1.5">{latest5k !== null ? formatMetricValue("run_5k_seconds", latest5k) : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {goals.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow text-gold">This Week&apos;s Goal Targets</p>
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {goals.map((g) => (
              <div key={g.id} className="py-3">
                <p className="font-medium text-navy">{g.title}</p>
                <p className="mt-1 text-sm text-navy/70">
                  {weeklyTargetTextByGoal.get(g.id) || "No target set for this week yet."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFriday && (
        <div className="mt-10 border border-gold/40 bg-gold/5 p-6">
          <p className="eyebrow text-gold">Score the Week</p>
          {existingScore ? (
            <p className="mt-2 text-sm text-navy/70">
              Already scored: <b>{existingScore.execution_pct}%</b>
              {existingScore.notes ? ` — ${existingScore.notes}` : ""}
            </p>
          ) : (
            <form action={scoreWeek} className="mt-3 flex flex-col gap-3">
              <input type="hidden" name="week_number" value={currentWeek} />
              <input type="hidden" name="execution_pct" value={executionPct} />
              <p className="text-sm text-navy/70">
                Snapshot this week at <b>{executionPct}%</b>.
              </p>
              <textarea name="notes" rows={2} placeholder="Lessons from the week…" className={textarea} />
              <SubmitButton className={`self-start ${btnPrimary}`} pendingLabel="Saving…">
                Score This Week
              </SubmitButton>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
