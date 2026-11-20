"use client";

import { useState, type FormEvent } from "react";

// The San Diego Market Letter signup: light, centered, editorial.
export default function NewsletterCta({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  const field =
    "w-full border-0 border-b border-navy/25 bg-transparent px-0 py-3 text-[15px] text-navy placeholder:text-[13px] placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-navy/55 focus:border-navy focus:outline-none";

  return (
    <section className={`bg-white px-6 py-20 text-center sm:px-10 lg:py-24 ${className}`}>
      <h2 className="font-georgia text-[38px] font-normal leading-[1.05] text-navy sm:text-[52px]">
        Know the Market <em className="italic">Before It Moves</em>
      </h2>
      <p className="mt-5 text-[13px] uppercase tracking-[0.22em] text-gold">
        The San Diego Market Letter &middot; One email a month
      </p>

      {status === "done" ? (
        <p className="mx-auto mt-12 max-w-xl font-georgia text-2xl text-navy">
          You&apos;re on the list. The next letter lands at the start of the month.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-12 grid max-w-4xl gap-6 text-left sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-8"
        >
          <label className="block">
            <span className="sr-only">Name</span>
            <input name="name" autoComplete="name" placeholder="Name" className={field} />
          </label>
          <label className="block">
            <span className="sr-only">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-ink px-12 py-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-blue disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {status !== "done" && (
        <p className="mx-auto mt-6 max-w-4xl text-left text-xs leading-relaxed tracking-wide text-navy/50 sm:text-center">
          By subscribing, you agree to receive the San Diego Market Letter from Mark Scott by email.
          No spam, and every email has a one click unsubscribe.
        </p>
      )}
    </section>
  );
}
