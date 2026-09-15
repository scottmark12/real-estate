"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
      setMessage("Thanks — you're on the list.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return <p className="text-sm font-medium text-ink-cream">{message}</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="Your email address"
        className="w-full flex-1 border border-ink-cream/25 bg-transparent px-5 py-3 text-sm text-ink-cream placeholder:text-ink-cream/40 focus:border-ink-cream/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-ink-cream transition-colors hover:bg-blue-dark disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe →"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-300 sm:absolute sm:mt-12">{message}</p>
      )}
    </form>
  );
}
