import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImagePlaceholder from "@/components/image-placeholder";
import { CATEGORY_LABELS } from "@/components/article-card";
import type { Article, Listing } from "@/lib/types";

export const revalidate = 0;

const PRIMARY_PATHS = [
  {
    n: "01",
    title: "Buy",
    body: "Homes worth living in.",
    href: "/buy",
  },
  {
    n: "02",
    title: "Sell",
    body: "A thoughtful approach.",
    href: "/sell",
  },
  {
    n: "03",
    title: "Invest",
    body: "Off-market opportunities.",
    href: "/invest",
  },
  {
    n: "04",
    title: "Market Research",
    body: "What's actually happening.",
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
  const listings = (listingsRes.data as Listing[] | null) ?? [];

  const items: ElsewhereItem[] = [
    ...articles.map((a) => ({
      order: a.homepage_elsewhere_order,
      category: a.eyebrow || CATEGORY_LABELS[a.category] || a.category,
      title: a.title,
      cta: a.cta_label || "Read More →",
      href: `/insights/${a.slug}`,
    })),
    ...listings.map((l) => ({
      order: l.homepage_elsewhere_order,
      category: LISTING_STATUS_LABELS[l.status] || "Listing",
      title: l.title,
      cta: "View Homes →",
      href: `/listings/${l.slug}`,
    })),
  ];

  return items.sort((a, b) => a.order - b.order).slice(0, 3);
}

export default async function HomePage() {
  const [radar, elsewhere] = await Promise.all([
    getOnMyRadar(),
    getElsewhere(),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-12">
      {/* Hero / cover */}
      <section className="pt-10">
        <div className="relative flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-x-0 lg:gap-y-0">
          <div className="lg:relative lg:z-20 lg:col-start-1 lg:row-start-1 lg:self-start lg:pl-32">
            <h1 className="font-display text-[38px] font-normal leading-[0.95] text-navy sm:text-[64px] lg:text-[120px]">
              <span className="block whitespace-nowrap">Real Estate,</span>
              <span className="block whitespace-nowrap">Real Different.</span>
            </h1>
            <p className="mt-5 max-w-sm text-navy/70 lg:max-w-[560px] lg:text-[22.8px]">
              Homes, buildings, and opportunities in San Diego and beyond.
            </p>
          </div>

          <div className="relative w-full max-w-[240px] lg:absolute lg:left-[247px] lg:top-[500px] lg:z-10 lg:w-[320px] lg:max-w-none lg:rotate-[-4deg]">
            <Image
              src="/images/handwriting-curiosity.png"
              alt="Curiosity is good due diligence! —MS"
              width={816}
              height={211}
              className="h-auto w-full"
            />
          </div>

          <div className="relative lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:-ml-28 lg:w-[120%] lg:self-end lg:-mb-16">
            <Image
              src="/images/mark-illustration-v2.png"
              alt="Mark Scott"
              width={1000}
              height={999}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
            <p className="eyebrow mt-6 text-navy/40 lg:mt-0">
              Residential &middot; Commercial &middot; Research
              <br />
              San Diego, California
            </p>
          </div>
        </div>
      </section>

      {/* Primary paths */}
      <section className="mt-12 border-t border-sand py-10 lg:mt-8 lg:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-sand">
          {PRIMARY_PATHS.map((p) => (
            <Link
              key={p.n}
              href={p.href}
              className="group block lg:px-8 lg:first:pl-0 lg:last:pr-0"
            >
              <p className="eyebrow text-gold">{p.n}</p>
              <h3 className="mt-2 font-display text-2xl font-normal text-navy">
                {p.title}
              </h3>
              <p className="mt-1 text-sm text-navy/70">{p.body}</p>
              <span className="mt-3 inline-block text-navy transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* On My Radar */}
      {radar && (
        <section className="border-t border-sand pt-10 lg:pt-14">
          <div className="grid gap-8 lg:grid-cols-[64px_57fr_38fr] lg:gap-x-10">
            <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
              <p className="eyebrow leading-tight text-gold">
                On
                <br className="hidden lg:block" /> My
                <br className="hidden lg:block" /> Radar
              </p>
              <div className="h-px w-10 bg-gold lg:h-10 lg:w-px" />
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
                  sizes="(min-width: 1024px) 57vw, 100vw"
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
              </p>
              <h2 className="mt-3 font-display text-[30px] font-normal leading-[1.1] text-navy sm:text-[36px]">
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

      {/* Elsewhere */}
      {elsewhere.length > 0 && (
        <section className="mt-14 border-t border-sand pb-16 pt-10">
          <p className="eyebrow text-gold">Elsewhere</p>
          <div className="mt-6 grid gap-10 sm:grid-cols-3 sm:divide-x sm:divide-sand">
            {elsewhere.map((item, i) => (
              <div key={i} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <p className="eyebrow text-navy/50">{item.category}</p>
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
    </div>
  );
}
