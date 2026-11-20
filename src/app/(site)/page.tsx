import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImagePlaceholder from "@/components/image-placeholder";
import { CATEGORY_LABELS } from "@/components/article-card";
import MarketLetterBand from "@/components/market-letter-band";
import type { Article, Listing } from "@/lib/types";
import { LISTINGS_PAUSED } from "@/lib/listings-paused";
import FeedListingCard from "@/components/feed-listing-card";
import MarketChart from "@/components/market-chart";
import { type FeedListing, searchListings } from "@/lib/premier-feed";
import { getFeaturedListings } from "@/lib/featured-listings";
import { DEFAULT_MARKET_CHART, getSetting } from "@/lib/settings";
import type { MarketChartSettings } from "@/lib/types";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import NeighborhoodCard from "@/components/neighborhood-card";
import HomeVideoHero from "@/components/home-video-hero";
import MeetMark from "@/components/meet-mark";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};


export const revalidate = 0;

const PRIMARY_PATHS = [
  {
    title: "Where should I live?",
    short: "Find Your Fit",
    body: "Take the two minute San Diego neighborhood quiz.",
    href: "/quiz",
  },
  {
    title: "What's my home worth?",
    short: "Home Value",
    body: "A real value from recent sales, not a robot.",
    href: "/sell?value=1",
  },
  {
    title: "Market Research",
    short: "Research",
    body: "Markets, buildings & places.",
    href: "/insights",
  },
];

const LISTING_STATUS_LABELS: Record<string, string> = {
  for_sale: "For Sale",
  investment: "Investment",
  off_market: "Off Market",
  sold: "Sold",
};

type ElsewhereItem = {
  order: number;
  date: string | null;
  category: string;
  title: string;
  cta: string;
  href: string;
};

async function getOnMyRadar(): Promise<Article | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .eq("on_my_radar", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Article | null;
}

async function getElsewhere(): Promise<ElsewhereItem[]> {
  const supabase = await createClient();
  const [articlesRes, listingsRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .eq("homepage_elsewhere", true),
    supabase
      .from("listings")
      .select("*")
      .eq("published", true)
      .eq("homepage_elsewhere", true),
  ]);

  const articles = (articlesRes.data as Article[] | null) ?? [];
  const listings = LISTINGS_PAUSED ? [] : ((listingsRes.data as Listing[] | null) ?? []);

  const items: ElsewhereItem[] = [
    ...articles.map((a) => ({
      order: a.homepage_elsewhere_order,
      date: a.published_at,
      category: a.eyebrow || CATEGORY_LABELS[a.category] || a.category,
      title: a.title,
      cta: "Read →",
      href: `/insights/${a.slug}`,
    })),
    ...listings.map((l) => ({
      order: l.homepage_elsewhere_order,
      date: null,
      category: LISTING_STATUS_LABELS[l.status] || "Listing",
      title: l.title,
      cta: "View Homes →",
      href: `/listings/${l.slug}`,
    })),
  ];

  return items.sort((a, b) => a.order - b.order).slice(0, 3);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function getHomeListings(): Promise<{ featured: boolean; listings: FeedListing[] }> {
  const hearted = await getFeaturedListings(4);
  if (hearted.length > 0) return { featured: true, listings: hearted };
  const result = await searchListings({ sort: "recent" });
  return { featured: false, listings: result?.listings.slice(0, 4) ?? [] };
}

const HOME_NEIGHBORHOODS = ["encinitas", "la-jolla", "north-park", "coronado"]
  .map((slug) => NEIGHBORHOODS.find((n) => n.slug === slug))
  .filter((n) => n != null);

