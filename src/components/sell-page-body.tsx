"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ValuationModal from "@/components/valuation-modal";
import type { ContactSettings } from "@/lib/types";

function ProcessIcon({
  icon,
  className,
}: {
  icon: "evaluate" | "prepare" | "market" | "close";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (icon === "prepare") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="12" height="4" />
        <path d="M10 8v5" />
        <rect x="8" y="13" width="4" height="6" />
      </svg>
    );
  }
  if (icon === "market") {
    return (
      <svg {...common}>
        <path d="M3 10v4h3l6 4V6l-6 4H3z" />
        <path d="M15 9a3 3 0 0 1 0 6" />
      </svg>
    );
  }
  if (icon === "close") {
    return (
      <svg {...common}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v3h3" />
        <path d="M9 13l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

const STEPS = [
  {
    icon: "evaluate" as const,
    title: "Evaluate",
    body: "What's it worth, who's likely to buy it, and where should we price it?",
    detail:
      "We'll walk the property, look at recent comparable sales, and consider who's actually shopping in this price range before landing on a number.",
  },
  {
    icon: "prepare" as const,
    title: "Prepare",
    body: "What's worth fixing, improving, staging, or simply leaving alone?",
    detail:
      "Some things are worth doing before you list. Others aren't. We'll go through the property room by room and decide together.",
  },
  {
    icon: "market" as const,
    title: "Market",
    body: "Photography, positioning, and a launch designed to get the right buyers through the door.",
    detail:
      "Good photography and the right positioning bring in serious buyers instead of lookers. We'll launch it in a way that gets it seen by the right people.",
  },
  {
    icon: "close" as const,
    title: "Close",
    body: "Compare the offers, negotiate the details, and get it across the finish line.",
    detail:
      "Offers get compared on more than price. We'll go through each one, negotiate what matters, and manage the process through to closing.",
  },
];

function PrimaryCta({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-navy bg-navy px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark"
    >
      {label}
    </button>
  );
}

function SecondaryCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
    >
      {label}
    </Link>
  );
}

export default function SellPageBody({ contact }: { contact: ContactSettings }) {
  const [valuationOpen, setValuationOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="px-[4vw] pb-10 pt-10 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[48fr_52fr] lg:items-stretch">
          <div className="flex flex-col justify-center py-6 lg:py-0">
            <p className="eyebrow text-gold">Sell</p>
            <h1 className="mt-3 font-display text-5xl font-normal leading-[1.02] text-navy sm:text-6xl">
              A straightforward
              <br />
              way to sell.
            </h1>
            <p className="mt-5 max-w-sm text-navy/70">
              You know what you want from the sale. My job is to build the
              strategy around it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryCta
                onClick={() => setValuationOpen(true)}
                label="Start with a Valuation →"
              />
              <SecondaryCta href="/contact?intent=selling" label="Talk to Mark →" />
            </div>
          </div>
          <div>
            <div className="relative aspect-4/3 w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[380px]">
              <Image
                src="/images/sell-hero.jpg"
                alt="A modern home with a pool"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <p className="eyebrow mt-3 text-right text-navy/50">
              {contact.city_state}
            </p>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="border-t border-sand px-[4vw] py-14">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-gold">The Process</p>
            <h2 className="mt-2 font-display text-3xl font-normal text-navy sm:text-4xl">
              Four simple steps.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-navy/70">
            Do what matters. Skip what doesn&apos;t. Price it right.
          </p>
        </div>

        {/* Mobile: compact accordion, collapsed by default */}
        <div className="mt-8 lg:hidden">
          {STEPS.map((step, i) => {
            const expanded = expandedStep === step.title;
            return (
              <div key={step.title} className="border-b border-sand first:border-t">
                <button
                  type="button"
                  onClick={() => setExpandedStep(expanded ? null : step.title)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={expanded}
                >
                  <span className="eyebrow text-navy">
                    0{i + 1} &middot; {step.title}
                  </span>
                  <span className="shrink-0 text-lg font-normal text-navy/40">
                    {expanded ? "−" : "+"}
                  </span>
                </button>
                {expanded && (
                  <div className="pb-4">
                    <p className="text-sm text-navy/70">{step.body}</p>
                    <p className="mt-2 text-sm leading-relaxed text-navy/60">
                      {step.detail}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: full four-column layout */}
        <div className="mt-10 hidden lg:flex lg:items-start lg:gap-0">
          {STEPS.map((step, i) => {
            const expanded = expandedStep === step.title;
            return (
              <div key={step.title} className="contents">
                {i > 0 && (
                  <div className="flex shrink-0 items-center justify-center px-4 pt-6 text-navy/30">
                    &rarr;
                  </div>
                )}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setExpandedStep(expanded ? null : step.title)}
                    className="group text-left"
                    aria-expanded={expanded}
                  >
                    <p className="eyebrow text-gold">0{i + 1}</p>
                    <ProcessIcon
                      icon={step.icon}
                      className="mt-3 h-7 w-7 text-navy/60"
                    />
                    <h3 className="mt-3 flex items-center gap-2 font-display text-xl font-semibold text-navy">
                      {step.title}
                      <span className="text-sm font-normal text-navy/30 transition-transform group-hover:text-navy/50">
                        {expanded ? "−" : "+"}
                      </span>
                    </h3>
                    <p className="mt-1 max-w-[220px] text-sm text-navy/70">
                      {step.body}
                    </p>
                  </button>
                  {expanded && (
                    <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-navy/60">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing / conversion */}
      <section className="border-t border-sand">
        <div className="grid lg:grid-cols-[45fr_55fr]">
          <div className="relative aspect-4/3 w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <Image
              src="/images/home-worth.jpeg"
              alt="A home at dusk"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-[#f7f3ea] px-[8%] py-12 lg:py-0">
            <p className="eyebrow text-gold">Ready When You Are</p>
            <h2 className="mt-3 font-display text-4xl font-normal leading-[1.05] text-navy sm:text-5xl">
              Thinking about
              <br />
              selling?
            </h2>
            <p className="mt-4 max-w-sm italic text-navy/70">
              You don&apos;t need to be ready to list to start figuring out
              what your next move looks like.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <PrimaryCta
                onClick={() => setValuationOpen(true)}
                label="Get a Pricing Opinion →"
              />
              <SecondaryCta
                href="/contact?intent=selling"
                label="Ask Me a Question →"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Closing metadata */}
      <div className="border-t border-sand px-[4vw] py-6">
        <p className="eyebrow text-navy/50">
          {contact.city_state} &middot; 32.7157&deg; N, 117.1611&deg; W
        </p>
      </div>

      <ValuationModal open={valuationOpen} onClose={() => setValuationOpen(false)} />
    </div>
  );
}
