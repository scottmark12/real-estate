import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImagePlaceholder from "@/components/image-placeholder";
import { CATEGORY_LABELS } from "@/components/article-card";
import type { Article, Listing } from "@/lib/types";

export const revalidate = 0;

const PRIMARY_PATHS = [
  {
    title: "Buy",
    body: "Homes, investments & opportunities.",
    href: "/buy",
  },
  {
    title: "Sell",
    body: "A thoughtful approach.",
    href: "/sell",
  },
  {
    title: "Learn",
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
      {/* Hero / cover — mobile */}
      <section className="overflow-hidden pt-8 lg:hidden">
        <p className="eyebrow text-gold">Real Estate</p>
        <h1 className="relative z-20 mt-2 font-display text-[38px] font-normal leading-[0.95] text-navy">
          <span className="block">Real Estate,</span>
          <span className="block">Real Different.</span>
        </h1>
        <p className="relative z-20 mt-4 max-w-[62%] text-[15px] text-navy/70">
          Homes, buildings, and opportunities in San Diego and beyond.
        </p>

        <div className="relative z-20 mt-5 w-[42%] max-w-[165px] -rotate-2">
          <Image
            src="/images/handwriting-curiosity.png"
            alt="Curiosity is good due diligence! —MS"
            width={816}
            height={211}
            className="h-auto w-full"
          />
        </div>

        <div className="relative z-10 -mt-10 mb-8 w-[124%]">
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
            <h1 className="font-display text-[120px] font-normal leading-[0.95] text-navy">
              <span className="block whitespace-nowrap">Real Estate,</span>
              <span className="block whitespace-nowrap">Real Different.</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[22.8px] text-navy/70">
              Homes, buildings, and opportunities in San Diego and beyond.
            </p>
          </div>

          <div className="absolute left-[247px] top-[500px] z-10 w-[320px] rotate-[-4deg]">
            <Image
              src="/images/handwriting-curiosity.png"
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
              Residential &middot; Commercial &middot; Research
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
              className="flex items-center justify-center gap-1.5 py-1 font-display text-[17px] text-navy"
            >
              {p.title}
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

      {/* On My Radar — mobile */}
      {radar && (
        <section className="mt-[54px] lg:hidden">
          <p className="eyebrow text-gold">
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

          <div className="mt-5 flex flex-col">
            <p className="eyebrow text-gold">
              {radar.eyebrow || CATEGORY_LABELS[radar.category] || radar.category}
            </p>
            <h2 className="mt-2.5 font-display text-[30px] font-normal leading-[1.1] text-navy">
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
