"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
      setMessage("Thanks for reaching out — Mark will be in touch soon.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-xl border border-navy/10 bg-white/60 p-6 text-navy">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-lg border border-navy/15 bg-white/70 px-4 py-3 text-sm focus:border-navy focus:outline-none"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          className="rounded-lg border border-navy/15 bg-white/70 px-4 py-3 text-sm focus:border-navy focus:outline-none"
        />
      </div>
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="rounded-lg border border-navy/15 bg-white/70 px-4 py-3 text-sm focus:border-navy focus:outline-none"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can I help?"
        className="rounded-lg border border-navy/15 bg-white/70 px-4 py-3 text-sm focus:border-navy focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
    </form>
  );
}
