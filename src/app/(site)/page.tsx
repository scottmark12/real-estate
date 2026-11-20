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
import { type FeedListing, getFeaturedListings, searchListings } from "@/lib/premier-feed";
import { DEFAULT_MARKET_CHART, getSetting } from "@/lib/settings";
import type { MarketChartSettings } from "@/lib/types";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";


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
    href: "/sell",
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

const REGION_COUNT = new Set(NEIGHBORHOODS.map((n) => n.region)).size;

export default async function HomePage() {
  const [radar, elsewhere, homeListings, marketChart] = await Promise.all([
    getOnMyRadar(),
    getElsewhere(),
    getHomeListings(),
    getSetting<MarketChartSettings>("market_chart", DEFAULT_MARKET_CHART),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-0 lg:px-12">
      {/* Hero / cover — mobile */}
      <section className="overflow-hidden pt-8 lg:hidden">
        <div className="px-4 max-[600px]:px-6">
          <p className="eyebrow text-gold">San Diego Real Estate</p>
          <h1 className="relative z-20 mt-2 font-georgia text-[32px] font-normal leading-[0.95] text-navy max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em]">
            <span className="block">Real Estate,</span>
            <span className="block">Real Different.</span>
          </h1>
          <p className="relative z-20 mt-[65px] max-w-[37%] text-[15px] text-navy/70">
            Homes picked with a designer&apos;s eye.
          </p>

          <div className="relative z-20 mt-[68px] w-[42%] max-w-[165px] -rotate-2">
            <Image
              src="/images/handwriting-diligence.png"
              alt="Curiosity is good due diligence! —MS"
              width={816}
              height={211}
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="relative z-10 -mt-[313px] mb-8 ml-[15%] w-[124%]">
          <Image
            src="/images/mark-headshot-illustration.png"
            alt="Mark Scott"
            width={993}
            height={866}
            priority
            sizes="124vw"
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Hero / cover — desktop */}
      <section className="hidden pt-10 lg:block">
        <div className="relative grid grid-cols-[minmax(0,45fr)_minmax(0,55fr)] gap-x-0 gap-y-0">
          <div className="relative z-20 col-start-1 row-start-1 self-start pl-32">
            <h1 className="font-georgia text-[120px] font-normal leading-[0.95] text-navy">
              <span className="block whitespace-nowrap">Real Estate,</span>
              <span className="block whitespace-nowrap">Real Different.</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[22.8px] text-navy/70">
              San Diego homes, picked with a designer&apos;s eye and an investor&apos;s math.
            </p>
          </div>

          <div className="absolute left-[247px] top-[500px] z-10 w-[320px] rotate-[-4deg]">
            <Image
              src="/images/handwriting-diligence.png"
              alt="Curiosity is good due diligence! —MS"
              width={816}
              height={211}
              className="h-auto w-full"
            />
          </div>

          <div className="relative col-start-2 row-start-1 row-span-2 -ml-28 w-[120%] self-end">
            <Image
              src="/images/mark-headshot-illustration.png"
              alt="Mark Scott"
              width={993}
              height={866}
              priority
              sizes="55vw"
              className="h-auto w-full"
            />
          </div>

          <div className="col-start-1 row-start-2 self-end">
            <p className="eyebrow text-navy/40">
              Residential Real Estate &middot; Market Research
              <br />
              San Diego, California
            </p>
          </div>
        </div>
      </section>

      {/* Primary paths — mobile */}
      <section className="mt-6 border-y border-sand py-3 lg:hidden">
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
      <section className="mt-20 hidden border-t border-sand py-9 lg:block">
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

      {/* Homes — from the live feed (hearted in the admin, else newest) */}
      {homeListings.listings.length > 0 && (
        <section className="mt-14 px-4 max-[600px]:px-6 lg:mt-6 lg:px-0">
          <div className="flex items-end justify-between gap-4 border-b border-sand pb-3">
            <p className="eyebrow text-gold">
              {homeListings.featured ? "Featured Listings" : "Just Listed"}
            </p>
            <Link
              href="/buy"
              className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              See All Homes &rarr;
            </Link>
          </div>
          {/* Swipe row on phones, grid from tablet up */}
          <div className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 max-[600px]:scroll-px-6 max-[600px]:-mx-6 max-[600px]:px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {homeListings.listings.map((listing) => (
              <div key={listing.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <FeedListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* On My Radar — mobile */}
      {radar && (
        <section className="mt-[54px] lg:hidden">
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
        <section className="hidden border-t border-sand pt-14 lg:block">
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
      <section className="mt-14 bg-cream-deep px-4 py-12 max-[600px]:px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[38fr_62fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold">The Market, Right Now</p>
            <h2 className="mt-3 font-display text-[32px] font-normal leading-[1.1] text-navy max-[600px]:text-[26px]">
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
          <div className="lg:border-l lg:border-navy/15 lg:pl-10">
            <MarketChart data={marketChart} />
          </div>
        </div>
      </section>

      {/* Neighborhoods teaser */}
      <section className="mt-14 px-4 max-[600px]:px-6 lg:px-0">
        <Link
          href="/neighborhoods"
          className="group grid gap-6 border border-sand p-8 transition-colors hover:border-blue sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <p className="eyebrow text-gold">Neighborhood Guide</p>
            <h2 className="mt-2 font-display text-[30px] font-normal leading-[1.1] text-navy max-[600px]:text-[24px]">
              {NEIGHBORHOODS.length} places across San Diego County, on one map.
            </h2>
            <p className="mt-2 max-w-xl text-navy/70">
              What each one is actually like, roughly what it costs, and the
              honest trade offs. {REGION_COUNT} regions, from the coast to the
              backcountry.
            </p>
          </div>
          <span className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4">
            Explore the Map
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>
        </Link>
      </section>

      {/* Elsewhere */}
      {elsewhere.length > 0 && (
        <section className="mt-14 border-t border-sand px-4 pb-16 pt-10 max-[600px]:px-6 lg:px-0">
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
      <MarketLetterBand className="mt-16 lg:mb-16" />
    </div>
  );
}
