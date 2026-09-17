import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { CATEGORY_LABELS } from "@/components/article-card";
import ImagePlaceholder from "@/components/image-placeholder";
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

function ServiceIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (icon === "building") {
    return (
      <svg {...common}>
        <rect x="6" y="3" width="12" height="18" />
        <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
      </svg>
    );
  }
  if (icon === "chart") {
    return (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M7 21V13" />
        <path d="M12 21V7" />
        <path d="M17 21v-9" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function renderHeadline(headline: string) {
  const parts = headline.split(/(Actually)/);
  return parts.map((part, i) =>
    part === "Actually" ? (
      <em key={i} className="italic">
        {part}
      </em>
    ) : (
      part
    )
  );
}

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
    .in("category", ["southern-california", "national"])
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
      <section className="relative overflow-hidden px-[4vw] pb-10 pt-6 sm:pt-8 lg:overflow-visible lg:pb-0">
        {/* Mobile-only full-bleed background image with a dark scrim so the
            text stays legible; desktop keeps its own side-by-side image
            column below and never renders this layer. */}
        <div className="absolute inset-0 lg:hidden">
          {hero.image_url ? (
            <Image
              src={hero.image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder
              label="Hero — San Diego Architecture"
              className="absolute inset-0"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/40 to-navy/10" />
        </div>

        {/* Mobile hero — unchanged full-bleed image with headline overlay */}
        <div className="relative grid min-h-[560px] gap-8 lg:hidden">
          <div className="flex flex-col justify-end py-6">
            <p className="eyebrow text-gold">{hero.location_label}</p>
            <h1 className="mt-3 font-display text-6xl font-normal leading-[0.98] text-cream max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em] sm:text-7xl">
              {renderHeadline(hero.headline)}
            </h1>
            <p className="mt-6 max-w-sm text-base text-cream/90 sm:text-lg">
              {hero.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={hero.cta_primary_href}
                className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
              >
                {hero.cta_primary_label} &rarr;
              </Link>
              <Link
                href={hero.cta_secondary_href}
                className="border border-cream px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-navy"
              >
                {hero.cta_secondary_label} &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop hero — editorial composition: photograph first, headline below */}
        <div className="relative hidden lg:block">
          <div className="relative w-[92%] lg:h-[560px]">
            {hero.image_url ? (
              <>
                <Image
                  src={hero.image_url}
                  alt=""
                  fill
                  priority
                  sizes="92vw"
                  className="object-cover"
                />
                <p className="eyebrow absolute right-4 top-4 bg-cream/90 px-2 py-1 text-navy">
                  {hero.location_label}
                </p>
              </>
            ) : (
              <ImagePlaceholder
                label="Hero — San Diego Architecture"
                className="absolute inset-0"
              />
            )}
          </div>

          <div className="mt-8 grid grid-cols-[65fr_35fr] items-start gap-x-16">
            <div>
              <p className="eyebrow-sm text-gold">{hero.location_label}</p>
              <h1 className="font-georgia mt-3 text-[clamp(54px,4vw,69px)] font-bold leading-[0.95] tracking-[-0.025em] text-navy">
                {renderHeadline(hero.headline)}
              </h1>
            </div>
            <div className="pt-14">
              <p className="text-lg text-navy/70">{hero.subhead}</p>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                <Link
                  href={hero.cta_primary_href}
                  className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  {hero.cta_primary_label} &rarr;
                </Link>
                <Link
                  href={hero.cta_secondary_href}
                  className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  {hero.cta_secondary_label} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="px-[4vw] pb-12 pt-12 lg:pt-6">
        <div className="flex items-end justify-between gap-4 border-b border-sand pb-3">
          <p className="eyebrow text-gold">Featured Listings</p>
          <Link
            href="/listings"
            className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4 lg:hidden"
          >
            View All Listings &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {featuredListings.length === 0 && (
            <p className="text-navy/60">
              Listings will appear here once added in the admin panel.
            </p>
          )}
        </div>
        <Link
          href="/listings"
          className="eyebrow mt-6 hidden text-navy underline decoration-gold decoration-2 underline-offset-4 lg:block lg:w-fit"
        >
          View All Listings &rarr;
        </Link>
      </section>

      {/* Market, Right Now */}
      <section className="bg-[#f7f3ea] py-16">
        <div className="px-[4vw]">
          <p className="eyebrow text-gold">The Market, Right Now</p>
          <div className="mt-6 grid lg:grid-cols-[35fr_30fr_35fr]">
            {/* Lead story */}
            <div className="lg:pr-10">
              {marketReport && (
                <>
                  <h3 className="font-display text-4xl font-normal leading-[1.05] text-navy max-[600px]:text-[26px] max-[600px]:leading-[1.12] sm:text-5xl">
                    {marketReport.title}
                  </h3>
                  {marketReport.excerpt && (
                    <p className="mt-4 max-w-sm text-navy/70">
                      {marketReport.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/insights/${marketReport.slug}`}
                    className="mt-5 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
                  >
                    Read the Full Report &rarr;
                  </Link>
                </>
              )}
            </div>

            {/* Chart */}
            <div className="mt-8 border-l border-navy/15 px-8 lg:mt-3">
              <MarketChart data={marketChart} />
            </div>

            {/* Supporting stories */}
            <div className="mt-10 border-l border-navy/15 pl-8 lg:mt-3">
              {sideArticles[0] && (
                <div className="flex gap-5">
                  {sideArticles[0].image_url && (
                    <div className="relative aspect-4/5 w-[38%] shrink-0 overflow-hidden">
                      <Image
                        src={sideArticles[0].image_url}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <p className="eyebrow text-gold">
                      {CATEGORY_LABELS[sideArticles[0].category] ??
                        sideArticles[0].category}
                    </p>
                    <h4 className="mt-1 line-clamp-3 font-display text-xl font-semibold leading-snug text-navy">
                      {sideArticles[0].title}
                    </h4>
                    {sideArticles[0].excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-navy/70">
                        {sideArticles[0].excerpt}
                      </p>
                    )}
                    <Link
                      href={`/insights/${sideArticles[0].slug}`}
                      className="mt-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
                    >
                      Read More &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {sideArticles[1] && (
                <>
                  <div className="my-5 border-t border-navy/15" />
                  <div className="flex flex-row-reverse gap-5">
                    {sideArticles[1].image_url && (
                      <div className="relative aspect-4/5 w-[38%] shrink-0 overflow-hidden">
                        <Image
                          src={sideArticles[1].image_url}
                          alt=""
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col">
                      <p className="eyebrow text-gold">
                        {CATEGORY_LABELS[sideArticles[1].category] ??
                          sideArticles[1].category}
                      </p>
                      <h4 className="mt-1 line-clamp-3 font-display text-xl font-semibold leading-snug text-navy">
                        {sideArticles[1].title}
                      </h4>
                      {sideArticles[1].excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-navy/70">
                          {sideArticles[1].excerpt}
                        </p>
                      )}
                      <Link
                        href={`/insights/${sideArticles[1].slug}`}
                        className="mt-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
                      >
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>
                </>
              )}

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


      {/* A Broader Perspective */}
      <section className="lg:h-[420px]">
        <div className="grid lg:h-full lg:grid-cols-[54fr_46fr]">
          <div className="relative h-[280px] lg:h-full">
            {about.portrait_url ? (
              <Image
                src={about.portrait_url}
                alt=""
                fill
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder
                label="Editorial — San Diego"
                className="absolute inset-0"
              />
            )}
          </div>
          <div className="flex flex-col justify-center px-[8%] py-10 lg:py-0">
            <p className="eyebrow text-gold">A Broader Perspective</p>
            <h2 className="mt-3 font-display text-3xl font-normal leading-tight text-navy max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[30px] max-[600px]:font-bold max-[600px]:leading-[1.02] max-[600px]:tracking-[-0.015em] lg:text-4xl">
              Real Estate Is a People Business.
            </h2>
            <p className="mt-4 max-w-md text-navy/70">{about.quote}</p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
            >
              More About Me &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How I Can Help */}
      <section className="px-[4vw] py-10">
        <p className="eyebrow text-gold">How I Can Help</p>
        <h2 className="mt-2 max-w-md font-display text-2xl font-normal leading-tight text-navy sm:text-3xl lg:max-w-none lg:text-4xl">
          Real Estate, Broader Perspective.
        </h2>

        <div className="mt-8 border-t border-navy/10 pt-6 lg:grid lg:h-[210px] lg:grid-cols-[1fr_1fr_1fr_1.45fr] lg:items-stretch lg:gap-8">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={
                i > 0
                  ? "mt-8 border-t border-navy/10 pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:border-navy/15 lg:pl-8 lg:pt-0"
                  : ""
              }
            >
              <ServiceIcon
                icon={service.icon}
                className="h-6 w-6 text-navy/60"
              />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">
                {service.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-navy/70">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-2 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
              >
                Learn More &rarr;
              </Link>
            </div>
          ))}

          {/* Mark Scott */}
          <div className="mt-8 flex items-end gap-4 border-t border-navy/10 pt-6 lg:mt-0 lg:h-full lg:items-stretch lg:border-t-0 lg:border-l lg:border-navy/15 lg:pl-8 lg:pt-0">
            <div className="max-w-[11rem] lg:flex lg:w-[45%] lg:flex-col lg:justify-center">
              <p className="font-[family-name:var(--font-hand)] text-xl leading-snug text-navy sm:text-2xl">
                Curious people
                <br />
                build better
                <br />
                places.
              </p>
              <p className="eyebrow mt-3 text-navy/50">Mark Scott</p>
            </div>
            <div className="relative h-[130px] w-[110px] shrink-0 sm:h-[150px] sm:w-[125px] lg:h-full lg:w-[55%]">
              {about.headshot_url ? (
                <Image
                  src={about.headshot_url}
                  alt="Mark Scott"
                  fill
                  sizes="180px"
                  className="object-contain object-bottom"
                />
              ) : (
                <ImagePlaceholder
                  label="Mark — Illustration"
                  className="absolute inset-0"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-ink px-[4vw] py-14 text-ink-cream lg:py-16">
        <Image
          src="/images/footer-coast.png"
          alt=""
          width={2172}
          height={724}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 hidden h-auto w-[920px] opacity-85 lg:block"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="eyebrow text-blue">{newsletter.tagline_line1}</p>
          <h2 className="mt-4 font-display text-4xl font-normal max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[30px] max-[600px]:font-bold max-[600px]:leading-[1.02] max-[600px]:tracking-[-0.015em] sm:text-5xl">
            {newsletter.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
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
