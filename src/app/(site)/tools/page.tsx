import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tools | Mark Scott Real Estate",
  description:
    "Free tools for buying and selling in San Diego: the Where Should I Live quiz, a true cost of owning calculator, home values and market research.",
};

const TOOLS = [
  {
    href: "/quiz",
    eyebrow: "Quiz",
    title: "Where should I live in San Diego?",
    body: "A few questions about how you want to live, and the three San Diego neighborhoods that fit you best.",
    cta: "Take the quiz",
  },
  {
    href: "/tools/cost-calculator",
    eyebrow: "Calculator",
    title: "True cost of owning",
    body: "Mortgage, property tax, Mello Roos, insurance and HOA in one monthly number, plus your cash to close.",
    cta: "Run the numbers",
  },
  {
    href: "/sell",
    eyebrow: "Sellers",
    title: "What's my home worth?",
    body: "Send me your address and I'll put together a real value based on recent sales, not an automated guess.",
    cta: "Get a home value",
  },
  {
    href: "/neighborhoods",
    eyebrow: "Guide",
    title: "Neighborhood guide",
    body: "What 29 San Diego neighborhoods are actually like, roughly what they cost, and the honest trade offs.",
    cta: "Browse neighborhoods",
  },
  {
    href: "/insights",
    eyebrow: "Research",
    title: "Market research",
    body: "Data driven reporting on what's actually happening in the San Diego market.",
    cta: "Read the research",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 max-[600px]:px-6 max-[600px]:pt-10">
      <p className="eyebrow text-gold">Tools</p>
      <h1 className="mt-3 max-w-2xl font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[36px] sm:text-[48px]">
        Free tools for making a smart move in San Diego.
      </h1>
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 border-t border-sand pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="group flex flex-col border-t-2 border-navy pt-5">
            <p className="eyebrow text-gold">{t.eyebrow}</p>
            <h2 className="mt-3 font-georgia text-[28px] leading-[1.15] text-navy group-hover:text-blue">
              {t.title}
            </h2>
            <p className="mt-3 flex-1 text-navy/80">{t.body}</p>
            <span className="eyebrow mt-5 text-navy underline decoration-1 underline-offset-4 group-hover:text-blue">
              {t.cta}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
