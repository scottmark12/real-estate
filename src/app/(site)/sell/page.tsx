import Link from "next/link";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const revalidate = 0;

const STEPS = [
  {
    title: "Pricing Strategy",
    body: "A data-backed valuation using recent comparable sales and current market conditions, not guesswork.",
  },
  {
    title: "Preparation & Marketing",
    body: "Professional photography, staging guidance, and targeted marketing to reach qualified buyers fast.",
  },
  {
    title: "Negotiation & Close",
    body: "Hands-on negotiation and transaction management from offer to closing day.",
  },
];

export default async function SellPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">Sell</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Sell With Confidence
      </h1>
      <p className="mt-3 max-w-xl text-navy/70">
        Selling a home in {contact.city_state} takes more than a sign in the
        yard. Here&apos;s how I help sellers get the best possible outcome.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title}>
            <span className="font-display text-3xl text-gold">
              0{i + 1}
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-navy/70">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-sand bg-cream-deep p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Ready to find out what your home is worth?
        </h2>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-dark"
        >
          Get a Free Home Valuation
        </Link>
      </div>
    </div>
  );
}
