import Link from "next/link";
import { Fraunces } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary } from "@/components/admin/ui";
import { Bolded, ResearchList, groupIntoSections } from "@/components/admin/morning-brief-content";
import { MarkMorningBriefRead } from "@/components/admin/mark-morning-brief-read";
import { currentWeekNumber } from "@/lib/format";
import { refreshMarketReads, toggleTodo } from "../actions";
import type {
  CalendarNote,
  DailyBrief,
  Goal,
  GoalWeeklyTarget,
  HeadlineItem,
  MarketRead,
  ScheduleBlock,
  Todo,
} from "@/lib/types";

export const revalidate = 0;

const fraunces = Fraunces({ subsets: ["latin"], weight: "600", style: "normal" });

const INK = "#2E2C27";
const SOFT = "#6B6A63";
const GREY = "#B4B3A8";
const HAIR = "#E4E3DC";

// Labels the other session's spec calls out as the "key" blocks of the
// day — matched against the part of the label before the colon
// ("Build the Pipeline: 60 dials..." -> "Build the Pipeline").
const KEY_BLOCK_NAMES = new Set(["Build the Pipeline", "MLS scan + offers", "Work the Pipeline", "Strategic Block"]);

function blockName(label: string) {
  return label.split(":")[0].trim();
}
function isKeyBlock(label: string) {
  return KEY_BLOCK_NAMES.has(blockName(label));
}

