import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import ListingCard from "@/components/listing-card";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatStats } from "@/lib/format";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

function heroMetadata(listing: Listing) {
  const city = listing.location.split(",")[0]?.trim();
  const detail =
    listing.acres != null
      ? `${listing.acres} acres`
      : listing.sqft != null
        ? `${new Intl.NumberFormat("en-US").format(listing.sqft)} sqft`
        : null;
  return [city, detail].filter(Boolean).join(" · ");
}

export default async function BuyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("published", true)
    .eq("status", "for_sale")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const listings = (data as Listing[]) ?? [];
  // If more than one is marked Featured, the first by sort order wins —
  // predictable rather than rendering more than one hero.
  const featured = listings.find((l) => l.featured) ?? null;
  const gridListings = featured
    ? listings.filter((l) => l.id !== featured.id)
    : listings;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">Buy</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy sm:text-5xl">
        Homes worth looking at.
      </h1>

      {featured && (
        <section className="mt-10">
          <Link
            href={`/listings/${featured.slug}`}
            className="group grid gap-8 lg:grid-cols-[65fr_35fr] lg:items-stretch"
          >
            <div className="relative aspect-16/9 w-full overflow-hidden lg:aspect-auto">
              {featured.image_url ? (
                <Image
                  src={featured.image_url}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ objectPosition: featured.featured_focal || "50% 50%" }}
                />
              ) : (
                <ImagePlaceholder label="Featured Listing" className="absolute inset-0" />
              )}
              <p className="eyebrow absolute bottom-4 left-4 text-cream">
                {heroMetadata(featured)}
              </p>
            </div>

            <div className="flex flex-col justify-center py-2">
              <p className="eyebrow text-gold">Featured Property</p>
              <p className="eyebrow mt-2 text-navy/50">{featured.location}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
                {featured.featured_headline || featured.title}
              </h2>
              {featured.featured_headline && (
                <p className="mt-2 text-sm text-navy/50">{featured.title}</p>
              )}
              <p className="mt-4 text-sm text-navy/70">{formatStats(featured)}</p>
              <p className="mt-3 font-display text-3xl font-semibold text-navy">
                {formatPrice(featured)}
              </p>
              {featured.featured_excerpt && (
                <p className="mt-4 max-w-md text-navy/70">{featured.featured_excerpt}</p>
              )}
              <span className="eyebrow mt-6 inline-flex w-fit items-center gap-2 border border-navy px-5 py-3 text-navy transition-colors group-hover:bg-navy group-hover:text-cream">
                View the Property
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <div className={`${featured ? "mt-14" : "mt-10"} border-t border-sand pt-8`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Available Now
            </h2>
            <p className="text-sm text-navy/60">Homes currently on the market.</p>
          </div>
          <Link
            href="/contact"
            className="eyebrow shrink-0 text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Have something specific in mind? &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {gridListings.length === 0 && (
            <p className="text-navy/60">
              {featured
                ? "No other active for-sale listings right now — check back soon."
                : "No active for-sale listings right now — check back soon."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
