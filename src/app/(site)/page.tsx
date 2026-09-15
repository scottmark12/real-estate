import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/listing-card";
import ArticleCard from "@/components/article-card";
import MarketChart from "@/components/market-chart";
import NewsletterForm from "@/components/newsletter-form";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_ABOUT,
  DEFAULT_HERO,
  DEFAULT_MARKET_CHART,
  DEFAULT_NEWSLETTER,
  DEFAULT_SERVICES,
  getSetting,
} from "@/lib/settings";
import type {
  AboutSettings,
  Article,
  HeroSettings,
  Listing,
  MarketChartSettings,
  NewsletterSettings,
  ServiceItem,
} from "@/lib/types";

export const revalidate = 0;

async function getFeaturedListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const featured = await supabase
    .from("listings")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(4);

  if (featured.data && featured.data.length > 0) {
    return featured.data as Listing[];
  }

  const fallback = await supabase
    .from("listings")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (fallback.data as Listing[]) ?? [];
}

async function getMarketReportArticle(): Promise<Article | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .eq("is_market_report", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Article | null) ?? null;
}

async function getFeatureStoryArticle(): Promise<Article | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .eq("is_feature_story", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Article | null) ?? null;
}

async function getSideArticles(excludeIds: string[]): Promise<Article[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .in("category", ["residential", "national"])
    .order("published_at", { ascending: false })
    .limit(6);

  return ((data as Article[]) ?? [])
    .filter((a) => !excludeIds.includes(a.id))
    .slice(0, 2);
}

export default async function HomePage() {
  const [
    hero,
    services,
    about,
    newsletter,
    marketChart,
    featuredListings,
    marketReport,
    featureStory,
  ] = await Promise.all([
    getSetting<HeroSettings>("hero", DEFAULT_HERO),
    getSetting<ServiceItem[]>("services", DEFAULT_SERVICES),
    getSetting<AboutSettings>("about", DEFAULT_ABOUT),
    getSetting<NewsletterSettings>("newsletter", DEFAULT_NEWSLETTER),
    getSetting<MarketChartSettings>("market_chart", DEFAULT_MARKET_CHART),
    getFeaturedListings(),
    getMarketReportArticle(),
    getFeatureStoryArticle(),
  ]);

  const sideArticles = await getSideArticles(
    [marketReport?.id, featureStory?.id].filter(Boolean) as string[]
  );

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden">
        <Image
          src={hero.image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/30 to-navy-dark/10" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-32 sm:px-10">
          <p className="eyebrow text-cream/80">
            {hero.location_label} &middot; {hero.dateline}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream/85 sm:text-lg">
            {hero.subhead}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={hero.cta_primary_href}
              className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white"
            >
              {hero.cta_primary_label}
            </Link>
            <Link
              href={hero.cta_secondary_href}
              className="rounded-full border border-cream/60 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              {hero.cta_secondary_label}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold">Featured</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
              Featured Listings
            </h2>
          </div>
          <Link
            href="/listings"
            className="hidden text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 sm:block"
          >
            View All Listings
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {featuredListings.length === 0 && (
            <p className="text-navy/60">
              Listings will appear here once added in the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* Market, Right Now */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <p className="eyebrow text-gold">The Market, Right Now</p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-sand bg-white/70 p-6 sm:p-8">
              {marketReport && (
                <>
                  <h3 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
                    {marketReport.title}
                  </h3>
                  {marketReport.excerpt && (
                    <p className="mt-3 text-navy/70">{marketReport.excerpt}</p>
                  )}
                </>
              )}
              <div className="mt-6">
                <MarketChart data={marketChart} />
              </div>
              {marketReport && (
                <Link
                  href={`/insights/${marketReport.slug}`}
                  className="mt-6 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  Read the Full Report
                </Link>
              )}
            </div>
            <div className="grid gap-6">
              {sideArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {sideArticles.length === 0 && (
                <p className="text-navy/60">
                  Articles will appear here once published in the admin
                  panel.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Story */}
      {featureStory && (
        <section className="bg-navy py-20 text-cream">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:items-center">
            {featureStory.image_url && (
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                <Image
                  src={featureStory.image_url}
                  alt={featureStory.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="eyebrow text-gold">Feature Story</p>
              <h3 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {featureStory.title}
              </h3>
              {featureStory.excerpt && (
                <p className="mt-4 text-cream/80">{featureStory.excerpt}</p>
              )}

              <ol className="mt-8 space-y-4 border-t border-cream/15 pt-6">
                {[
                  "The Building",
                  "The Economics",
                  "The Opportunity",
                ].map((label, i) => (
                  <li key={label} className="flex items-baseline gap-4">
                    <span className="font-display text-2xl text-gold">
                      0{i + 1}
                    </span>
                    <span className="text-cream/90">{label}</span>
                  </li>
                ))}
              </ol>

              <Link
                href={`/insights/${featureStory.slug}`}
                className="mt-8 inline-block rounded-full bg-cream px-6 py-3 text-sm font-semibold text-navy hover:bg-white"
              >
                Read the Story
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How I Can Help */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <p className="eyebrow text-gold">How I Can Help</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
            {services.map((service) => (
              <div key={service.title}>
                <h3 className="font-display text-xl font-semibold text-navy">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-navy/70">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="mt-2 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-sand bg-cream-deep p-8 sm:p-10">
            <div className="flex items-center gap-4">
              {about.headshot_url && (
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={about.headshot_url}
                    alt={about.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="font-display text-lg font-semibold text-navy">
                {about.name}
              </p>
            </div>
            <blockquote className="mt-6 font-display text-2xl leading-snug text-navy">
              &ldquo;{about.quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden py-24">
        <Image
          src={newsletter.image_url}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-dark/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-cream sm:px-10">
          <p className="eyebrow text-cream/70">
            {newsletter.tagline_line1}
            <br />
            {newsletter.tagline_line2}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            {newsletter.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/80">
            {newsletter.subhead}
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
