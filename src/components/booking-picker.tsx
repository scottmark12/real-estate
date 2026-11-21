"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Slot = { start: string; kind: "book" | "request" };

const TZ = "America/Los_Angeles";
const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...o }).format(new Date(iso));
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-navy/50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const CLOCK = "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z";
const PHONE = "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z";
const GLOBE = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18";
const CAL = "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z";

/** Calendly style booking card: date and time, then details, then done. */
export default function BookingPicker() {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [step, setStep] = useState<"pick" | "details" | "done">("pick");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ status: string; when: string } | null>(null);

  async function load() {
    const res = await fetch("/api/book", { cache: "no-store" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    const list: Slot[] = data?.slots ?? [];
    setSlots(list);
    if (list[0]) {
      const [y, m] = dayKey(list[0].start).split("-").map(Number);
      setMonth((cur) => cur ?? { y, m });
    }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), []);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const k = dayKey(s.start);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots]);

  const monthKeys = useMemo(() => {
    const set = new Set<string>();
    for (const k of byDay.keys()) set.add(k.slice(0, 7));
    return [...set].sort();
  }, [byDay]);

  const daySlots = day ? (byDay.get(day) ?? []) : [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: selected.start,
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        note: f.get("note"),
        website: f.get("website"),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSending(false);
    if (res?.ok && data?.ok) {
      setResult({ status: data.status, when: data.when });
      setStep("done");
    } else {
      setError(data?.error || "Something went wrong. Call or text (850) 363-6057.");
      if (res?.status === 409) {
        setSelected(null);
        setStep("pick");
        load();
      }
    }
  }

  const selectedLine = selected
    ? `${fmt(selected.start, { hour: "numeric", minute: "2-digit" })} to ${fmt(
        new Date(new Date(selected.start).getTime() + 15 * 60000).toISOString(),
        { hour: "numeric", minute: "2-digit" },
      )}, ${fmt(selected.start, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
    : null;

  // ---- Left panel: who and what ----
  const side = (
    <div className="border-b border-navy/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
      {step === "details" && (
        <button
          type="button"
          onClick={() => setStep("pick")}
          aria-label="Back"
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-blue hover:bg-blue/5"
        >
          &larr;
        </button>
      )}
      <Image
        src="/images/mark-headshot.jpeg"
        alt="Mark Scott"
        width={112}
        height={112}
        className="h-14 w-14 rounded-full object-cover"
      />
      <p className="mt-4 text-[15px] font-semibold text-navy/60">Mark Scott</p>
      <h1 className="mt-1 text-[26px] font-bold leading-tight text-navy">15 Minute Intro Call</h1>
      <ul className="mt-5 space-y-3 text-[15px] font-medium text-navy/70">
        <li className="flex items-center gap-3"><Icon d={CLOCK} />15 min</li>
        <li className="flex items-center gap-3"><Icon d={PHONE} />Phone call, Mark calls you</li>
        {selectedLine && step !== "pick" && (
          <li className="flex items-start gap-3 text-navy"><Icon d={CAL} />{selectedLine}</li>
        )}
        <li className="flex items-center gap-3"><Icon d={GLOBE} />Pacific Time (San Diego)</li>
      </ul>
      <p className="mt-6 text-[14px] leading-relaxed text-navy/60">
        Buying, selling, or just curious where the market&apos;s headed. Pick a
        time and I&apos;ll call you. No pressure.
      </p>
    </div>
  );

  let main: React.ReactNode;

  if (step === "done" && result) {
    const confirmed = result.status === "confirmed";
    main = (
      <div className="flex flex-col items-center p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white">&#10003;</div>
        <h2 className="mt-5 text-[22px] font-bold text-navy">
          {confirmed ? "You are scheduled" : "Request sent"}
        </h2>
        <p className="mt-2 text-navy/70">
          {confirmed
            ? "A calendar invitation has been sent to your email."
            : "Since it's short notice, Mark will text you to confirm."}
        </p>
        <div className="mt-6 w-full max-w-sm rounded-lg border border-navy/10 p-5 text-left text-[15px]">
          <p className="font-bold text-navy">15 Minute Intro Call</p>
          <p className="mt-3 flex items-start gap-3 text-navy/70"><Icon d={CAL} />{result.when} (Pacific)</p>
          <p className="mt-2 flex items-center gap-3 text-navy/70"><Icon d={PHONE} />Mark will call you</p>
        </div>
      </div>
    );
  } else if (step === "details" && selected) {
    const box =
      "mt-2 w-full rounded-md border border-navy/25 px-3 py-3 text-[16px] text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20";
    main = (
      <form onSubmit={onSubmit} className="p-6 sm:p-8">
        <h2 className="text-[20px] font-bold text-navy">Enter Details</h2>
        {selected.kind === "request" && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[14px] text-amber-900">
            This time is less than 24 hours away, so it&apos;s a request. Mark may
            not be free on short notice and will text you to confirm.
          </p>
        )}
        <label className="mt-6 block text-[14px] font-semibold text-navy">
          Name *
          <input name="name" required autoComplete="name" className={box} />
        </label>
        <label className="mt-5 block text-[14px] font-semibold text-navy">
          Email *
          <input name="email" type="email" required autoComplete="email" inputMode="email" className={box} />
        </label>
        <label className="mt-5 block text-[14px] font-semibold text-navy">
          Phone number *
          <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={box} />
        </label>
        <label className="mt-5 block text-[14px] font-semibold text-navy">
          Anything you&apos;d like Mark to know?
          <textarea name="note" rows={3} className={box} />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="mt-6 min-h-[48px] rounded-full bg-blue px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sending ? "Scheduling..." : selected.kind === "request" ? "Send Request" : "Schedule Event"}
        </button>
      </form>
    );
  } else {
    // ---- Pick a date and time ----
    let calendar: React.ReactNode = <p className="text-navy/50">Loading availability...</p>;
    if (slots && monthKeys.length === 0) {
      calendar = (
        <p className="text-navy/70">
          No open times right now. Call or text Mark at{" "}
          <a href="tel:+18503636057" className="text-blue underline">(850) 363-6057</a>.
        </p>
      );
    } else if (slots && month) {
      const { y, m } = month;
      const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
      const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const idx = monthKeys.indexOf(key);
      const go = (dir: number) => {
        const k = monthKeys[idx + dir];
        if (!k) return;
        const [ny, nm] = k.split("-").map(Number);
        setMonth({ y: ny, m: nm });
      };
      const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
      calendar = (
        <div>
          <div className="flex items-center justify-center gap-6">
            <button type="button" onClick={() => go(-1)} disabled={idx <= 0} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-full text-blue hover:bg-blue/10 disabled:text-navy/20 disabled:hover:bg-transparent">&lsaquo;</button>
            <p className="min-w-[150px] text-center text-[16px] text-navy">
              {new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            </p>
            <button type="button" onClick={() => go(1)} disabled={idx >= monthKeys.length - 1} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-full text-blue hover:bg-blue/10 disabled:text-navy/20 disabled:hover:bg-transparent">&rsaquo;</button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-medium text-navy/50">{w}</span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const k = `${key}-${String(d).padStart(2, "0")}`;
              const open = byDay.has(k);
              const active = day === k;
              return (
                <span key={k} className="flex justify-center">
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => {
                      setDay(k);
                      setSelected(null);
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-[15px] transition-colors ${
                      active
                        ? "bg-blue font-bold text-white"
                        : open
                          ? "bg-blue/10 font-bold text-blue hover:bg-blue/20"
                          : "text-navy/30"
                    }`}
                  >
                    {d}
                  </button>
                </span>
              );
            })}
          </div>
          <p className="mt-6 flex items-center gap-2 text-[13px] text-navy/60"><Icon d={GLOBE} />Pacific Time (San Diego)</p>
        </div>
      );
    }

    const times = day ? (
      <div className="lg:w-[220px] lg:shrink-0">
        <p className="text-[15px] text-navy">
          {fmt(daySlots[0]?.start ?? new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {daySlots.map((s) => {
            const isSel = selected?.start === s.start;
            const label = fmt(s.start, { hour: "numeric", minute: "2-digit" });
            return isSel ? (
              <div key={s.start} className="grid grid-cols-2 gap-2">
                <span className="flex min-h-[48px] items-center justify-center rounded-md bg-navy/60 text-[15px] font-semibold text-white">{label}</span>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="min-h-[48px] rounded-md bg-blue text-[15px] font-semibold text-white hover:opacity-90"
                >
                  Next
                </button>
              </div>
            ) : (
              <button
                key={s.start}
                type="button"
                onClick={() => setSelected(s)}
                className={`flex min-h-[48px] w-full flex-col items-center justify-center rounded-md border text-[15px] font-semibold text-blue transition-colors hover:border-blue hover:border-2 ${
                  s.kind === "request" ? "border-dashed border-blue/40" : "border-blue/40"
                }`}
              >
                {label}
                {s.kind === "request" && <span className="text-[10px] font-medium uppercase tracking-wider text-navy/50">Request</span>}
              </button>
            );
          })}
        </div>
        {daySlots.some((s) => s.kind === "request") && (
          <p className="mt-3 text-[12px] leading-snug text-navy/55">
            Requests are under 24 hours away. Mark may not be free on short
            notice and will text to confirm.
          </p>
        )}
      </div>
    ) : null;

    main = (
      <div className="p-6 sm:p-8">
        <h2 className="text-[20px] font-bold text-navy">Select a Date &amp; Time</h2>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">{calendar}</div>
          {times}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] lg:grid lg:grid-cols-[320px_1fr]">
      {side}
      {main}
    </div>
  );
}
