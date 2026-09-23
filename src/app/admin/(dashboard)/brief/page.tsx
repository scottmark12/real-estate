import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, btnSecondary, input, label, select } from "@/components/admin/ui";
import { currentWeekNumber } from "@/lib/format";
import type { Goal, GoalDailyCheck, GoalWeeklyTarget, MarketRead, ScheduleBlock, Todo } from "@/lib/types";
import {
  addTodo,
  assignTodo,
  deleteScheduleBlock,
  deleteTodo,
  refreshMarketReads,
  toggleTodo,
  upsertScheduleBlock,
} from "./actions";

export const revalidate = 0;

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminBriefPage() {
  const supabase = await createClient();
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay();
  const isMonday = dayOfWeek === 1;

  const [
    { data: allBlocksData },
    { data: todayTodosData },
    { data: backlogTodosData },
    { count: clientsDueCount },
    { count: dealsDueCount },
    { data: goalsData },
    { data: marketReadsData },
  ] = await Promise.all([
    supabase.from("schedule_blocks").select("*").order("day_of_week").order("start_time"),
    supabase.from("todos").select("*").eq("scheduled_date", todayIso),
    supabase
      .from("todos")
      .select("*")
      .is("scheduled_date", null)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(15),
    supabase.from("clients").select("id", { count: "exact", head: true }).lte("next_follow_up_date", todayIso),
    supabase.from("deal_companies").select("id", { count: "exact", head: true }).lte("next_action_date", todayIso),
    supabase
      .from("goals")
      .select("*")
      .lte("period_start", todayIso)
      .gte("period_end", todayIso)
      .order("sort_order", { ascending: true }),
    supabase.from("market_reads").select("*").order("published_at", { ascending: false }).limit(30),
  ]);

  const allBlocks = (allBlocksData as ScheduleBlock[]) ?? [];
  const todayBlocks = allBlocks.filter((b) => b.day_of_week === dayOfWeek);
  const todayTodos = (todayTodosData as Todo[]) ?? [];
  const backlogTodos = (backlogTodosData as Todo[]) ?? [];
  const totalDue = (clientsDueCount ?? 0) + (dealsDueCount ?? 0);
  const goals = (goalsData as Goal[]) ?? [];
  const allMarketReads = (marketReadsData as MarketRead[]) ?? [];
  // Rates/San Diego are Mark's specific interests — give them their own
  // section instead of letting higher-volume national CRE news bury them
  // in a single "latest N" list.
  const spotlightReads = allMarketReads
    .filter((a) => a.theme === "rates" || a.theme === "san_diego")
    .slice(0, 4);
  const marketReads = allMarketReads
    .filter((a) => a.theme !== "rates" && a.theme !== "san_diego")
    .slice(0, 6);

  const todosByBlock = new Map<string, Todo[]>();
  const unassignedToday: Todo[] = [];
  for (const t of todayTodos) {
    if (t.assigned_block_id) {
      const list = todosByBlock.get(t.assigned_block_id) ?? [];
      list.push(t);
      todosByBlock.set(t.assigned_block_id, list);
    } else {
      unassignedToday.push(t);
    }
  }

  let weeklyTargets = new Map<string, string>();
  const scoreCard = new Map<string, { done: number; total: number }>();
  if (goals.length > 0) {
    const goalIds = goals.map((g) => g.id);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoIso = weekAgo.toISOString().slice(0, 10);

    const [{ data: targetsData }, { data: checksData }] = await Promise.all([
      supabase.from("goal_weekly_targets").select("*").in("goal_id", goalIds),
      supabase
        .from("goal_daily_checks")
        .select("*")
        .in("goal_id", goalIds)
        .gte("check_date", weekAgoIso)
        .lte("check_date", todayIso),
    ]);

    const targets = (targetsData as GoalWeeklyTarget[]) ?? [];
    weeklyTargets = new Map(
      targets
        .filter(
          (t) =>
            t.week_number ===
            currentWeekNumber(goals.find((g) => g.id === t.goal_id)?.period_start ?? todayIso)
        )
        .map((t) => [t.goal_id, t.target_text])
    );

    const checks = (checksData as GoalDailyCheck[]) ?? [];
    for (const goal of goals) {
      const goalChecks = checks.filter((c) => c.goal_id === goal.id);
      scoreCard.set(goal.id, {
        done: goalChecks.filter((c) => c.completed).length,
        total: 7,
      });
    }
  }

  const blocksByDay = new Map<number, ScheduleBlock[]>();
  for (const b of allBlocks) {
    const list = blocksByDay.get(b.day_of_week) ?? [];
    list.push(b);
    blocksByDay.set(b.day_of_week, list);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-gold">{formatToday()}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Today</h1>

      <div className="mt-8 border border-navy/10 bg-white/60 p-6">
        <p className="eyebrow text-navy/40">Your Day</p>
        <p className="mt-3 text-lg text-navy">
          {totalDue > 0 ? (
            <>
              <strong>{totalDue}</strong> {totalDue === 1 ? "call is" : "calls are"} due today.{" "}
              <Link href="/admin/calls" className="underline decoration-gold decoration-2 underline-offset-4">
                Start the Call Center &rarr;
              </Link>
            </>
          ) : (
            "Nothing is due in the call queue today."
          )}
        </p>
      </div>

      {isMonday && (
        <div className="mt-8 border border-gold/40 bg-gold/5 p-6">
          <p className="eyebrow text-gold">Plan Your Week</p>
          <p className="mt-2 text-sm text-navy/60">
            {backlogTodos.length} unscheduled to-do{backlogTodos.length === 1 ? "" : "s"} to slot in this
            week.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {WEEKDAY_LABELS.map((dayLabel, idx) => {
              const dayBlocks = blocksByDay.get(idx) ?? [];
              if (dayBlocks.length === 0) return null;
              return (
                <p key={idx} className="text-sm text-navy/70">
                  <span className="font-medium text-navy">{dayLabel}:</span>{" "}
                  {dayBlocks.map((b) => `${b.label} (${formatTime(b.start_time)}–${formatTime(b.end_time)})`).join(", ")}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className="eyebrow text-gold">Today&apos;s Schedule</p>
        <div className="mt-4 flex flex-col gap-4">
          {todayBlocks.map((block) => {
            const blockTodos = todosByBlock.get(block.id) ?? [];
            return (
              <div key={block.id} className="border border-sand bg-white/60 p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-medium text-navy">{block.label}</p>
                  <p className="eyebrow text-navy/40">
                    {formatTime(block.start_time)} – {formatTime(block.end_time)}
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {blockTodos.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <form action={toggleTodo}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="done" value={t.status === "done" ? "false" : "true"} />
                        <button
                          type="submit"
                          className={`h-4 w-4 border ${
                            t.status === "done" ? "border-blue bg-blue" : "border-navy/30"
                          }`}
                          aria-label="Toggle done"
                        />
                      </form>
                      <span className={`text-sm ${t.status === "done" ? "text-navy/30 line-through" : "text-navy"}`}>
                        {t.title}
                      </span>
                      <form action={deleteTodo} className="ml-auto">
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-xs text-navy/30 hover:text-red-600">
                          &times;
                        </button>
                      </form>
                    </div>
                  ))}
                  {blockTodos.length === 0 && (
                    <p className="text-sm text-navy/40">Nothing slotted in yet.</p>
                  )}
                </div>
                <form action={addTodo} className="mt-3 flex gap-2">
                  <input type="hidden" name="assigned_block_id" value={block.id} />
                  <input type="hidden" name="scheduled_date" value={todayIso} />
                  <input
                    name="title"
                    placeholder="Add a to-do to this block&hellip;"
                    className={`${input} mt-0 flex-1`}
                  />
                  <button type="submit" className={btnSecondary}>
                    Add
                  </button>
                </form>
              </div>
            );
          })}
          {todayBlocks.length === 0 && (
            <p className="text-navy/50">
              No blocks set for {WEEKDAY_LABELS[dayOfWeek]} yet — set them up below.
            </p>
          )}

          {unassignedToday.length > 0 && (
            <div className="border border-dashed border-navy/20 p-5">
              <p className="eyebrow text-navy/40">Also Today</p>
              <div className="mt-3 flex flex-col gap-2">
                {unassignedToday.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <form action={toggleTodo}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="done" value={t.status === "done" ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`h-4 w-4 border ${
                          t.status === "done" ? "border-blue bg-blue" : "border-navy/30"
                        }`}
                        aria-label="Toggle done"
                      />
                    </form>
                    <span className={`text-sm ${t.status === "done" ? "text-navy/30 line-through" : "text-navy"}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {backlogTodos.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow text-gold">Unscheduled</p>
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {backlogTodos.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="text-sm text-navy">{t.title}</span>
                <form action={assignTodo} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="date" name="scheduled_date" defaultValue={todayIso} className={`${input} mt-0 w-40`} />
                  <select name="assigned_block_id" defaultValue="" className={`${select} mt-0 w-40`}>
                    <option value="">No block</option>
                    {allBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {WEEKDAY_LABELS[b.day_of_week].slice(0, 3)} {formatTime(b.start_time)} — {b.label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={btnSecondary}>
                    Schedule
                  </button>
                </form>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="text-xs text-navy/30 hover:text-red-600">
                    &times;
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className="eyebrow text-gold">Add a To-do</p>
        <form action={addTodo} className="mt-4 flex gap-2">
          <input name="title" placeholder="What needs to happen?" className={`${input} mt-0 flex-1`} />
          <button type="submit" className={btnPrimary}>
            Add to Backlog
          </button>
        </form>
      </div>

      <div className="mt-10">
        <p className="eyebrow text-gold">This Week&apos;s Goals</p>
        {goals.length === 0 ? (
          <p className="mt-3 text-navy/50">
            No active goals right now.{" "}
            <Link href="/admin/goals/new" className="underline decoration-gold decoration-2 underline-offset-4">
              Set one up &rarr;
            </Link>
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {goals.map((g) => {
              const card = scoreCard.get(g.id);
              const target = weeklyTargets.get(g.id) ?? "";
              return (
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
                      {card ? ` · ${card.done}/${card.total} this week` : ""}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-navy/70">
                    {target || "No target set for this week yet."}
                  </p>
                  {target && (
                    <form action={addTodo} className="mt-2">
                      <input type="hidden" name="title" value={target} />
                      <input type="hidden" name="goal_id" value={g.id} />
                      <input type="hidden" name="scheduled_date" value={todayIso} />
                      <button type="submit" className="text-xs text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy">
                        + Add as today&apos;s to-do
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {spotlightReads.length > 0 && (
        <div className="mt-10 border border-blue/20 bg-blue/5 p-6">
          <p className="eyebrow text-blue">Rates &amp; San Diego</p>
          <div className="mt-3 flex flex-col divide-y divide-blue/10">
            {spotlightReads.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 hover:bg-white/40"
              >
                <p className="eyebrow text-navy/40">
                  {a.source} {a.theme === "rates" ? "· Rates" : "· San Diego"}
                </p>
                <p className="mt-1 font-medium text-navy">{a.title}</p>
                {a.summary && <p className="mt-1 text-sm text-navy/60">{a.summary}</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      {marketReads.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-gold">Reading</p>
            <form action={refreshMarketReads}>
              <button type="submit" className="eyebrow text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy">
                Refresh Articles
              </button>
            </form>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
            {marketReads.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 hover:bg-sand/20"
              >
                <p className="eyebrow text-navy/40">{a.source}</p>
                <p className="mt-1 font-medium text-navy">{a.title}</p>
                {a.summary && <p className="mt-1 text-sm text-navy/60">{a.summary}</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      {marketReads.length === 0 && spotlightReads.length === 0 && (
        <div className="mt-10 border border-dashed border-navy/20 p-6 text-center">
          <p className="text-navy/50">No articles pulled yet.</p>
          <form action={refreshMarketReads} className="mt-3">
            <button type="submit" className={btnSecondary}>
              Refresh Articles
            </button>
          </form>
        </div>
      )}

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Weekly Template</p>
        <p className="mt-2 text-xs text-navy/50">
          Set your recurring work blocks once — Today pulls from whatever&apos;s here for each day.
        </p>

        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {allBlocks.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 text-sm font-medium text-navy">{WEEKDAY_LABELS[b.day_of_week].slice(0, 3)}</span>
              <span className="text-sm text-navy/70">
                {formatTime(b.start_time)} – {formatTime(b.end_time)}
              </span>
              <span className="text-sm text-navy">{b.label}</span>
              <form action={deleteScheduleBlock} className="ml-auto">
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="text-xs text-navy/30 hover:text-red-600">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={upsertScheduleBlock} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className={label}>Day</label>
            <select name="day_of_week" defaultValue="1" className={select}>
              {WEEKDAY_LABELS.map((d, idx) => (
                <option key={idx} value={idx}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Start</label>
            <input type="time" name="start_time" required defaultValue="08:00" className={input} />
          </div>
          <div>
            <label className={label}>End</label>
            <input type="time" name="end_time" required defaultValue="11:00" className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>Label</label>
            <input name="label" required placeholder="Work Block" className={input} />
          </div>
          <button type="submit" className={btnSecondary}>
            Add Block
          </button>
        </form>
      </div>
    </div>
  );
}
