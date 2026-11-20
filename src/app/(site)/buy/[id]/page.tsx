/* eslint-disable @next/next/no-img-element -- MLS photos load straight from the feed's image host */
import type { Metadata } from "next";
import Link from "next/link";
import HeartToggle from "@/components/heart-toggle";
import { notFound } from "next/navigation";
import {
  BROKERAGE_CREDIT,
  formatFeedPrice,
  formatFeedStats,
  getListing,
  listingImages,
} from "@/lib/premier-feed";
import { JsonLd, breadcrumbLd } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/buy/[id]">): Promise<Metadata> {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) return { title: "Home for Sale", robots: { index: false } };
  const photo = listingImages(l)[0];
  return {
    title: { absolute: `${l.address}, ${l.city}, CA ${l.zip} | ${formatFeedPrice(l.price)}` },
    description: `${formatFeedStats(l)} home for sale at ${l.address}, ${l.city}, CA ${l.zip}, listed at ${formatFeedPrice(l.price)}. Ask Mark Scott for comps, condition and what he would offer.`,
    alternates: { canonical: `/buy/${l.id}` },
    openGraph: photo ? { images: [photo] } : undefined,
  };
}

const MAX_PHOTOS = 13;

export default async function FeedListingPage({ params }: PageProps<"/buy/[id]">) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();

  const photos = listingImages(l).slice(0, MAX_PHOTOS);
  const fullAddress = `${l.address}, ${l.city}, ${l.state} ${l.zip}`;
  const askHref = `/contact?intent=buying&location=${encodeURIComponent(fullAddress)}`;
  const mapHref =
    l.latitude && l.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const facts: [string, string | number | null | undefined][] = [
    ["MLS #", l.listing_id],
    ["Type", l.property_sub_type?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? l.property_type],
    ["Year built", l.year_built],
    ["Lot", l.lot_sqft ? `${new Intl.NumberFormat("en-US").format(l.lot_sqft)} sqft` : null],
    ["Days on market", l.days_on_market],
    ["County", l.county],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
      <JsonLd
        data={breadcrumbLd([
          { name: "Homes for Sale", path: "/buy" },
          { name: fullAddress, path: `/buy/${l.id}` },
        ])}
      />
      <Link href="/buy" className="text-sm text-navy/60 hover:text-navy">
        &larr; Back to search
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="eyebrow text-gold">For Sale</p>
        <HeartToggle id={l.id} withLabel />
      </div>
      <h1 className="mt-2 font-display text-4xl font-normal text-navy max-[600px]:text-[28px] max-[600px]:leading-[1.1]">
        {l.address}
      </h1>
      <p className="mt-1 text-lg text-navy/60 max-[600px]:text-sm">
        {l.city}, {l.state} {l.zip}
      </p>

      {photos.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="col-span-2 aspect-16/10 overflow-hidden bg-cream-deep sm:col-span-3">
            <img src={photos[0]} alt={fullAddress} fetchPriority="high" className="h-full w-full object-cover" />
          </div>
          {photos.slice(1).map((url, i) => (
            <div key={url} className="aspect-4/3 overflow-hidden bg-cream-deep">
              <img
                src={url}
                alt={`${l.address} photo ${i + 2}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-2xl font-normal text-navy">About this home</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-navy/75">
            {l.description?.trim() || "More details coming soon."}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-sand pt-8 sm:grid-cols-3">
            {facts
              .filter(([, v]) => v != null && v !== "")
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-navy/50">{k}</dt>
                  <dd className="mt-1 text-sm text-navy">{v}</dd>
                </div>
              ))}
          </dl>
        </div>

        <aside className="h-fit border border-sand p-6 lg:sticky lg:top-24">
          <p className="font-display text-3xl font-normal text-navy">
            {formatFeedPrice(l.price)}
          </p>
          <p className="mt-1 text-sm text-navy/60">{formatFeedStats(l)}</p>
          <Link
            href={askHref}
            className="mt-6 block bg-blue px-5 py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
          >
            Ask Mark About This Home
          </Link>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-navy px-5 py-3 text-center text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            View on Map
          </a>
          <p className="mt-5 text-xs leading-relaxed text-navy/55">
            I represent you, not the seller. Tours, comps and a straight
            answer on price, no pressure.
          </p>
        </aside>
      </div>

      <p className="mt-16 max-w-3xl text-xs leading-relaxed text-navy/50">
        {BROKERAGE_CREDIT}
      </p>
    </div>
  );
}
