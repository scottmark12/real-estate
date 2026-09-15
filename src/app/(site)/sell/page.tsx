import Image from "next/image";
import Link from "next/link";
import ValuationForm from "@/components/valuation-form";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const revalidate = 0;

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
    body: "Get a data-backed valuation and strategy tailored to your goals.",
  },
  {
    icon: "prepare" as const,
    title: "Prepare",
    body: "Guidance on what to improve, stage, or leave as is.",
  },
  {
    icon: "market" as const,
    title: "Market",
    body: "Professional photography, listing materials, and targeted outreach.",
  },
  {
    icon: "close" as const,
    title: "Close",
    body: "Skilled negotiation and transaction management through closing.",
  },
];

export default async function SellPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

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
              Local expertise, a clear plan, and hands-on support from start
              to finish. No guesswork.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="#valuation"
                className="border border-navy bg-navy px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark"
              >
                Get a Home Valuation &rarr;
              </Link>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Or talk to Mark directly &rarr;
            </Link>
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
            I handle the details, so you can move forward with confidence.
          </p>
        </div>

        <div className="relative mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
          <div className="absolute bottom-3 left-0 top-3 w-px bg-navy/15 lg:hidden" />
          {STEPS.map((step, i) => (
            <div key={step.title} className="contents lg:flex lg:flex-1">
              {i > 0 && (
                <div className="hidden shrink-0 items-center justify-center px-4 pt-6 text-navy/30 lg:flex">
                  &rarr;
                </div>
              )}
              <div className="relative pl-6 lg:flex-1 lg:pl-0">
                <div className="absolute left-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-cream bg-navy/40 lg:hidden" />
                <p className="eyebrow text-gold">0{i + 1}</p>
                <ProcessIcon
                  icon={step.icon}
                  className="mt-3 h-7 w-7 text-navy/60"
                />
                <h3 className="mt-3 font-display text-xl font-semibold text-navy">
                  {step.title}
                </h3>
                <p className="mt-1 max-w-[220px] text-sm text-navy/70">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Get Started / Valuation */}
      <section id="valuation" className="scroll-mt-24 border-t border-sand">
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
            <p className="eyebrow text-gold">Get Started</p>
            <h2 className="mt-3 font-display text-4xl font-normal leading-[1.05] text-navy sm:text-5xl">
              What&rsquo;s your
              <br />
              home worth?
            </h2>
            <p className="mt-4 max-w-sm text-navy/70">
              Enter your address to get a personalized home valuation.
            </p>
            <div className="mt-6 max-w-lg">
              <ValuationForm />
            </div>
            <Link
              href="/contact"
              className="mt-4 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Or contact Mark directly &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Closing metadata */}
      <div className="border-t border-sand px-[4vw] py-6">
        <div className="flex flex-col items-start justify-between gap-2 text-xs text-navy/50 sm:flex-row sm:items-center">
          <p className="eyebrow text-navy/50">
            Local Expertise.
            <br className="sm:hidden" /> Better Outcomes.
          </p>
          <p className="eyebrow text-navy/50">
            {contact.city_state} &middot; 32.7157&deg; N, 117.1611&deg; W
          </p>
        </div>
      </div>
    </div>
  );
}
