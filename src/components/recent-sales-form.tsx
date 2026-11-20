"use client";

import ReplyNote from "@/components/reply-note";

import { useState, type FormEvent } from "react";

// "Get recent sales in X" — the lead capture on each neighborhood page.
// Goes through the same contact endpoint, so it lands in Leads and
// triggers the email and text alert.
export default function RecentSalesForm({ place }: { place: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          intent: "Buying",
          context: place,
          message: `Recent sales request: please send recent sales in ${place}.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <p className="text-navy">
        Got it. I&apos;ll send you what&apos;s sold in {place} recently.
      </p>
    );
  }

  const field =
    "w-full border border-sand bg-white px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input name="name" required placeholder="Your name" className={field} />
      <input name="email" type="email" required placeholder="Email" className={field} />
      <input name="phone" type="tel" placeholder="Phone (optional)" className={field} />
      <button
        type="submit"
        disabled={status === "loading"}
        className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : `Send Me ${place} Sales`}
      </button>
      {status === "error" && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
      <ReplyNote className="sm:col-span-2" text="Mark pulls these himself and sends them the same day." />
    </form>
  );
}
