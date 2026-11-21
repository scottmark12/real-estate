"use client";

import { useEffect, useMemo, useState } from "react";
import ReplyNote from "@/components/reply-note";

type Slot = { start: string; kind: "book" | "request" };

const TZ = "America/Los_Angeles";
const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...o }).format(new Date(iso));

export default function BookingPicker() {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ status: string; when: string } | null>(null);

  async function load() {
    const res = await fetch("/api/book", { cache: "no-store" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    const list: Slot[] = data?.slots ?? [];
    setSlots(list);
    setDay((d) => d ?? (list[0] ? dayKey(list[0].start) : null));
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), []);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const k = dayKey(s.start);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);
  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];
  const hasRequests = daySlots.some((s) => s.kind === "request");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!picked) return;
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: picked.start,
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        note: f.get("note"),
        website: f.get("website"),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.ok) {
      setDone({ status: data.status, when: data.when });
    } else {
      setError(data?.error || "Something went wrong. Call or text (850) 363-6057.");
      setStatus("error");
      if (res?.status === 409) {
        setPicked(null);
        load();
      }
    }
  }

  if (done) {
    const confirmed = done.status === "confirmed";
    return (
      <div className="border border-ink p-8">
        <p className="eyebrow text-gold">{confirmed ? "You're booked" : "Request sent"}</p>
        <p className="mt-3 font-georgia text-3xl leading-tight text-navy">{done.when}</p>
        <p className="mt-4 text-navy/75">
          {confirmed
            ? "A calendar invite is on its way to your email. I'll call you at the number you gave me."
            : "Since that's short notice, I'll text you to confirm if I'm free. If I can't make it, I'll offer the next open time."}
        </p>
        <ReplyNote className="mt-6" text="Talk soon. Mark" />
      </div>
    );
  }

  if (slots === null) {
    return <p className="text-navy/50">Loading open times...</p>;
  }
  if (days.length === 0) {
    return (
      <p className="text-navy/70">
        No open times right now. Call or text me at{" "}
        <a href="tel:+18503636057" className="underline">(850) 363-6057</a>.
      </p>
    );
  }

  const field =
    "w-full border-0 border-b border-navy/25 bg-transparent px-0 py-3 text-[16px] text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none";

  return (
    <div>
      <p className="eyebrow text-navy/60">Pick a day</p>
      <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {days.map(([k, list]) => {
          const active = k === day;
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setDay(k);
                setPicked(null);
              }}
              className={`min-h-[64px] min-w-[72px] shrink-0 border px-3 py-2 text-center transition-colors ${
                active ? "border-ink bg-ink text-white" : "border-navy/20 text-navy hover:border-navy"
              }`}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.15em]">
                {fmt(list[0].start, { weekday: "short" })}
              </span>
              <span className="mt-1 block font-georgia text-xl">{fmt(list[0].start, { day: "numeric" })}</span>
              <span className="block text-[11px] opacity-70">{fmt(list[0].start, { month: "short" })}</span>
            </button>
          );
        })}
      </div>

      <p className="eyebrow mt-8 text-navy/60">Pick a time (San Diego time)</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {daySlots.map((s) => {
          const active = picked?.start === s.start;
          const req = s.kind === "request";
          return (
            <button
              key={s.start}
              type="button"
              onClick={() => setPicked(s)}
              className={`min-h-[48px] border px-2 text-[14px] font-semibold transition-colors ${
                active
                  ? "border-ink bg-ink text-white"
                  : req
                    ? "border-dashed border-navy/30 text-navy/70 hover:border-navy"
                    : "border-navy/20 text-navy hover:border-navy"
              }`}
            >
              {fmt(s.start, { hour: "numeric", minute: "2-digit" })}
              {req && <span className="block text-[10px] font-normal uppercase tracking-wider">Request</span>}
            </button>
          );
        })}
      </div>
      {hasRequests && (
        <p className="mt-3 text-[13px] text-navy/60">
          Times marked Request are less than 24 hours out. I may not be free on
          short notice, so I&apos;ll text you to confirm.
        </p>
      )}

      {picked && (
        <form onSubmit={onSubmit} className="mt-10 border-t border-navy/15 pt-8">
          <p className="font-georgia text-2xl text-navy">
            {fmt(picked.start, { weekday: "long", month: "long", day: "numeric" })},{" "}
            {fmt(picked.start, { hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-sm text-navy/60">
            15 minute phone call{picked.kind === "request" ? " · request, I'll confirm by text" : ""}
          </p>
          <div className="mt-6 grid gap-x-6 sm:grid-cols-2">
            <input name="name" required autoComplete="name" placeholder="Name" aria-label="Name" className={field} />
            <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="Phone (I'll call you)" aria-label="Phone" className={field} />
            <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Email (for the invite)" aria-label="Email" className={`${field} sm:col-span-2`} />
            <input name="note" placeholder="What's on your mind? (optional)" aria-label="Note" className={`${field} sm:col-span-2`} />
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-8 min-h-[52px] w-full bg-ink px-6 text-[15px] font-semibold text-white transition-colors hover:bg-blue disabled:opacity-60 sm:w-auto"
          >
            {status === "sending" ? "Booking..." : picked.kind === "request" ? "Send request" : "Book the call"}
          </button>
        </form>
      )}
    </div>
  );
}
