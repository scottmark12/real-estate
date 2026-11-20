import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import FeedListingCard from "@/components/feed-listing-card";
import FilterToggle from "@/components/filter-toggle";
import SaveSearchForm from "@/components/save-search-form";
import { type AlertParams, describeParams } from "@/lib/listing-alerts";
import ListingsComingSoon from "@/components/listings-coming-soon";
import { BROKERAGE_CREDIT, PAGE_SIZE, PROPERTY_TYPES, SORTS, searchListings } from "@/lib/premier-feed";
import { getFeaturedListings } from "@/lib/featured-listings";

export const metadata: Metadata = {
  title: "Homes for Sale in San Diego County",
  description:
    "Search every home for sale in San Diego County, live from the MLS: Encinitas, Carlsbad, La Jolla, Del Mar and beyond. Save homes and get new listings by email.",
  // Every filtered or searched version points Google back to the main page.
  alternates: { canonical: "/buy" },
};

const PRICE_OPTIONS = [
  500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000,
];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function short(n: number) {
  return n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}K`;
}

const field =
  "w-full bg-white px-5 py-4 text-sm text-navy placeholder:text-navy/40 focus:bg-cream-deep focus:outline-none";

const SD_CITIES = [
  "Alpine", "Bonita", "Bonsall", "Cardiff By The Sea", "Carlsbad", "Chula Vista",
  "Coronado", "Del Mar", "El Cajon", "Encinitas", "Escondido", "Fallbrook",
  "Imperial Beach", "Julian", "La Jolla", "La Mesa", "Lakeside", "Lemon Grove",
  "National City", "Oceanside", "Poway", "Ramona", "Rancho Santa Fe", "San Diego",
  "San Marcos", "Santee", "Solana Beach", "Spring Valley", "Valley Center", "Vista",
];

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  const sp = await searchParams;
  // What the visitor typed wins over a neighborhood's pinned filters, and a
  // zip anywhere in it ("Encinitas, CA 92024") becomes a real zip filter.
  const typed = (one(sp.q) ?? "").trim();
  const typedZip = typed.match(/\b(9\d{4})(?:-\d{4})?\b/)?.[1] ?? "";
  const typedRest = typed
    .replace(/\b9\d{4}(?:-\d{4})?\b/, " ")
    .replace(/,?\s*\b(CA|California)\b\.?/i, " ")
    .replace(/[,\s]+/g, " ")
    .trim();
  const typedPlace = typedZip ? typedRest : typed.replace(/,?\s*\b(CA|California)\b\.?$/i, "").trim();
  // A known city becomes an exact city filter; anything else stays a keyword.
  const typedCity = SD_CITIES.find((c) => c.toLowerCase() === typedPlace.toLowerCase()) ?? "";
  const q = typedCity ? "" : typedPlace;
  const city = typedCity || (typed ? "" : one(sp.city) ?? "");
  const zip = typedZip || (typed ? "" : one(sp.zip) ?? "");
  const area = typed ? "" : one(sp.area) ?? "";
  const searchText = typed;
  const min_price = one(sp.min_price) ?? "";
  const max_price = one(sp.max_price) ?? "";
  const min_beds = one(sp.min_beds) ?? "";
  const property_type = one(sp.type) ?? "";
  const sort = one(sp.sort) ?? "recent";
  const page = Math.max(1, Math.floor(Number(one(sp.page)) || 1));

  const filtering = Boolean(
    q || city || zip || min_price || max_price || min_beds || property_type
  );
  const compact = filtering || page > 1;
  const [result, featured] = await Promise.all([
    searchListings({ q, city, zip, min_price, max_price, min_beds, property_type, sort, page }),
    !filtering && page === 1 ? getFeaturedListings(6) : Promise.resolve([]),
  ]);

  // Feed down: fall back to the coming soon page rather than an error.
  if (!result) return <ListingsComingSoon />;

  const hasNext = page * PAGE_SIZE < result.total;
  const alertParams: AlertParams = {
    q: q || undefined,
    city: city || undefined,
    zip: zip || undefined,
    area: area || undefined,
    min_price: min_price || undefined,
    max_price: max_price || undefined,
    min_beds: min_beds || undefined,
    property_type: property_type || undefined,
  };
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    else {
      if (city) params.set("city", city);
      if (zip) params.set("zip", zip);
      if (area) params.set("area", area);
    }
    if (min_price) params.set("min_price", min_price);
    if (max_price) params.set("max_price", max_price);
    if (min_beds) params.set("min_beds", min_beds);
    if (property_type) params.set("type", property_type);
    if (sort !== "recent") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/buy?${s}` : "/buy";
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-20 max-[600px]:pb-12 sm:px-10 lg:px-12">
      {/* Photo header with the search on top of it */}
      {/* Tall enough to set the scene, short enough that homes peek up from below.
          After a search it shrinks to a banner so results show right away. */}
      <section className={`full-bleed relative flex items-end overflow-hidden ${compact ? "min-h-[40svh]" : "min-h-[75svh]"}`}>
        <Image
          src="https://images.unsplash.com/photo-1773099032238-6aaee4fb7f18?auto=format&fit=crop&w=2400&q=85"
          alt="A modern coastal home under palm trees and a clear blue sky"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className={`relative mx-auto w-full max-w-[1400px] px-6 pt-28 sm:px-10 lg:px-12 ${compact ? "pb-8 lg:pb-10" : "pb-12 lg:pb-16"}`}>
      <p className="eyebrow text-white/75">Buy</p>
      <h1 className={`mt-3 max-w-3xl font-georgia font-normal leading-[1.02] tracking-[-0.01em] text-white ${compact ? "text-[34px] sm:text-[44px] lg:text-[52px]" : "text-[42px] sm:text-[60px] lg:text-[72px]"}`}>
        {area ? `Homes for sale in ${area}.` : "Find your place in San Diego."}
      </h1>
      {area && (
        <p className="mt-3 text-sm text-white/75">
          <Link href={`/neighborhoods`} className="underline decoration-gold underline-offset-4">
            About the neighborhoods
          </Link>
          <span className="mx-2 text-white/40">&middot;</span>
          <Link href="/buy" className="underline decoration-gold underline-offset-4">
            Search all of San Diego County
          </Link>
        </p>
      )}
      {!compact && (
        <p className="mt-5 max-w-xl text-lg text-white max-[600px]:text-base">
          Every home for sale in San Diego County, live from the MLS. See one you
          like? I&apos;ll tell you what the listing doesn&apos;t.
        </p>
      )}

      <form
        action="/buy"
        method="get"
        className={`${compact ? "mt-6" : "mt-10"} grid gap-px bg-navy/10 shadow-2xl sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr_1fr_1fr_auto]`}
      >
        {city && <input type="hidden" name="city" value={city} />}
        {zip && <input type="hidden" name="zip" value={zip} />}
        {area && <input type="hidden" name="area" value={area} />}
        <label className="sr-only" htmlFor="q">City, zip or address</label>
        <input
          id="q"
          name="q"
          defaultValue={searchText}
          placeholder="City, zip or address"
          className={field}
        />
        <FilterToggle active={[min_price, max_price, min_beds, property_type, sort !== "recent" ? sort : ""].filter(Boolean).length}>
        <label className="sr-only" htmlFor="min_price">Min price</label>
        <select id="min_price" name="min_price" defaultValue={min_price} className={field}>
          <option value="">Min price</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p} value={p}>{short(p)}+</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="max_price">Max price</label>
        <select id="max_price" name="max_price" defaultValue={max_price} className={field}>
          <option value="">Max price</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p} value={p}>Up to {short(p)}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="min_beds">Beds</label>
        <select id="min_beds" name="min_beds" defaultValue={min_beds} className={field}>
          <option value="">Any beds</option>
          {[1, 2, 3, 4, 5].map((b) => (
            <option key={b} value={b}>{b}+ beds</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="type">Home type</label>
        <select id="type" name="type" defaultValue={property_type} className={field}>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="sort">Sort</label>
        <select id="sort" name="sort" defaultValue={sort} className={field}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        </FilterToggle>
        <button
          type="submit"
          className="bg-ink px-8 py-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-blue"
        >
          Search
        </button>
      </form>
        </div>
        <p className="absolute bottom-3 right-3 text-[10px] text-white/60">
          Photo:{" "}
          <a
            href="https://unsplash.com/@jkmatt?utm_source=markscott&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Jon Matthews
          </a>{" "}
          / Unsplash
        </p>
      </section>

      {featured.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-georgia text-[36px] leading-none text-navy sm:text-[44px]">Featured</h2>
            <p className="text-sm text-navy/50">Hand picked by Mark</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <FeedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Alerts sit after the featured homes so the homes peek above the fold. */}
      <div className={featured.length > 0 ? "mt-16" : "mt-10"}>
        <SaveSearchForm params={alertParams} label={describeParams(alertParams)} />
      </div>

      <div className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
          <h2 className="font-georgia text-[36px] leading-none text-navy sm:text-[44px]">
            {area ? `In ${area}` : searchText ? `Homes in ${searchText}` : "All homes for sale"}
          </h2>
          <p className="mt-3 text-sm text-navy/50">
            {result.listings.length === 0
              ? "No homes match that search."
              : `${result.total.toLocaleString()} homes${page > 1 ? `, page ${page}` : ""}`}
          </p>
          </div>
          <Link
            href="/contact?intent=buying"
            className="eyebrow shrink-0 text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Want off market homes too? &rarr;
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {result.listings.map((listing) => (
            <FeedListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {(page > 1 || hasNext) && (
          <nav className="mt-14 flex items-center justify-between" aria-label="Pages">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="eyebrow text-navy hover:text-blue">
                &larr; Previous
              </Link>
            ) : (
              <span />
            )}
            {hasNext && (
              <Link href={pageHref(page + 1)} className="eyebrow text-navy hover:text-blue">
                Next &rarr;
              </Link>
            )}
          </nav>
        )}

        <p className="mt-14 max-w-3xl text-xs leading-relaxed text-navy/50">
          {BROKERAGE_CREDIT}
        </p>
      </div>
    </div>
  );
}
