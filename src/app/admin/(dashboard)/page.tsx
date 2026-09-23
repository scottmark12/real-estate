import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, btnSecondary, input, label, select } from "@/components/admin/ui";
import { currentWeekNumber } from "@/lib/format";
import type {
  Client,
  DealCompany,
  Goal,
  GoalDailyCheck,
  GoalWeeklyTarget,
  ScheduleBlock,
  Todo,
} from "@/lib/types";
import {
  addTodo,
  assignTodo,
  deleteScheduleBlock,
  deleteTodo,
  toggleTodo,
  upsertScheduleBlock,
} from "./actions";

export const revalidate = 0;

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type CallQueueItem = {
  id: string;
  name: string;
  sub: string;
  date: string;
  kind: "client" | "deal";
  href: string;
};

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

export default async function AdminHomePage() {
  const supabase = await createClient();
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay();
  const isMonday = dayOfWeek === 1;

  const [
    { data: allBlocksData },
    { data: todayTodosData },
    { data: backlogTodosData },
    { data: goalsData },
    { data: dueClientsData },
    { data: dueDealsData },
    { count: listingCount },
    { count: articleCount },
    { count: subCount },
    { count: clientCount },
    { count: leadCount },
    { count: dealCount },
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
    supabase
      .from("goals")
      .select("*")
      .lte("period_start", todayIso)
      .gte("period_end", todayIso)
      .order("sort_order", { ascending: true }),
    supabase
      .from("clients")
      .select("*")
      .lte("next_follow_up_date", todayIso)
      .order("next_follow_up_date", { ascending: true })
      .limit(8),
    supabase
      .from("deal_companies")
      .select("*")
      .lte("next_action_date", todayIso)
      .order("next_action_date", { ascending: true })
      .limit(8),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("deal_companies").select("*", { count: "exact", head: true }),
  ]);

  const allBlocks = (allBlocksData as ScheduleBlock[]) ?? [];
  const todayBlocks = allBlocks.filter((b) => b.day_of_week === dayOfWeek);
  const todayTodos = (todayTodosData as Todo[]) ?? [];
  const backlogTodos = (backlogTodosData as Todo[]) ?? [];
  const goals = (goalsData as Goal[]) ?? [];

  const dueClients = (dueClientsData as Client[]) ?? [];
  const dueDeals = (dueDealsData as DealCompany[]) ?? [];
  const callQueue: CallQueueItem[] = [
    ...dueClients.map((c) => ({
      id: c.id,
      name: c.name,
      sub: c.timeline || "No timeline set",
      date: c.next_follow_up_date as string,
      kind: "client" as const,
      href: `/admin/clients/${c.id}/edit`,
    })),
    ...dueDeals.map((d) => ({
      id: d.id,
      name: d.name,
      sub: d.next_action_type || "No next-action type set",
      date: d.next_action_date as string,
      kind: "deal" as const,
      href: `/admin/deals/${d.id}/edit`,
    })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

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
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Good morning, Mark.</h1>

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

      {/* Business at a glance — reference, not action. */}
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-sand pt-8 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <p className="font-display text-4xl font-normal text-navy">{clientCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Clients</p>
          <Link href="/admin/clients" className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4">
            Manage &rarr;
          </Link>
        </div>
        <div>
          <p className="font-display text-4xl font-normal text-navy">{leadCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Leads</p>
          <Link href="/admin/leads" className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4">
            Review &rarr;
          </Link>
        </div>
        <div>
          <p className="font-display text-4xl font-normal text-navy">{dealCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Deals</p>
          <Link href="/admin/deals" className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4">
            Manage &rarr;
          </Link>
        </div>
        <div>
          <p className="font-display text-4xl font-normal text-navy">{listingCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Listings</p>
          <Link href="/admin/listings" className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4">
            Manage &rarr;
          </Link>
        </div>
        <div>
          <p className="font-display text-4xl font-normal text-navy">{articleCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Articles</p>
          <Link href="/admin/articles" className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4">
            Manage &rarr;
          </Link>
        </div>
        <div>
          <p className="font-display text-4xl font-normal text-navy">{subCount ?? 0}</p>
          <p className="eyebrow mt-2 text-navy/50">Newsletter Subscribers</p>
        </div>
      </div>

      {/* Calls — the first action of the day. */}
      <div className="mt-10 border-t border-sand pt-8">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-gold">Call Today</p>
          <Link
            href="/admin/calls"
            className="eyebrow text-navy/40 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
          >
            Start the Call Center &rarr;
          </Link>
        </div>
        <p className="mt-2 text-xs text-navy/50">
          Clients and deal companies whose next follow-up/action is due today or overdue.
        </p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {callQueue.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="flex items-center justify-between gap-4 py-4 hover:bg-sand/20"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-navy">{item.name}</p>
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      item.kind === "client" ? "border-blue/40 text-blue" : "border-gold/40 text-gold"
                    }`}
                  >
                    {item.kind === "client" ? "Client" : "Deal"}
                  </span>
                </div>
                <p className="text-sm text-navy/50">{item.sub}</p>
              </div>
              <p className="font-semibold text-red-600">{item.date}</p>
            </Link>
          ))}
          {callQueue.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">Nothing due — you&apos;re caught up.</p>
          )}
        </div>
      </div>

      {isMonday && (
        <div className="mt-10 border border-gold/40 bg-gold/5 p-6">
          <p className="eyebrow text-gold">Plan Your Week</p>
          <p className="mt-2 text-sm text-navy/60">
            {backlogTodos.length} unscheduled to-do{backlogTodos.length === 1 ? "" : "s"} to slot in this week.
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

      {/* The block schedule — what to actually do after calls. */}
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

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Weekly Template</p>
        <p className="mt-2 text-xs text-navy/50">
          Set your recurring work blocks once — Today&apos;s Schedule pulls from whatever&apos;s here for each day.
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
