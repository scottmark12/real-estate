import type { Metadata } from "next";
import Link from "next/link";
import NeighborhoodMap from "@/components/neighborhood-map";
import { NEIGHBORHOODS, PRICE_TIERS, REGIONS } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "San Diego Neighborhoods",
  description:
    "A local's guide to San Diego neighborhoods, from the North County coast to the urban core: what each place is like, what it costs and the honest trade offs.",
};

export default function NeighborhoodsPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 max-[600px]:px-6 max-[600px]:pt-10 max-[600px]:pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-gold">Neighborhoods</p>
          <h1 className="mt-3 max-w-2xl font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[38px] sm:text-[48px]">
            Find the part of San Diego that fits how you live.
          </h1>
          <p className="mt-5 max-w-xl text-navy/80">
            What each neighborhood is actually like, roughly what it costs, and
            the honest trade offs. Not sure where to start? The quiz narrows it
            down to your top three in about two minutes.
          </p>
        </div>
        <Link
          href="/quiz"
          className="shrink-0 self-start border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark lg:self-auto"
        >
          Where Should I Live? Take the Quiz
        </Link>
      </div>

      <section className="mt-12">
        <NeighborhoodMap />
      </section>

      {REGIONS.map((region) => (
        <section key={region} className="mt-16 border-t border-sand pt-10">
          <p className="eyebrow text-navy">{region}</p>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {NEIGHBORHOODS.filter((n) => n.region === region).map((n) => (
              <Link
                key={n.slug}
                href={`/neighborhoods/${n.slug}`}
                className="group border-t-2 border-navy pt-4"
              >
                <h2 className="font-georgia text-[24px] leading-[1.2] text-navy group-hover:text-blue">
                  {n.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy/80">{n.tagline}</p>
                <p className="eyebrow mt-3 text-navy/40">
                  {n.tags.join(" · ")}
                </p>
                <p className="mt-1 text-xs text-navy/60">{PRICE_TIERS[n.priceTier]}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-16 max-w-2xl text-xs leading-relaxed text-navy/50">
        Price ranges are rough guides for a typical house, not medians, and
        change with the market. Ask me for recent sales in any neighborhood.
      </p>
    </div>
  );
}
