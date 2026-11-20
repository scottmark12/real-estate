import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NeighborhoodCard from "@/components/neighborhood-card";
import { NEIGHBORHOOD_PHOTOS, photoCredit, photoUrl } from "@/lib/neighborhood-photos";
import RecentSalesForm from "@/components/recent-sales-form";
import FeedListingCard from "@/components/feed-listing-card";
import SaveSearchForm from "@/components/save-search-form";
import { searchListings } from "@/lib/premier-feed";
import { NEIGHBORHOOD_FEED, buyHref } from "@/lib/neighborhood-feed";
import { notFound } from "next/navigation";
import {
  NEIGHBORHOODS,
  PRICE_TIERS,
  TRAIT_LABELS,
  getNeighborhood,
  nearbyNeighborhoods,
} from "@/lib/neighborhoods";
import { JsonLd, breadcrumbLd } from "@/lib/site";

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/neighborhoods/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) return {};
  return {
    title: `${n.name} Homes for Sale & Neighborhood Guide`,
    description: `${n.tagline} Homes for sale, prices and the honest trade offs from a local agent.`,
    alternates: { canonical: `/neighborhoods/${n.slug}` },
  };
}

function Score({ value }: { value: number }) {
  return (
    <div className="flex gap-1" aria-label={`${value} out of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-2 w-8 ${i <= value ? "bg-blue" : "bg-sand"}`} />
      ))}
    </div>
  );
}

export default async function NeighborhoodPage({
  params,
}: PageProps<"/neighborhoods/[slug]">) {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) notFound();

  const nearby = nearbyNeighborhoods(n);
  const photo = NEIGHBORHOOD_PHOTOS[n.slug];
  const credit = photo ? photoCredit(photo) : null;
  const area = NEIGHBORHOOD_FEED[n.slug] ?? { q: n.name };
  const homes = await searchListings({ ...area, sort: "recent", limit: 6 });
  const homesHref = buyHref(n.slug, n.name);

  return (
    <div className="mx-auto max-w-[1500px] px-12 pb-20 max-[600px]:px-6 max-[600px]:pb-12">
      <JsonLd
        data={breadcrumbLd([
          { name: "Neighborhoods", path: "/neighborhoods" },
          { name: n.name, path: `/neighborhoods/${n.slug}` },
        ])}
      />
      {/* Photo hero */}
      <section className="relative -mx-12 overflow-hidden max-[600px]:-mx-6">
        <div className="relative aspect-[4/3] w-full sm:aspect-[21/9]">
          {photo && (
            <Image
              src={photoUrl(photo, 2000)}
              alt={n.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-12 pb-10 max-[600px]:px-6 max-[600px]:pb-6">
            <p className="text-sm text-white/70">
              <Link href="/neighborhoods" className="hover:text-white">
                Neighborhoods
              </Link>{" "}
              / {n.region}
            </p>
            <h1 className="mt-2 font-georgia text-[48px] font-normal leading-[1.02] text-white max-[600px]:text-[38px] sm:text-[72px]">
              {n.name}
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-snug text-white/90 max-[600px]:text-base">
              {n.tagline}
            </p>
          </div>
        </div>
        {credit && (
          <p className="px-12 pt-2 text-right text-[11px] text-navy/40 max-[600px]:px-6">
            Photo by{" "}
            <a href={credit.href} target="_blank" rel="noreferrer" className="underline">
              {credit.name}
            </a>{" "}
            on{" "}
            <a href={credit.unsplash} target="_blank" rel="noreferrer" className="underline">
              Unsplash
            </a>
          </p>
        )}
      </section>

      {/* Quick facts */}
      <section className="mt-10 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <p className="eyebrow text-navy/50">{n.tags.join(" · ")}</p>
        <div className="border-t-2 border-navy pt-3 sm:min-w-[260px]">
          <p className="eyebrow text-navy/50">Typical house</p>
          <p className="mt-1 font-georgia text-[26px] leading-tight text-navy">
            {PRICE_TIERS[n.priceTier]}
          </p>
          <p className="mt-1 text-xs text-navy/50">A rough range, not a median.</p>
        </div>
      </section>

      {/* About */}
      <section className="mt-16 border-t border-sand pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
          <div className="lg:w-[40%]">
            <p className="eyebrow text-gold">About {n.name}</p>
          </div>
          <div className="flex max-w-2xl flex-col gap-4 text-navy/80 lg:flex-1">
            {n.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {n.markTake && (
              <blockquote className="mt-2 border-l-2 border-blue pl-4 font-georgia text-lg text-navy">
                {n.markTake}
                <span className="eyebrow mt-2 block text-navy/50">Mark&apos;s take</span>
              </blockquote>
            )}
          </div>
        </div>
      </section>

      {/* Highlights + trade offs */}
      <section className="mt-12 grid gap-10 border-t border-sand pt-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-gold">What people love</p>
          <ul className="mt-4 flex flex-col divide-y divide-sand">
            {n.highlights.map((h) => (
              <li key={h} className="py-3 font-georgia text-[20px] text-navy">
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold">The honest trade offs</p>
          <p className="mt-4 text-navy/80">{n.tradeoffs}</p>
        </div>
      </section>

      {/* Scorecard */}
      <section className="mt-12 border-t border-sand pt-12">
        <p className="eyebrow text-gold">The scorecard</p>
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
          {TRAIT_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4 border-b border-sand pb-3">
              <span className="text-sm text-navy">{label}</span>
              <Score value={n.traits[key]} />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-navy/50">
          My read of each place on a 0 to 3 scale. It describes the place, not
          the people who live there.
        </p>
      </section>

      {/* Homes for sale here, from the live feed */}
      {homes && homes.listings.length > 0 && (
        <section className="mt-12 border-t border-sand pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold">For Sale Now</p>
              <h2 className="mt-2 font-display text-3xl font-normal text-navy">
                Homes for sale in {n.name}
              </h2>
            </div>
            <Link
              href={homesHref}
              className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              See All Homes in {n.name} &rarr;
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {homes.listings.slice(0, 3).map((listing) => (
              <FeedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-10">
            <SaveSearchForm
              params={{ ...area, area: n.name }}
              label={`Homes in ${n.name}`}
            />
          </div>
        </section>
      )}

      {/* Recent sales — lead capture */}
      <section className="mt-12 bg-cream-deep px-12 py-12 max-[600px]:-mx-6 max-[600px]:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold">Thinking about {n.name}?</p>
            <h2 className="mt-3 max-w-xl font-georgia text-[30px] leading-[1.2] text-navy">
              Get the recent sales in {n.name}.
            </h2>
            <p className="mt-3 max-w-md text-navy/70">
              What actually sold, for how much, and how fast. Straight from me,
              not an automated alert.
            </p>
            <p className="mt-4 text-sm text-navy/60">
              Or{" "}
              <Link
                href={`/contact?intent=buying&location=${encodeURIComponent(n.name)}`}
                className="underline decoration-gold decoration-2 underline-offset-4"
              >
                ask me anything
              </Link>{" "}
              about living here, or{" "}
              <Link href="/quiz" className="underline decoration-gold decoration-2 underline-offset-4">
                take the quiz
              </Link>
              .
            </p>
          </div>
          <RecentSalesForm place={n.name} />
        </div>
      </section>

      {/* Nearby */}
      {nearby.length > 0 && (
        <section className="mt-12 border-t border-sand pt-12">
          <p className="eyebrow text-gold">Nearby in {n.region}</p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
            {nearby.map((o) => (
              <NeighborhoodCard key={o.slug} n={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
