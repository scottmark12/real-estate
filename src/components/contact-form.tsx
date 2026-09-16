"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type Intent = "Buying" | "Selling" | "Investing" | "Something else";

const INTENTS: Intent[] = ["Buying", "Selling", "Investing", "Something else"];

function intentFromParam(value: string | null): Intent {
  const match = INTENTS.find((i) => i.toLowerCase() === value?.toLowerCase());
  return match ?? "Buying";
}

const CONTEXT_FIELD: Record<
  Intent,
  { label: string; placeholder: string; name: string } | null
> = {
  Buying: {
    label: "Where are you looking?",
    placeholder: "Neighborhoods, areas or cities",
    name: "location",
  },
  Selling: {
    label: "Property address",
    placeholder: "Property address",
    name: "address",
  },
  Investing: {
    label: "What are you looking for?",
    placeholder: "Multifamily, development, land, etc.",
    name: "criteria",
  },
  "Something else": null,
};

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [intent, setIntent] = useState<Intent>(() =>
    intentFromParam(searchParams.get("intent"))
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const contextField = CONTEXT_FIELD[intent];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          intent,
          context: contextField ? data[contextField.name] : "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
      setMessage("Thanks. I'll be in touch.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <p className="font-display text-2xl font-normal leading-snug text-navy">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <p className="eyebrow text-gold">I&apos;m interested in</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {INTENTS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setIntent(option)}
              className={`border px-5 py-2.5 text-sm transition-colors ${
                intent === option
                  ? "border-blue text-blue"
                  : "border-navy/20 text-navy/70 hover:border-navy/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-navy/50">Name</span>
          <input
            name="name"
            required
            placeholder="Full name"
            className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow text-navy/50">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@domain.com"
            className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow text-navy/50">Phone (optional)</span>
        <input
          name="phone"
          placeholder="(619) 555-0100"
          className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
        />
      </label>

      {contextField && (
        <label className="block">
          <span className="eyebrow text-navy/50">
            {contextField.label} <span className="normal-case">(optional)</span>
          </span>
          <input
            name={contextField.name}
            placeholder={contextField.placeholder}
            className="mt-2 w-full border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
          />
        </label>
      )}

      <label className="block">
        <span className="eyebrow text-navy/50">What&apos;s on your mind?</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Tell me a bit about what you're thinking…"
          className="mt-2 w-full resize-y border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "loading"}
          className="border border-blue bg-blue px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send to Mark →"}
        </button>
        <p className="text-sm italic text-navy/50">
          I&apos;ll get back to you personally, usually within one business
          day.
        </p>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-700">{message}</p>
      )}
    </form>
  );
}
