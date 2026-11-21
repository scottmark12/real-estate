"use client";

import { useState } from "react";
import ReplyNote from "@/components/reply-note";

const WHEN = ["This week", "This weekend", "Next week", "Just have questions"];

/**
 * One step tour request that sits right on the listing page, so a buyer
 * doesn't have to leave the home to reach Mark.
 */
export default function TourRequestForm({ address }: { address: string }) {
  const [when, setWhen] = useState(WHEN[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    const note = String(f.get("note") || "").trim();
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "tour",
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        intent: "Buying",
        context: address,
        website: f.get("website"),
        message: `Tour request for ${address}. When: ${when}.${note ? `\n\n${note}` : ""}`,
      }),
    }).catch(() => null);
    if (res?.ok) {
      setStatus("sent");
    } else {
      const data = await res?.json().catch(() => null);
      setError(data?.error || "Something went wrong. Call or text Mark instead.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 border border-navy/15 p-5">
        <p className="font-georgia text-2xl text-navy">Got it.</p>
        <p className="mt-2 text-sm text-navy/70">
          I&apos;ll reach out to set a time and pull the comps before we go.
        </p>
        <ReplyNote className="mt-4" text="Mark replies the same day." />
      </div>
    );
  }

  const field =
    "w-full border-b border-navy/25 bg-transparent py-3 text-[16px] text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none";

  return (
    <form id="tour" onSubmit={onSubmit} className="mt-6 scroll-mt-24">
      <p className="eyebrow text-navy/60">Tour this home</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="When">
        {WHEN.map((w) => (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={when === w}
            onClick={() => setWhen(w)}
            className={`min-h-[40px] border px-3 text-[13px] font-semibold transition-colors ${
              when === w ? "border-ink bg-ink text-white" : "border-navy/20 text-navy"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="tour-name">Name</label>
      <input id="tour-name" name="name" required autoComplete="name" placeholder="Name" className={`${field} mt-3`} />
      <label className="sr-only" htmlFor="tour-email">Email</label>
      <input id="tour-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Email" className={field} />
      <label className="sr-only" htmlFor="tour-phone">Phone</label>
      <input id="tour-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone (for a quick text)" className={field} />
      <label className="sr-only" htmlFor="tour-note">Anything else</label>
      <input id="tour-note" name="note" placeholder="Anything I should know? (optional)" className={field} />
      {/* Spam trap: hidden from people, bots fill it in. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 min-h-[50px] w-full bg-ink px-5 text-[15px] font-semibold text-white transition-colors hover:bg-blue disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Request a tour"}
      </button>
      <p className="mt-3 text-[11px] leading-relaxed text-navy/50">
        Free, no obligation. I represent you, not the seller.
      </p>
    </form>
  );
}
