import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GoalForm from "@/components/admin/goal-form";
import { btnPrimary, input } from "@/components/admin/ui";
import { currentWeekNumber } from "@/lib/format";
import type { Goal, GoalDailyCheck, GoalWeeklyTarget } from "@/lib/types";
import { toggleDailyCheck, upsertWeeklyTargets } from "../../actions";

export const revalidate = 0;

export default async function EditGoalPage({
  params,
}: PageProps<"/admin/goals/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: goalData }, { data: targetsData }, { data: checkData }] =
    await Promise.all([
      supabase.from("goals").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("goal_weekly_targets")
        .select("*")
        .eq("goal_id", id)
        .order("week_number", { ascending: true }),
      supabase
        .from("goal_daily_checks")
        .select("*")
        .eq("goal_id", id)
        .eq("check_date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
    ]);

  const goal = goalData as Goal | null;
  if (!goal) notFound();

  const targets = (targetsData as GoalWeeklyTarget[]) ?? [];
  const targetByWeek = new Map(targets.map((t) => [t.week_number, t.target_text]));
  const todayCheck = checkData as GoalDailyCheck | null;
  const today = new Date().toISOString().slice(0, 10);
  const activeWeek = currentWeekNumber(goal.period_start);

  return (
    <div>
      <p className="eyebrow text-gold">Goals</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        {goal.title}
      </h1>

      <div className="mt-8">
        <GoalForm goal={goal} />
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Today</p>
        <form action={toggleDailyCheck} className="mt-4 flex items-center gap-3">
          <input type="hidden" name="goal_id" value={goal.id} />
          <input type="hidden" name="check_date" value={today} />
          <input
            type="hidden"
            name="completed"
            value={todayCheck?.completed ? "false" : "true"}
          />
          <button
            type="submit"
            className={
              todayCheck?.completed
                ? "border border-blue bg-blue px-5 py-2.5 text-sm font-medium text-cream"
                : "border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy/70 hover:border-navy hover:text-navy"
            }
          >
            {todayCheck?.completed ? "✓ Done today" : "Mark done today"}
          </button>
          <span className="text-sm text-navy/50">
            Week {activeWeek} of 12
          </span>
        </form>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Weekly Targets</p>
        <p className="mt-2 text-xs text-navy/50">
          What &quot;on track&quot; looks like each week. Leave a week blank
          if you haven&apos;t planned it yet.
        </p>

        <form action={upsertWeeklyTargets} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="goal_id" value={goal.id} />
          {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
            <div
              key={week}
              className={`grid grid-cols-[80px_1fr] items-center gap-3 ${
                week === activeWeek ? "bg-gold/10 p-2" : ""
              }`}
            >
              <label className="eyebrow text-navy/50">
                Week {week}
                {week === activeWeek && (
                  <span className="ml-1 text-gold">&bull; now</span>
                )}
              </label>
              <input
                name={`week_${week}`}
                defaultValue={targetByWeek.get(week) ?? ""}
                placeholder="What does on-track look like this week?"
                className={input}
              />
            </div>
          ))}
          <button type="submit" className={`mt-2 self-start ${btnPrimary}`}>
            Save Weekly Targets
          </button>
        </form>
      </div>
    </div>
  );
}
