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
  showIf?: (a: Answers) => boolean;
  options: Option[];
};

type Answers = Record<string, string[]>;

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
    id: "street",
    title: "What do you want right outside your door?",
    options: [
      { value: "3", label: "A downtown core: high rises, restaurants, nightlife" },
      { value: "2", label: "A walkable village main street" },
      { value: "1", label: "Quiet neighborhood streets" },
      { value: "0", label: "Space, trees and privacy" },
    ],
  },
  {
    id: "beach",
    title: "How close to the ocean?",
    options: [
      { value: "front", label: "Oceanfront. I want to see it from my window" },
      { value: "walk", label: "Walk to the sand" },
      { value: "drive", label: "A short drive is fine" },
      { value: "none", label: "Doesn't matter to me" },
    ],
  },
  {
    id: "work",
    title: "Where's work?",
    options: [
      { value: "remote", label: "Remote, or I don't commute" },
      { value: "downtown", label: "Downtown San Diego" },
      { value: "north", label: "Carlsbad, Sorrento Valley or UTC" },
      { value: "other", label: "Somewhere else" },
    ],
  },
  {
    id: "commute",
    title: "How long a commute are you okay with, each way?",
    showIf: (a) => ["downtown", "north"].includes(a.work?.[0] ?? ""),
    options: [
      { value: "3", label: "Under 20 minutes" },
      { value: "2", label: "Up to 30 minutes" },
      { value: "1", label: "Up to 45 minutes" },
      { value: "0", label: "It doesn't bother me" },
    ],
  },
  {
    id: "weekend",
    title: "What does a perfect Saturday look like?",
    help: "Pick up to two",
    multi: 2,
    options: [
      { value: "surf", label: "Dawn patrol surf, then a breakfast burrito" },
      { value: "trails", label: "A long hike or mountain bike ride in the hills" },
      { value: "market", label: "Farmers market, then a long lunch on a patio" },
      { value: "night", label: "Live music, cocktails and a late night out" },
      { value: "golf", label: "A tee time, or a trail ride on horseback" },
      { value: "home", label: "Garden projects and a quiet morning at home" },
    ],
  },
  {
    id: "home",
    title: "What kind of home?",
    options: [
      { value: "condo", label: "Condo or townhome" },
      { value: "house", label: "A house with a yard" },
      { value: "land", label: "Land, room for a shop, horses or a garden" },
    ],
  },
  {
    id: "tradeoff",
    title: "Smaller place in the perfect spot, or more space a little farther out?",
    options: [
      { value: "spot", label: "Smaller place, perfect spot" },
      { value: "middle", label: "Somewhere in the middle" },
      { value: "space", label: "More space, farther out" },
    ],
  },
];

function scoreNeighborhood(n: Neighborhood, a: Answers): number | null {
  const one = (id: string) => a[id]?.[0];
  const tr = n.traits;
  let score = 0;

  const budget = one("budget");
  const b = budget && budget !== "any" ? Number(budget) : null;
  if (b !== null) {
    if (n.priceTier > b + 1) return null;
    if (n.priceTier === b) score += 3;
    else if (n.priceTier === b - 1) score += 1;
  }

  const street = one("street");
  if (street) score += 2 * (3 - Math.abs(tr.urban - Number(street)));

  const beach = one("beach");
  if (beach === "front") score += tr.beach === 3 ? 9 : tr.beach;
  if (beach === "walk") score += 2 * tr.beach;
  if (beach === "drive") score += tr.beach;

  const work = one("work");
  if (work === "downtown" || work === "north") {
    const c = work === "downtown" ? tr.commuteDowntown : tr.commuteNorth;
    const ok = Number(one("commute") ?? "1");
    score += c >= ok ? 3 : -4 * (ok - c);
  }

  for (const pick of a.weekend ?? []) {
    if (pick === "surf") score += 2 * tr.surf;
    if (pick === "trails") score += 2 * tr.trails;
    if (pick === "market") score += 2 * tr.dining + (tr.urban === 2 ? 2 : 0);
    if (pick === "night") score += tr.dining + tr.urban;
    if (pick === "golf") score += 2 * tr.golf;
    if (pick === "home") score += 2 * tr.land + (3 - tr.urban);
  }

  const home = one("home");
  if (home) score += 2 * tr[home as "condo" | "house" | "land"];

  const tradeoff = one("tradeoff");
  if (tradeoff === "spot") score += tr.beach + tr.dining;
  if (tradeoff === "space") score += tr.house + 2 * tr.land + (b !== null && n.priceTier < b ? 2 : 0);

  return score;
}

export default function NeighborhoodQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const visible = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
  const done = step >= visible.length;

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
    const next: Answers = { ...answers, [q.id]: [value] };
    if (q.id === "work" && !["downtown", "north"].includes(value)) delete next.commute;
    setAnswers(next);
    setStep(step + 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  if (done) return <Results results={results} answers={answers} onRestart={restart} />;

  const q = visible[step];
  const picked = answers[q.id] ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-gold">
          Question {step + 1} of {visible.length}
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
          style={{ width: `${(step / visible.length) * 100}%` }}
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
    const summary = QUESTIONS.filter((q) => answers[q.id]?.length).map(
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
