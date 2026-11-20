import type { Metadata } from "next";
import Link from "next/link";
import NeighborhoodCard from "@/components/neighborhood-card";
import { NEIGHBORHOODS, REGIONS } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "San Diego Neighborhoods",
  description:
    "A local's guide to San Diego neighborhoods, from the North County coast to the urban core: what each place is like, what it costs and the honest trade offs.",
};

const regionId = (r: string) => r.toLowerCase().replace(/[^a-z]+/g, "-");

export default function NeighborhoodsPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 max-[600px]:px-6 max-[600px]:pt-10 max-[600px]:pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-gold">Neighborhoods</p>
          <h1 className="mt-3 max-w-2xl font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[36px] sm:text-[48px]">
            Find the part of San Diego that fits how you live.
          </h1>
          <p className="mt-4 max-w-xl text-navy/70">
            {NEIGHBORHOODS.length} places across the county. What each one is
            like, roughly what it costs, and the honest trade offs.
          </p>
        </div>
        <Link
          href="/quiz"
          className="shrink-0 self-start border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark lg:self-auto"
        >
          Not Sure? Take the Quiz
        </Link>
      </div>

      {/* Jump to a region */}
      <nav
        aria-label="Regions"
        className="-mx-12 mt-10 flex gap-2 overflow-x-auto border-y border-sand px-12 py-4 max-[600px]:-mx-6 max-[600px]:px-6"
      >
        {REGIONS.map((r) => (
          <a
            key={r}
            href={`#${regionId(r)}`}
            className="shrink-0 border border-sand px-4 py-2 text-sm text-navy transition-colors hover:border-navy"
          >
            {r}
          </a>
        ))}
      </nav>

      {REGIONS.map((region) => (
        <section key={region} id={regionId(region)} className="scroll-mt-24 pt-14">
          <h2 className="eyebrow text-navy">{region}</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {NEIGHBORHOODS.filter((n) => n.region === region).map((n) => (
              <NeighborhoodCard key={n.slug} n={n} />
            ))}
          </div>
        </section>
      ))}

      <p className="mt-16 max-w-2xl text-xs leading-relaxed text-navy/50">
        Price ranges are rough guides for a typical house, not medians, and
        change with the market. Ask me for recent sales in any neighborhood.
        Photos via Unsplash, credited on each neighborhood page.
      </p>
    </div>
  );
}
