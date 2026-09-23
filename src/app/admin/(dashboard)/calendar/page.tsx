import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client, DealCompany } from "@/lib/types";

export const revalidate = 0;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarItem = {
  id: string;
  name: string;
  date: string;
  kind: "client" | "deal";
  href: string;
};

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
function monthEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}
function addMonths(date: Date, delta: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
}
function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}
function monthGrid(anchor: Date) {
  const start = monthStart(anchor);
  const end = monthEnd(anchor);
  const gridStart = new Date(start);
  gridStart.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const gridEnd = new Date(end);
  gridEnd.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export default async function AdminCalendarPage({
  searchParams,
}: PageProps<"/admin/calendar">) {
  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;
  const today = new Date();
  const anchor = monthParam
    ? monthStart(new Date(`${monthParam}-01T00:00:00.000Z`))
    : monthStart(today);

  const rangeStart = toIso(monthStart(anchor));
  const rangeEnd = toIso(monthEnd(anchor));
  const todayIso = toIso(today);

  const supabase = await createClient();
  const [{ data: clientsData }, { data: dealsData }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, next_follow_up_date")
      .gte("next_follow_up_date", rangeStart)
      .lte("next_follow_up_date", rangeEnd),
    supabase
      .from("deal_companies")
      .select("id, name, next_action_date")
      .gte("next_action_date", rangeStart)
      .lte("next_action_date", rangeEnd),
  ]);

  const items: CalendarItem[] = [
    ...(
      (clientsData as Pick<Client, "id" | "name" | "next_follow_up_date">[]) ?? []
    ).map((c) => ({
      id: c.id,
      name: c.name,
      date: c.next_follow_up_date as string,
      kind: "client" as const,
      href: `/admin/clients/${c.id}/edit`,
    })),
    ...(
      (dealsData as Pick<DealCompany, "id" | "name" | "next_action_date">[]) ?? []
    ).map((d) => ({
      id: d.id,
      name: d.name,
      date: d.next_action_date as string,
      kind: "deal" as const,
      href: `/admin/deals/${d.id}/edit`,
    })),
  ];

  const itemsByDate = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const existing = itemsByDate.get(item.date) ?? [];
    existing.push(item);
    itemsByDate.set(item.date, existing);
  }

  const gridDays = monthGrid(anchor);
  const monthLabel = anchor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function monthHref(delta: number) {
    const target = addMonths(anchor, delta);
    const y = target.getUTCFullYear();
    const m = String(target.getUTCMonth() + 1).padStart(2, "0");
    return `/admin/calendar?month=${y}-${m}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Calendar</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Follow-Up Calendar
          </h1>
          <p className="mt-2 text-navy/60">
            Clients and deal companies by their next follow-up/action date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={monthHref(-1)}
            className="border border-navy/20 px-3 py-1.5 text-sm text-navy/70 hover:bg-navy hover:text-cream"
          >
            &larr; Prev
          </Link>
          <p className="font-display text-lg font-semibold text-navy">{monthLabel}</p>
          <Link
            href={monthHref(1)}
            className="border border-navy/20 px-3 py-1.5 text-sm text-navy/70 hover:bg-navy hover:text-cream"
          >
            Next &rarr;
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-1 border-t border-sand pt-4 sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="eyebrow text-center text-navy/40">
            {label}
          </p>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
        {gridDays.map((day) => {
          const iso = toIso(day);
          const inMonth = day.getUTCMonth() === anchor.getUTCMonth();
          const chips = itemsByDate.get(iso) ?? [];
          const isToday = iso === todayIso;
          return (
            <div
              key={iso}
              className={`min-h-[100px] border p-1.5 sm:p-2 ${
                isToday ? "border-blue bg-blue/5" : "border-sand"
              } ${inMonth ? "" : "bg-sand/20"}`}
            >
              <p
                className={`eyebrow ${
                  inMonth ? "text-navy/60" : "text-navy/25"
                } ${isToday ? "text-blue" : ""}`}
              >
                {day.getUTCDate()}
              </p>
              <div className="mt-1 flex flex-col gap-1">
                {chips.slice(0, 3).map((item) => (
                  <Link
                    key={`${item.kind}-${item.id}`}
                    href={item.href}
                    title={item.name}
                    className={`truncate rounded-full px-2 py-0.5 text-[11px] ${
                      item.kind === "client"
                        ? "bg-blue/10 text-blue"
                        : "bg-gold/10 text-gold"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {chips.length > 3 && (
                  <p className="text-[11px] text-navy/40">+{chips.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 text-xs text-navy/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue/40" /> Client
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold/40" /> Deal
        </span>
      </div>
    </div>
  );
}
