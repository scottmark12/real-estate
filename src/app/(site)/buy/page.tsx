import type { Metadata } from "next";
import Link from "next/link";
import FeedListingCard from "@/components/feed-listing-card";
import ListingsComingSoon from "@/components/listings-coming-soon";
import {
  BROKERAGE_CREDIT,
  PAGE_SIZE,
  PROPERTY_TYPES,
  SORTS,
  searchListings,
} from "@/lib/premier-feed";

export const metadata: Metadata = {
  title: "Homes for Sale in San Diego County",
  description:
    "Search homes for sale across San Diego County, updated through the day. Ask Mark about any of them.",
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
  "w-full border border-sand bg-white px-3 py-2.5 text-sm text-navy focus:border-blue focus:outline-none";

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  const sp = await searchParams;
  const q = one(sp.q) ?? "";
  const min_price = one(sp.min_price) ?? "";
  const max_price = one(sp.max_price) ?? "";
  const min_beds = one(sp.min_beds) ?? "";
  const property_type = one(sp.type) ?? "";
  const sort = one(sp.sort) ?? "recent";
  const page = Math.max(1, Math.floor(Number(one(sp.page)) || 1));

  const result = await searchListings({
    q,
    min_price,
    max_price,
    min_beds,
    property_type,
    sort,
    page,
  });

  // Feed down: fall back to the coming soon page rather than an error.
  if (!result) return <ListingsComingSoon />;

  const hasNext = page * PAGE_SIZE < result.total;
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
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
    <div className="mx-auto max-w-6xl px-6 py-20 max-[600px]:py-12 sm:px-10">
      <p className="eyebrow text-gold">Buy</p>
      <h1 className="mt-2 font-display text-4xl font-normal text-navy max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em] sm:text-5xl">
        Homes for sale across San Diego County.
      </h1>
      <p className="mt-4 max-w-xl text-navy/70">
        Live from the MLS and updated through the day. See one you like? Ask me
        about it and I&apos;ll tell you what the listing doesn&apos;t.
      </p>

      <form
        action="/buy"
        method="get"
        className="mt-10 grid gap-3 border border-sand bg-cream-deep p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
      >
        <label className="sr-only" htmlFor="q">City, zip or address</label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="City, zip or address"
          className={field}
        />
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
        <button
          type="submit"
          className="bg-blue px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
        >
          Search
        </button>
      </form>

      <div className="mt-10 border-t border-sand pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-navy/60">
            {result.listings.length === 0
              ? "No homes match that search."
              : `Showing page ${page}${q ? ` for “${q}”` : ""}`}
          </p>
          <Link
            href="/contact?intent=buying"
            className="eyebrow shrink-0 text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Want off market homes too? &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
