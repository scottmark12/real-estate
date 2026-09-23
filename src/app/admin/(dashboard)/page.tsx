import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, input } from "@/components/admin/ui";
import { currentWeekNumber } from "@/lib/format";
import type {
  Client,
  DealCompany,
  Goal,
  GoalDailyCheck,
  GoalWeeklyTarget,
  Todo,
} from "@/lib/types";
import { addTodo, deleteTodo, toggleTodo } from "./actions";

export const revalidate = 0;

type CallQueueItem = {
  id: string;
  name: string;
  sub: string;
  date: string;
  kind: "client" | "deal";
  href: string;
};

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

  const [
    { data: todayTodosData },
    { data: goalsData },
    { data: dueClientsData },
    { data: dueDealsData },
    { data: researchQueueData },
    { count: listingCount },
    { count: articleCount },
    { count: subCount },
    { count: clientCount },
    { count: leadCount },
    { count: dealCount },
  ] = await Promise.all([
    supabase.from("todos").select("*").eq("scheduled_date", todayIso),
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
    supabase
      .from("deal_companies")
      .select("*")
      .in("pipeline_stage", ["sourced", "researching"])
      .order("heat_score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(8),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("deal_companies").select("*", { count: "exact", head: true }),
  ]);

  const todayTodos = (todayTodosData as Todo[]) ?? [];
  const goals = (goalsData as Goal[]) ?? [];
  const goalTitleById = new Map(goals.map((g) => [g.id, g.title]));

  const dueClients = (dueClientsData as Client[]) ?? [];
  const dueDeals = (dueDealsData as DealCompany[]) ?? [];
  const researchQueue = (researchQueueData as DealCompany[]) ?? [];
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

  // Auto-fill today's list with each active goal's current weekly target —
  // one per goal, created once per day (skipped if a todo for that
  // goal+day already exists), so the list is ready without having to
  // build it by hand.
  const existingGoalIds = new Set(todayTodos.filter((t) => t.goal_id).map((t) => t.goal_id));
  const todosToCreate = goals
    .filter((g) => weeklyTargets.has(g.id) && !existingGoalIds.has(g.id))
    .map((g) => ({
      title: weeklyTargets.get(g.id) as string,
      goal_id: g.id,
      scheduled_date: todayIso,
      status: "pending" as const,
    }));

  if (todosToCreate.length > 0) {
    const { data: created } = await supabase.from("todos").insert(todosToCreate).select("*");
    if (created) todayTodos.push(...(created as Todo[]));
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily To-Do — auto-filled with today's slice of each goal's
          weekly target (see the insert above), plus anything added by
          hand below. */}
      <div className="mt-10 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Daily To-Do</p>
        <p className="mt-2 text-xs text-navy/50">
          Auto-filled from this week&apos;s goal targets — add anything else below.
        </p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {todayTodos.map((t) => {
            const goalTitle = t.goal_id ? goalTitleById.get(t.goal_id) : null;
            return (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <form action={toggleTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={t.status === "done" ? "false" : "true"} />
                  <button
                    type="submit"
                    className={`h-4 w-4 shrink-0 border ${
                      t.status === "done" ? "border-blue bg-blue" : "border-navy/30"
                    }`}
                    aria-label="Toggle done"
                  />
                </form>
                <div className="flex-1">
                  <span className={`text-sm ${t.status === "done" ? "text-navy/30 line-through" : "text-navy"}`}>
                    {t.title}
                  </span>
                  {goalTitle && <span className="ml-2 text-xs text-navy/40">— {goalTitle}</span>}
                </div>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="text-xs text-navy/30 hover:text-red-600">
                    &times;
                  </button>
                </form>
              </div>
            );
          })}
          {todayTodos.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">Nothing on today&apos;s list yet.</p>
          )}
        </div>
        <form action={addTodo} className="mt-4 flex gap-2">
          <input type="hidden" name="scheduled_date" value={todayIso} />
          <input name="title" placeholder="Add something else to today&hellip;" className={`${input} mt-0 flex-1`} />
          <button type="submit" className={btnPrimary}>
            Add
          </button>
        </form>
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

      {/* Focus — click into one job at a time. Each card is a queue front
          door: a short preview here, the full tunnel-vision, one-record
          flow at its own route. */}
      <div className="mt-10 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Focus</p>
        <p className="mt-2 text-xs text-navy/50">
          Pick a job and go tunnel vision — one record at a time, with what you need to log it.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="border border-sand bg-white/60 p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-medium text-navy">Call Queue</p>
              <span className="eyebrow text-navy/40">{callQueue.length}</span>
            </div>
            <p className="mt-1 text-xs text-navy/50">Due or overdue follow-ups.</p>
            <div className="mt-3 flex flex-col divide-y divide-sand">
              {callQueue.slice(0, 4).map((item) => (
                <div key={`${item.kind}-${item.id}`} className="py-2">
                  <p className="text-sm text-navy">{item.name}</p>
                  <p className="text-xs text-navy/50">{item.sub}</p>
                </div>
              ))}
              {callQueue.length === 0 && (
                <p className="py-2 text-sm text-navy/40">Nothing due — you&apos;re caught up.</p>
              )}
            </div>
            <Link
              href="/admin/calls"
              className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Start Calling &rarr;
            </Link>
          </div>

          <div className="border border-sand bg-white/60 p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-medium text-navy">Research Queue</p>
              <span className="eyebrow text-navy/40">{researchQueue.length}</span>
            </div>
            <p className="mt-1 text-xs text-navy/50">Deals still Sourced or Researching.</p>
            <div className="mt-3 flex flex-col divide-y divide-sand">
              {researchQueue.slice(0, 4).map((c) => (
                <div key={c.id} className="py-2">
                  <p className="text-sm text-navy">{c.name}</p>
                  <p className="text-xs capitalize text-navy/50">{c.pipeline_stage.replace("_", " ")}</p>
                </div>
              ))}
              {researchQueue.length === 0 && (
                <p className="py-2 text-sm text-navy/40">Nothing to research right now.</p>
              )}
            </div>
            <Link
              href="/admin/research"
              className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Start Researching &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
