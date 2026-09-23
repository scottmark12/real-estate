import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, input, label } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { Bolded } from "@/components/admin/morning-brief-content";
import { METRIC_LABELS, metricsForBlock } from "@/lib/metrics";
import { toggleTodo } from "../actions";
import { logCheckpoint, logMetric, undoLastMetric } from "./actions";
import type { LeadLog, MetricKey, ScheduleBlock, Todo } from "@/lib/types";

export const revalidate = 0;

function blockName(label: string) {
  return label.split(":")[0].trim();
}
function blockDetail(label: string) {
  const idx = label.indexOf(":");
  return idx === -1 ? null : label.slice(idx + 1).trim();
}
function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
function isBlockNow(b: ScheduleBlock, nowHHMM: string) {
  return nowHHMM >= b.start_time.slice(0, 5) && nowHHMM < b.end_time.slice(0, 5);
}

function MetricCounter({ metric, count, logDate }: { metric: MetricKey; count: number; logDate: string }) {
  return (
    <div className="flex items-stretch border border-navy/20">
      <form action={logMetric}>
        <input type="hidden" name="metric" value={metric} />
        <input type="hidden" name="amount" value="1" />
        <input type="hidden" name="log_date" value={logDate} />
        <SubmitButton
          className="h-full px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-cream"
          pendingLabel="…"
        >
          +1 {METRIC_LABELS[metric]} <span className="ml-1 text-navy/40">({count})</span>
        </SubmitButton>
      </form>
      <form action={undoLastMetric}>
        <input type="hidden" name="metric" value={metric} />
        <input type="hidden" name="log_date" value={logDate} />
        <SubmitButton
          className="h-full border-l border-navy/20 px-3 py-2 text-sm text-navy/50 transition-colors hover:bg-red-600 hover:text-white"
          pendingLabel="…"
        >
          &minus;
        </SubmitButton>
      </form>
    </div>
  );
}

export default async function AdminTodayPage() {
  const supabase = await createClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const dayOfWeek = now.getDay();
  const nowHHMM = now.toTimeString().slice(0, 5);

  const [{ data: blocksData }, { data: todosData }, { data: logsData }, { data: dailyBriefData }] =
    await Promise.all([
      supabase.from("schedule_blocks").select("*").eq("day_of_week", dayOfWeek).order("start_time"),
      supabase.from("todos").select("*").eq("scheduled_date", todayIso),
      supabase.from("lead_logs").select("*").eq("log_date", todayIso),
      supabase.from("daily_briefs").select("day_plan").eq("brief_date", todayIso).maybeSingle(),
    ]);

  const blocks = (blocksData as ScheduleBlock[]) ?? [];
  const todos = (todosData as Todo[]) ?? [];
  const logs = (logsData as LeadLog[]) ?? [];
  const dayPlan = (dailyBriefData as { day_plan: string | null } | null)?.day_plan ?? null;

  const todosByBlock = new Map<string, Todo[]>();
  for (const t of todos) {
    if (!t.assigned_block_id) continue;
    const list = todosByBlock.get(t.assigned_block_id) ?? [];
    list.push(t);
    todosByBlock.set(t.assigned_block_id, list);
  }

  const countsByMetric = new Map<MetricKey, number>();
  for (const l of logs) {
    countsByMetric.set(l.metric, (countsByMetric.get(l.metric) ?? 0) + l.amount);
  }

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <p className="eyebrow text-gold">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">Today</h1>
      {dayPlan && (
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-navy/70">
          <Bolded text={dayPlan} />
        </p>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {blocks.map((b) => {
          const blockTodos = todosByBlock.get(b.id) ?? [];
          const metrics = metricsForBlock(b.label);
          const current = isBlockNow(b, nowHHMM);
          const detail = blockDetail(b.label);
          return (
            <div
              key={b.id}
              className={`border p-5 ${current ? "border-gold bg-gold/5" : "border-sand bg-white/60"}`}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-navy">{blockName(b.label)}</p>
                <p className="eyebrow text-navy/40">
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </p>
              </div>
              {detail && <p className="mt-1 text-sm text-navy/60">{detail}</p>}

              {blockTodos.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {blockTodos.map((t) => (
                    <form key={t.id} action={toggleTodo} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="done" value={t.status === "done" ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`h-4 w-4 shrink-0 border ${
                          t.status === "done" ? "border-blue bg-blue" : "border-navy/30"
                        }`}
                        aria-label="Toggle done"
                      />
                      <span className={`text-sm ${t.status === "done" ? "text-navy/30 line-through" : "text-navy"}`}>
                        {t.title}
                      </span>
                    </form>
                  ))}
                </div>
              )}

              {metrics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-sand pt-4">
                  {metrics.map((m) => (
                    <MetricCounter key={m} metric={m} count={countsByMetric.get(m) ?? 0} logDate={todayIso} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {blocks.length === 0 && (
          <p className="text-navy/50">
            No blocks set for today — set them up on the{" "}
            <Link href="/admin" className="underline decoration-gold decoration-2 underline-offset-4">
              Dashboard
            </Link>
            .
          </p>
        )}
      </div>

      <details className="mt-14 border-t border-sand pt-8">
        <summary className="eyebrow cursor-pointer text-gold">Log Results</summary>
        <form action={logCheckpoint} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="log_date" value={todayIso} />
          <div>
            <label className={label}>Weight (lbs)</label>
            <input type="number" step="0.1" name="weight_lbs" className={input} />
          </div>
          <div>
            <label className={label}>Max Pushups</label>
            <input type="number" name="pushups_max" className={input} />
          </div>
          <div>
            <label className={label}>Max Pull-ups</label>
            <input type="number" name="pullups_max" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>5K Minutes</label>
              <input type="number" name="run_5k_minutes" className={input} />
            </div>
            <div>
              <label className={label}>5K Seconds</label>
              <input type="number" name="run_5k_seconds_part" className={input} />
            </div>
          </div>
          <div>
            <label className={label}>$ Under Contract</label>
            <input type="number" name="dollars_under_contract" className={input} />
          </div>
          <div>
            <label className={label}>$ Closed</label>
            <input type="number" name="dollars_closed" className={input} />
          </div>
          <label className="flex items-center gap-2 text-sm text-navy sm:col-span-2">
            <input type="checkbox" name="protein_day" />
            Hit protein target today
          </label>
          <SubmitButton className={`self-start sm:col-span-2 ${btnPrimary}`} pendingLabel="Saving…">
            Save
          </SubmitButton>
        </form>
      </details>

      {countsByMetric.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-navy bg-cream/95 px-6 py-3 backdrop-blur sm:left-60">
          <div className="mx-auto flex max-w-2xl flex-wrap gap-x-5 gap-y-1 text-sm">
            {[...countsByMetric.entries()].map(([m, count]) => (
              <span key={m} className="text-navy">
                <b>{count}</b> <span className="text-navy/50">{METRIC_LABELS[m]}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
