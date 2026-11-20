"use client";

import { useState, type FormEvent } from "react";
import type { AlertParams } from "@/lib/listing-alerts";

// "Email me new homes like this" — saves the current search as an alert.
export default function SaveSearchForm({
  params,
  label,
  tone = "light",
}: {
  params: AlertParams;
  label: string;
  tone?: "light" | "dark";
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const dark = tone === "dark";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setStatus("loading");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, params }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ${
        dark ? "bg-ink text-white" : "border border-navy/10 bg-cream-deep"
      }`}
    >
      <div>
        <p className={`font-georgia text-[22px] leading-tight ${dark ? "text-white" : "text-navy"}`}>
          Get new listings first
        </p>
        <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-navy/60"}`}>
          {label}. New matches in your inbox each morning, nothing else.
        </p>
      </div>
      {status === "done" ? (
        <p className={`text-sm font-medium ${dark ? "text-white" : "text-navy"}`}>
          You&apos;re set. Watch your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={`alert-email-${label}`}>
            Email
          </label>
          <input
            id={`alert-email-${label}`}
            name="email"
            type="email"
            required
            placeholder="Your email"
            className="min-w-0 flex-1 border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-dark disabled:opacity-60"
          >
            {status === "loading" ? "Saving…" : "Email me new homes"}
          </button>
        </form>
      )}
      {status === "error" && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
