"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { NEIGHBORHOODS, PRICE_TIERS, type Neighborhood } from "@/lib/neighborhoods";

type Option = { value: string; label: string };
type Question = {
  id: string;
  title: string;
  help?: string;
  multi?: number; // max picks
  options: Option[];
};

// Every question is about the place someone wants, never about who they are.
const QUESTIONS: Question[] = [
  {
    id: "budget",
    title: "What's your budget for a home?",
    options: [
      { value: "1", label: "Under $1M" },
      { value: "2", label: "$1M to $1.5M" },
      { value: "3", label: "$1.5M to $2.5M" },
      { value: "4", label: "$2.5M and up" },
      { value: "any", label: "Not sure yet" },
    ],
  },
  {
    id: "plan",
    title: "Buying now, or renting first?",
    options: [
      { value: "buy", label: "Buying" },
      { value: "rent", label: "Renting first" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "urban",
    title: "How much going on around you?",
    options: [
      { value: "3", label: "City energy" },
      { value: "2", label: "A walkable village" },
      { value: "1", label: "Suburban and calm" },
      { value: "0", label: "As quiet as it gets" },
    ],
  },
  {
    id: "beach",
    title: "How close to the beach?",
    options: [
      { value: "walk", label: "Walk to the sand" },
      { value: "drive", label: "A short drive is fine" },
      { value: "none", label: "Doesn't matter" },
    ],
  },
  {
    id: "work",
    title: "Where's work?",
    options: [
      { value: "remote", label: "Remote" },
      { value: "downtown", label: "Downtown San Diego" },
      { value: "north", label: "Carlsbad, Sorrento Valley or UTC" },
      { value: "other", label: "Somewhere else" },
    ],
  },
  {
    id: "weekend",
    title: "Your perfect weekend?",
    help: "Pick up to two",
    multi: 2,
    options: [
      { value: "surf", label: "Surfing" },
      { value: "trails", label: "Hiking and trails" },
      { value: "dining", label: "Restaurants and bars" },
      { value: "golf", label: "Golf and horses" },
    ],
  },
  {
    id: "home",
    title: "What kind of home?",
    options: [
      { value: "condo", label: "Condo or townhome" },
      { value: "house", label: "A house" },
      { value: "land", label: "Land and space" },
    ],
  },
  {
    id: "priority",
    title: "If you had to pick one, what matters most?",
    options: [
      { value: "price", label: "Price" },
      { value: "beach", label: "The beach" },
      { value: "walk", label: "Walkability" },
      { value: "space", label: "Space" },
    ],
  },
];

type Answers = Record<string, string[]>;

function scoreNeighborhood(n: Neighborhood, a: Answers): number | null {
  const one = (id: string) => a[id]?.[0];
  const priority = one("priority");
  const w = (key: string) => (priority === key ? 2 : 1);
  const tr = n.traits;
  let score = 0;

  const budget = one("budget");
  if (budget && budget !== "any") {
    const b = Number(budget);
    if (n.priceTier > b + 1) return null;
    if (n.priceTier === b) score += 3 * w("price");
    else if (n.priceTier === b - 1) score += 1 * w("price");
  }

  const urban = one("urban");
  if (urban) score += (3 - Math.abs(tr.urban - Number(urban))) * w("walk");

  const beach = one("beach");
  if (beach === "walk") score += 2 * tr.beach * w("beach");
  if (beach === "drive") score += 1 * tr.beach * w("beach");

  const work = one("work");
  if (work === "downtown") score += 2 * tr.commuteDowntown;
  if (work === "north") score += 2 * tr.commuteNorth;

  for (const pick of a.weekend ?? []) {
    score += 2 * tr[pick as "surf" | "trails" | "dining" | "golf"];
  }

  const home = one("home");
  if (home) score += 2 * tr[home as "condo" | "house" | "land"] * w("space");

  return score;
}

export default function NeighborhoodQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= QUESTIONS.length;

  const results = useMemo(() => {
    if (!done) return [];
    return NEIGHBORHOODS.map((n) => ({ n, s: scoreNeighborhood(n, answers) }))
      .filter((r): r is { n: Neighborhood; s: number } => r.s !== null)
      .sort((x, y) => y.s - x.s)
      .slice(0, 3)
      .map((r) => r.n);
  }, [done, answers]);

  function choose(q: Question, value: string) {
    if (q.multi) {
      const current = answers[q.id] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : current.length < q.multi
          ? [...current, value]
          : [...current.slice(1), value];
      setAnswers({ ...answers, [q.id]: next });
      return;
    }
    setAnswers({ ...answers, [q.id]: [value] });
    setStep(step + 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  if (done) return <Results results={results} answers={answers} onRestart={restart} />;

  const q = QUESTIONS[step];
  const picked = answers[q.id] ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-gold">
          Question {step + 1} of {QUESTIONS.length}
        </p>
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-sm text-navy/60 hover:text-navy"
          >
            Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 w-full bg-sand">
        <div
          className="h-1 bg-blue transition-all"
          style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-8 font-georgia text-[34px] leading-[1.15] text-navy max-[600px]:text-[28px]">
        {q.title}
      </h2>
      {q.help && <p className="mt-2 text-sm text-navy/60">{q.help}</p>}

      <div className="mt-8 flex flex-col gap-3">
        {q.options.map((o) => {
          const on = picked.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(q, o.value)}
              className={`border px-5 py-4 text-left text-navy transition-colors ${
                on ? "border-blue bg-blue text-cream" : "border-navy/20 hover:border-navy"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {q.multi && (
        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => setStep(step + 1)}
          className="mt-6 border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark disabled:opacity-40"
        >
          Next
        </button>
      )}
    </div>
  );
}

function Results({
  results,
  answers,
  onRestart,
}: {
  results: Neighborhood[];
  answers: Answers;
  onRestart: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    const summary = QUESTIONS.map(
      (q) =>
        `${q.title} ${(answers[q.id] ?? [])
          .map((v) => q.options.find((o) => o.value === v)?.label ?? v)
          .join(", ")}`
    ).join("\n");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        intent: "Buying",
        context: `Quiz matches: ${results.map((r) => r.name).join(", ")}`,
        message: `Neighborhood quiz shortlist request.\n\nTop matches: ${results
          .map((r) => r.name)
          .join(", ")}\n\nAnswers:\n${summary}`,
      }),
    }).catch(() => null);
    if (res?.ok) setStatus("sent");
    else {
      const body = await res?.json().catch(() => null);
      setError(body?.error ?? "Something went wrong. Try again in a minute.");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-gold">Your top {results.length}</p>
          <h2 className="mt-3 max-w-2xl font-georgia text-[40px] leading-[1.1] text-navy max-[600px]:text-[32px]">
            Here&apos;s where I&apos;d start looking.
          </h2>
        </div>
        <button type="button" onClick={onRestart} className="self-start text-sm text-navy/60 underline hover:text-navy lg:self-auto">
          Retake the quiz
        </button>
      </div>

      {results.length === 0 ? (
        <p className="mt-8 text-navy/80">
          Nothing matched every answer. Try a wider budget, or{" "}
          <Link href="/contact" className="underline">
            ask me directly
          </Link>
          .
        </p>
      ) : (
        <ol className="mt-10 flex flex-col divide-y divide-sand border-t-2 border-navy">
          {results.map((n, i) => (
            <li key={n.slug} className="grid gap-3 py-6 sm:grid-cols-[60px_1fr_auto] sm:items-start sm:gap-6">
              <span className="font-georgia text-[28px] leading-none text-blue">{i + 1}</span>
              <div>
                <h3 className="font-georgia text-[26px] leading-tight text-navy">{n.name}</h3>
                <p className="eyebrow mt-1 text-navy/40">
                  {n.region} · {PRICE_TIERS[n.priceTier]}
                </p>
                <p className="mt-3 max-w-2xl text-navy/80">{n.tagline}</p>
                <p className="eyebrow mt-3 text-navy/50">{n.tags.join(" · ")}</p>
              </div>
              <Link
                href={`/neighborhoods/${n.slug}`}
                className="self-start border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
              >
                See {n.name}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <section className="mt-12 bg-cream-deep px-10 py-10 max-[600px]:px-6">
        {status === "sent" ? (
          <div>
            <p className="eyebrow text-gold">Got it</p>
            <p className="mt-3 font-georgia text-[26px] text-navy">
              I&apos;ll send you recent sales and my take on your three, personally.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="eyebrow text-gold">Want the details?</p>
            <h3 className="mt-3 max-w-xl font-georgia text-[28px] leading-[1.2] text-navy">
              I&apos;ll send you recent sales and my honest take on these three.
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <input
                name="name"
                required
                placeholder="Your name"
                className="border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="border-0 border-b border-navy/25 bg-transparent px-0 py-2 text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark disabled:opacity-50"
              >
                {status === "sending" ? "Sending" : "Send Me My Shortlist"}
              </button>
            </div>
            {status === "error" && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </form>
        )}
      </section>
    </div>
  );
}