function formatDateLong(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function isBlockNow(b: ScheduleBlock, nowHHMM: string) {
  return nowHHMM >= b.start_time.slice(0, 5) && nowHHMM < b.end_time.slice(0, 5);
}

function CalendarNoteList({ notes }: { notes: CalendarNote[] }) {
  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {notes.map((n, i) => (
        <li key={i} className="grid grid-cols-[22px_1fr] gap-2">
          <span className="text-sm tabular-nums" style={{ color: GREY }}>
            {i + 1}
          </span>
          <div>
            {n.url ? (
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-semibold no-underline hover:underline" style={{ color: INK }}>
                {n.title}
              </a>
            ) : (
              <span className="font-semibold" style={{ color: INK }}>
                {n.title}
              </span>
            )}
            {n.detail && (
              <p className="m-0 mt-0.5 text-[14px]" style={{ color: SOFT }}>
                {n.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function HeadlineList({ items }: { items: HeadlineItem[] }) {
  return (
    <ol className="m-0 grid list-none gap-3 p-0">
      {items.map((h, i) => (
        <li key={i} className="grid grid-cols-[22px_1fr] gap-2">
          <span className="text-sm tabular-nums" style={{ color: GREY }}>
            {i + 1}
          </span>
          <div>
            <a href={h.url} target="_blank" rel="noopener noreferrer" className="font-semibold no-underline hover:underline" style={{ color: INK }}>
              {h.title}
            </a>
            <span className="ml-1.5 text-[13px]" style={{ color: GREY }}>
              {h.source}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function AdminBriefPage({ searchParams }: PageProps<"/admin/brief">) {
  const params = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const requestedDate = typeof params.date === "string" ? params.date : todayIso;

  let { data: dailyBriefData } = await supabase.from("daily_briefs").select("*").eq("brief_date", requestedDate).maybeSingle();
  let showingDate = requestedDate;
  let fallbackNote = false;

  if (!dailyBriefData && requestedDate === todayIso) {
    const { data: latest } = await supabase
      .from("daily_briefs")
      .select("*")
      .lt("brief_date", todayIso)
      .order("brief_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      dailyBriefData = latest;
      showingDate = (latest as DailyBrief).brief_date;
      fallbackNote = true;
    }
  }

  const dailyBrief = dailyBriefData as DailyBrief | null;
  const deepReport = dailyBrief?.deep_report ?? null;
  const needsAttention = (deepReport?.needs_attention ?? []).slice(0, 6);
  const resolved = (deepReport?.resolved ?? []).slice(0, 6);
  const headlines = (deepReport?.headlines ?? []).slice(0, 6);
  const dayOfWeek = new Date(`${showingDate}T00:00:00`).getDay();
  const isToday = showingDate === todayIso;
  const nowHHMM = now.toTimeString().slice(0, 5);

  const [{ data: marketReadsData }, { data: allBlocksData }, { data: dayTodosData }, { data: goalsData }] = await Promise.all([
    supabase.from("market_reads").select("*").eq("kept", true).order("published_at", { ascending: false }).limit(40),
    supabase.from("schedule_blocks").select("*").eq("day_of_week", dayOfWeek).order("start_time"),
    supabase.from("todos").select("*").eq("scheduled_date", showingDate),
    supabase.from("goals").select("*").lte("period_start", showingDate).gte("period_end", showingDate).order("sort_order"),
  ]);

  const reads = (marketReadsData as MarketRead[]) ?? [];
  const sections = groupIntoSections(reads);

  const dayBlocks = ((allBlocksData as ScheduleBlock[]) ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const dayTodos = (dayTodosData as Todo[]) ?? [];
  const todosByBlock = new Map<string, Todo[]>();
  for (const t of dayTodos) {
    if (!t.assigned_block_id) continue;
    const list = todosByBlock.get(t.assigned_block_id) ?? [];
    list.push(t);
    todosByBlock.set(t.assigned_block_id, list);
  }
  const showingDateObj = new Date(`${showingDate}T00:00:00`);
  const weekStart = addDays(showingDate, -showingDateObj.getDay());
  const weekEnd = addDays(weekStart, 6);
  const { data: weekTodosData } = await supabase
    .from("todos")
    .select("status")
    .gte("scheduled_date", weekStart)
    .lte("scheduled_date", weekEnd);
  const weekTodos = (weekTodosData as Pick<Todo, "status">[]) ?? [];
  const executionPct =
    weekTodos.length > 0 ? Math.round((weekTodos.filter((t) => t.status === "done").length / weekTodos.length) * 100) : null;

  const goals = (goalsData as Goal[]) ?? [];
  let weeklyTargets = new Map<string, string>();
  if (goals.length > 0) {
    const { data: targetsData } = await supabase.from("goal_weekly_targets").select("*").in(
      "goal_id",
      goals.map((g) => g.id)
    );
    const targets = (targetsData as GoalWeeklyTarget[]) ?? [];
    weeklyTargets = new Map(
      targets
        .filter((t) => t.week_number === currentWeekNumber(goals.find((g) => g.id === t.goal_id)?.period_start ?? showingDate))
        .map((t) => [t.goal_id, t.target_text])
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-[#FCFCFB] sm:-m-10">
      <MarkMorningBriefRead />

      <div className="border-b border-[#E1E1DF] bg-[#F9F9F7] px-6 py-11 sm:px-10">
        <div className="mx-auto max-w-[860px]">
          <div className="flex items-baseline justify-between">
            <Link href="/admin" className="text-[13px] underline decoration-[#B4B3A8] underline-offset-2" style={{ color: SOFT }}>
              &larr; Dashboard
            </Link>
            <div className="flex items-center gap-3 text-[13px]" style={{ color: SOFT }}>
              <Link href={`/admin/brief?date=${addDays(showingDate, -1)}`} className="underline decoration-[#B4B3A8] underline-offset-2">
                &larr; Prev
              </Link>
              {!isToday && (
                <Link href="/admin/brief" className="underline decoration-[#B4B3A8] underline-offset-2">
                  Today
                </Link>
              )}
              <Link href={`/admin/brief?date=${addDays(showingDate, 1)}`} className="underline decoration-[#B4B3A8] underline-offset-2">
                Next &rarr;
              </Link>
            </div>
          </div>

          <p className="mt-4 text-[13px]" style={{ color: SOFT }}>
            {formatDateLong(showingDate)}
            {fallbackNote && " — no brief yet today, showing the most recent one"}
          </p>
          <h1
            className={`${fraunces.className} mt-2 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[40px]`}
            style={{ color: INK }}
          >
            {dailyBrief?.headline ? <Bolded text={dailyBrief.headline} /> : "Good morning, Mark."}
          </h1>
          {dailyBrief?.day_plan && (
            <p className="mt-3 max-w-[70ch] text-[15px] leading-[1.7]" style={{ color: SOFT }}>
              <Bolded text={dailyBrief.day_plan} />
            </p>
          )}

          <form action={refreshMarketReads} className="mt-6">
            <button type="submit" className="text-[13px] underline decoration-[#B4B3A8] underline-offset-2" style={{ color: SOFT }}>
              Refresh Articles
            </button>
          </form>
        </div>
      </div>

      <div className="px-6 py-9 sm:px-10 sm:py-16">
        <div className="mx-auto flex max-w-[860px] flex-col gap-12">
          {needsAttention.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
                Needs Attention
              </h2>
              <CalendarNoteList notes={needsAttention} />
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
                Resolved
              </h2>
              <CalendarNoteList notes={resolved} />
            </div>
          )}

          {dayBlocks.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
                Today&apos;s Blocks
              </h2>
              <ul className="m-0 list-none border-t p-0" style={{ borderColor: HAIR }}>
                {dayBlocks.map((b) => {
                  const blockTodos = todosByBlock.get(b.id) ?? [];
                  const key = isKeyBlock(b.label);
                  const current = isToday && isBlockNow(b, nowHHMM);
                  return (
                    <li
                      key={b.id}
                      className="grid grid-cols-[84px_1fr] gap-3 border-b py-2.5"
                      style={{ borderColor: HAIR, background: current ? "#F3EFE3" : undefined }}
                    >
                      <span className="pt-0.5 text-[13px] tabular-nums" style={{ color: SOFT }}>
                        {formatTime(b.start_time)}
                      </span>
                      <div>
                        <span className={`text-[14px] ${key ? "font-bold" : "font-medium"}`} style={{ color: INK }}>
                          {b.label}
                        </span>
                        {blockTodos.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1">
                            {blockTodos.map((t) => (
                              <form key={t.id} action={toggleTodo} className="flex items-center gap-2">
                                <input type="hidden" name="id" value={t.id} />
                                <input type="hidden" name="done" value={t.status === "done" ? "false" : "true"} />
                                <button
                                  type="submit"
                                  className="h-3.5 w-3.5 shrink-0 border"
                                  style={{ borderColor: GREY, background: t.status === "done" ? INK : "transparent" }}
                                  aria-label="Toggle done"
                                />
                                <span
                                  className="text-[13px]"
                                  style={{ color: t.status === "done" ? GREY : SOFT, textDecoration: t.status === "done" ? "line-through" : "none" }}
                                >
                                  {t.title}
                                </span>
                              </form>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {headlines.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
                Headlines
              </h2>
              <HeadlineList items={headlines} />
            </div>
          )}

          <div>
            <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
              Research
            </h2>
            {reads.length === 0 ? (
              <div className="border border-dashed p-8 text-center" style={{ borderColor: HAIR }}>
                <p style={{ color: SOFT }}>No brief pulled yet today.</p>
                <form action={refreshMarketReads} className="mt-4">
                  <button type="submit" className={btnPrimary}>
                    Refresh Articles
                  </button>
                </form>
              </div>
            ) : (
              <ResearchList sections={sections} />
            )}
          </div>

          {goals.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold" style={{ color: INK }}>
                This Week
              </h2>
              <ul className="m-0 grid list-none grid-cols-1 gap-0 p-0 sm:grid-cols-2 sm:gap-x-7">
                {goals.map((g) => {
                  const target = weeklyTargets.get(g.id);
                  return (
                    <li key={g.id} className="flex items-baseline justify-between gap-3 border-b py-2" style={{ borderColor: HAIR }}>
                      <span className="text-[14px]" style={{ color: SOFT }}>
                        {g.title}
                        {target ? ` — ${target}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {executionPct !== null && (
                <p className="mt-2 text-[13px]" style={{ color: SOFT }}>
                  Execution this week: <b style={{ color: INK }}>{executionPct}%</b> (target 85%)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