export default async function HomePage() {
  const [radar, elsewhere, homeListings, marketChart] = await Promise.all([
    getOnMyRadar(),
    getElsewhere(),
    getHomeListings(),
    getSetting<MarketChartSettings>("market_chart", DEFAULT_MARKET_CHART),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-0 lg:px-12">
      <HomeVideoHero />

      {/* Homes — from the live feed (hearted in the admin, else newest) */}
      {homeListings.listings.length > 0 && (
        <section className="full-bleed mt-6 border-y border-navy/10 bg-white px-4 py-12 max-[600px]:px-6 lg:mt-12 lg:px-12 lg:py-16">
          <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-4 pb-2">
            <p className="font-georgia text-[34px] leading-none text-navy sm:text-[44px]">
              {homeListings.featured ? "Featured homes" : "Just listed"}
            </p>
            <Link
              href="/buy"
              className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              See All Homes &rarr;
            </Link>
          </div>
          {/* Swipe row on phones, grid from tablet up */}
          <div className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 max-[600px]:-mx-6 max-[600px]:scroll-px-6 max-[600px]:px-6 sm:mx-auto sm:grid sm:max-w-[1500px] sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {homeListings.listings.map((listing) => (
              <div key={listing.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <FeedListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      <MeetMark />

      {/* Primary paths — mobile */}
      <section className="border-b border-sand py-3 lg:hidden">
        <div className="relative grid grid-cols-3 divide-x divide-sand">
          {PRIMARY_PATHS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="flex items-center justify-center gap-1.5 py-1 text-center font-display text-[15px] text-navy"
            >
              {p.short}
              <span>&rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Primary paths — desktop */}
      <section className="hidden border-b border-sand py-9 lg:block">
        <div className="relative grid grid-cols-3 divide-y-0">
          <span className="pointer-events-none absolute left-1/3 top-1/2 h-[56px] w-px -translate-x-1/2 -translate-y-1/2 bg-sand" />
          <span className="pointer-events-none absolute left-2/3 top-1/2 h-[56px] w-px -translate-x-1/2 -translate-y-1/2 bg-sand" />
          {PRIMARY_PATHS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group block px-10 py-0 first:pl-0 last:pr-0"
            >
              <h3 className="font-display text-2xl font-normal text-navy">
                {p.title}
              </h3>
              <p className="mt-1 text-sm text-navy/70 transition-colors group-hover:text-navy">
                {p.body}
                <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Full width photo statement */}
      <section className="full-bleed relative mt-0 h-[62vh] min-h-[380px] max-h-[640px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1632074480971-19241d4d422b?auto=format&fit=crop&w=2400&q=75"
          alt="The North County coast from the bluffs in Carlsbad"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-6 pb-10 lg:px-12 lg:pb-14">
          <p className="eyebrow text-white/75">San Diego County</p>
          <h2 className="mt-3 max-w-3xl font-georgia text-[40px] leading-[1.05] text-white max-[600px]:text-[32px] lg:text-[64px]">
            Pick the morning walk first. Then the house.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-cream"
            >
              Find Your Neighborhood
            </Link>
            <Link
              href="/neighborhoods"
              className="border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
            >
              Browse Neighborhoods
            </Link>
          </div>
        </div>
        <p className="absolute right-3 top-3 text-[10px] text-white/60">
          Photo:{" "}
          <a
            href="https://unsplash.com/@samanthadeestudio?utm_source=markscott&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Samantha Jean
          </a>{" "}
          / Unsplash
        </p>
      </section>

      {/* On My Radar — mobile */}
      {radar && (
        <section className="mt-10 lg:hidden">
          <p className="eyebrow px-4 text-gold max-[600px]:px-6">
            On My Radar
            <span className="ml-2 inline-block h-px w-[44px] bg-gold align-middle" />
          </p>

          <Link
            href={`/insights/${radar.slug}`}
            className="group relative mt-6 ml-auto block aspect-[4/3] w-[88%] overflow-hidden"
          >
            {radar.image_url ? (
              <Image
                src={radar.image_url}
                alt={radar.image_caption || radar.title}
                fill
                sizes="88vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                style={{
                  objectPosition: radar.image_position || "50% 50%",
                }}
              />
            ) : (
              <ImagePlaceholder
                label="On My Radar — Article Image"
                className="absolute inset-0"
              />
            )}
          </Link>

          <div className="mt-5 flex flex-col px-4 max-[600px]:px-6">
            <p className="eyebrow text-gold">
              {radar.eyebrow || CATEGORY_LABELS[radar.category] || radar.category}
              {formatDate(radar.published_at) && (
                <span className="text-navy/40"> &middot; {formatDate(radar.published_at)}</span>
              )}
            </p>
            <h2 className="mt-2.5 font-display text-[30px] font-normal leading-[1.1] text-navy max-[600px]:text-[26px] max-[600px]:leading-[1.12]">
              {radar.title}
            </h2>
            {radar.excerpt && (
              <p className="mt-3 line-clamp-3 text-navy/70">
                {radar.excerpt}
              </p>
            )}
            <Link
              href={`/insights/${radar.slug}`}
              className="eyebrow mt-4 inline-block w-fit text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              {radar.cta_label || "Read the Full Analysis →"}
            </Link>
          </div>
        </section>
      )}

      {/* On My Radar — desktop */}
      {radar && (
        <section className="hidden pt-12 lg:block">
          <div className="grid grid-cols-[64px_57fr_38fr] gap-x-10">
            <div className="flex flex-col items-start gap-2">
              <p className="eyebrow leading-tight text-gold">
                On
                <br /> My
                <br /> Radar
              </p>
              <div className="h-10 w-px bg-gold" />
            </div>

            <Link
              href={`/insights/${radar.slug}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden"
            >
              {radar.image_url ? (
                <Image
                  src={radar.image_url}
                  alt={radar.image_caption || radar.title}
                  fill
                  sizes="57vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    objectPosition: radar.image_position || "50% 50%",
                  }}
                />
              ) : (
                <ImagePlaceholder
                  label="On My Radar — Article Image"
                  className="absolute inset-0"
                />
              )}
            </Link>

            <div className="flex flex-col justify-center">
              <p className="eyebrow text-gold">
                {radar.eyebrow || CATEGORY_LABELS[radar.category] || radar.category}
                {formatDate(radar.published_at) && (
                  <span className="text-navy/40"> &middot; {formatDate(radar.published_at)}</span>
                )}
              </p>
              <h2 className="mt-3 font-display text-[36px] font-normal leading-[1.1] text-navy">
                {radar.title}
              </h2>
              {radar.excerpt && (
                <p className="mt-3 line-clamp-3 text-navy/70">
                  {radar.excerpt}
                </p>
              )}
              <Link
                href={`/insights/${radar.slug}`}
                className="eyebrow mt-4 inline-block w-fit text-navy underline decoration-gold decoration-2 underline-offset-4"
              >
                {radar.cta_label || "Read the Full Analysis →"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* The numbers — market chart */}
      <section className="full-bleed mt-14 border-y border-navy/10 bg-white px-4 py-14 max-[600px]:px-6 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[40fr_60fr] lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow text-gold">The Market, Right Now</p>
            <h2 className="mt-4 font-georgia text-[40px] font-normal leading-[1.05] text-navy max-[600px]:text-[30px] lg:text-[52px]">
              More new households than new homes.
            </h2>
            <p className="mt-3 max-w-md text-navy/70">
              San Diego County keeps adding households faster than it adds
              places to live. That gap is the story behind prices here.
            </p>
            <Link
              href="/insights"
              className="eyebrow mt-5 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              More Market Research &rarr;
            </Link>
          </div>
          <div>
            <MarketChart data={marketChart} />
          </div>
        </div>
      </section>

      {/* Neighborhoods — photo cards */}
      <section className="mt-12 px-4 max-[600px]:px-6 lg:px-0">
        <div className="flex items-end justify-between gap-4 border-b border-sand pb-3">
          <p className="eyebrow text-gold">Neighborhoods</p>
          <Link
            href="/neighborhoods"
            className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            All {NEIGHBORHOODS.length} &rarr;
          </Link>
        </div>
        <div className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 max-[600px]:-mx-6 max-[600px]:scroll-px-6 max-[600px]:px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {HOME_NEIGHBORHOODS.map((n) => (
            <div key={n.slug} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <NeighborhoodCard n={n} />
            </div>
          ))}
        </div>
      </section>

      {/* Elsewhere */}
      {elsewhere.length > 0 && (
        <section className="mt-12 border-t border-sand px-4 pb-12 pt-10 max-[600px]:px-6 lg:px-0">
          <p className="eyebrow text-gold">More From the Research</p>
          <div className="mt-6 grid gap-10 sm:grid-cols-3 sm:divide-x sm:divide-sand">
            {elsewhere.map((item, i) => (
              <div key={i} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <p className="eyebrow text-navy/50">
                  {item.category}
                  {formatDate(item.date) && <span> &middot; {formatDate(item.date)}</span>}
                </p>
                <h3 className="mt-2 font-display text-xl font-normal leading-snug text-navy">
                  {item.title}
                </h3>
                <Link
                  href={item.href}
                  className="eyebrow mt-3 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <MarketLetterBand className="full-bleed lg:px-24" />
    </div>
  );
}
