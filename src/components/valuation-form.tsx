"use client";

import { useState, type FormEvent } from "react";

export default function ValuationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const address = new FormData(form).get("address");

    setStatus("loading");
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
      setMessage("Thanks — Mark will follow up with your valuation shortly.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return <p className="text-sm font-medium text-navy">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row">
        <input
          type="text"
          name="address"
          required
          placeholder="Property address"
          className="w-full flex-1 border border-navy/20 bg-white px-5 py-4 text-sm text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="border border-navy bg-navy px-6 py-4 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark disabled:opacity-60 sm:border-l-0"
        >
          {status === "loading" ? "Submitting…" : "Get My Valuation →"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{message}</p>
      )}
    </form>
  );
}
