import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NeighborhoodSearch, { type SearchItem } from "@/components/neighborhood-search";
import { NEIGHBORHOOD_FEED } from "@/lib/neighborhood-feed";
import NeighborhoodCard from "@/components/neighborhood-card";
import { NEIGHBORHOODS, REGIONS } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "San Diego Neighborhoods",
  description:
    "A local's guide to San Diego neighborhoods, from the North County coast to the urban core: what each place is like, what it costs and the honest trade offs.",
};

const regionId = (r: string) => r.toLowerCase().replace(/[^a-z]+/g, "-");

const searchItems: SearchItem[] = NEIGHBORHOODS.map((n) => {
  const feed = NEIGHBORHOOD_FEED[n.slug];
  return {
    slug: n.slug,
    name: n.name,
    region: n.region,
    keys: [n.name, n.region, feed?.city, feed?.zip, ...n.tags]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
});

export default function NeighborhoodsPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pb-20 max-[600px]:px-6 max-[600px]:pb-12">
      {/* Photo hero with search, Florida Coastal style */}
      <section className="full-bleed relative z-10 flex min-h-[92vh] items-center justify-center pt-20 max-[600px]:min-h-[86vh]">
        <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1654054413716-0a2986b9cd3d?auto=format&fit=crop&w=2400&q=80"
          alt="Waves rolling into La Jolla Cove under a blue sky"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/45" />
        </div>
        <div className="relative w-full px-6 py-24 text-center">
          <p className="eyebrow text-white/85">
            {NEIGHBORHOODS.length} neighborhoods &middot; Oceanside to the border
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl font-georgia text-[44px] font-normal leading-[1.02] text-white sm:text-[68px] lg:text-[84px]">
            Every corner of San Diego County
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90 max-[600px]:text-base">
            What each place is actually like, what it costs and the honest trade
            offs. Look one up, or let the quiz pick three for you.
          </p>
          <div className="mt-9">
            <NeighborhoodSearch items={searchItems} />
          </div>
          <p className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white">
            <Link href="/quiz" className="underline underline-offset-4 hover:text-white/80">
              Not sure yet? Take the quiz
            </Link>
            <Link href="/tools/cost-calculator" className="underline underline-offset-4 hover:text-white/80">
              What would it cost?
            </Link>
          </p>
        </div>
        <p className="absolute bottom-3 right-3 text-[10px] text-white/60">
          Photo:{" "}
          <a
            href="https://unsplash.com/@ccfrancisbooks?utm_source=markscott&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            C.C. Francis
          </a>{" "}
          / Unsplash
        </p>
      </section>

      {/* Jump to a region */}
      <nav
        aria-label="Regions"
        className="-mx-12 flex gap-2 overflow-x-auto border-b border-sand px-12 py-4 max-[600px]:-mx-6 max-[600px]:px-6"
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
