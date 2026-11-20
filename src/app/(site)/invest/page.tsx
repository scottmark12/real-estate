import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Investing in San Diego Real Estate",
  description:
    "Duplexes, small multifamily, ADU and lot split potential across San Diego County, underwritten with real numbers before you make an offer.",
};

const WHAT_I_RUN = [
  {
    title: "Small multifamily",
    body: "Duplexes to small apartment buildings. Rent roll, real expenses, cap rate and cash on cash, not the listing's pro forma.",
  },
  {
    title: "ADU and lot split potential",
    body: "Whether a lot can take an ADU or an SB 9 split, what it would cost to build, and what it would rent for when it's done.",
  },
  {
    title: "House hacking",
    body: "Live in one unit, rent the rest. What your real monthly cost looks like after the rent comes in.",
  },
  {
    title: "Value add",
    body: "What's worth fixing, what it costs, and what the place is worth after. The designer's eye and the math on the same page.",
  },
];

export default function InvestPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 max-[600px]:py-12 sm:px-10">
      <p className="eyebrow text-gold">Invest</p>
      <h1 className="mt-2 font-display text-4xl font-normal text-navy max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[38px] max-[600px]:font-bold max-[600px]:leading-[1.0] max-[600px]:tracking-[-0.025em] sm:text-5xl">
        Buy it with the numbers already run.
      </h1>
      <p className="mt-5 max-w-2xl text-navy/75">
        Before residential, I worked on $40M+ in multifamily deals, from
        underwriting offers to raising capital. I bring that same math to San Diego investment properties,
        so you know what a place earns before you write an offer.
      </p>

      <div className="mt-12 grid gap-px border border-sand bg-sand sm:grid-cols-2">
        {WHAT_I_RUN.map((item) => (
          <div key={item.title} className="bg-background p-7">
            <h2 className="font-display text-2xl font-normal text-navy">{item.title}</h2>
            <p className="mt-2 text-navy/70">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/contact?intent=investing"
          className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
        >
          Send Me a Property to Underwrite
        </Link>
        <Link
          href="/tools/cost-calculator"
          className="border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
        >
          Run the Monthly Cost
        </Link>
      </div>

      <div className="mt-16 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Worth Reading First</p>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/insights/what-an-adu-actually-costs-in-san-diego"
              className="font-display text-xl text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              What an ADU Actually Costs in San Diego Right Now
            </Link>
          </li>
          <li>
            <Link
              href="/insights/california-sb9-sb10-duplexes-did-it-work"
              className="font-display text-xl text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              California Tried to Legislate Its Way to More Duplexes. Did It Work?
            </Link>
          </li>
          <li>
            <Link
              href="/insights/why-1960s-apartments-are-hard-to-rebuild"
              className="font-display text-xl text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              Why 1960s Apartments Are So Hard to Rebuild Today
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
