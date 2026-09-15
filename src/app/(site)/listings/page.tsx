import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingCategory, ListingStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/format";

export const revalidate = 0;

const STATUS_OPTIONS: ListingStatus[] = [
  "for_sale",
  "investment",
  "off_market",
  "sold",
];

const CATEGORY_LABELS: Record<ListingCategory, string> = {
  residential: "Residential",
  multifamily: "Multifamily",
  development: "Development",
};

export default async function ListingsPage({
  searchParams,
}: PageProps<"/listings">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const category =
    typeof params.category === "string" ? params.category : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);

  const { data } = await query;
  const listings = (data as Listing[]) ?? [];

  function hrefFor(next: { status?: string; category?: string }) {
    const p = new URLSearchParams();
    const s = next.status !== undefined ? next.status : status;
    const c = next.category !== undefined ? next.category : category;
    if (s) p.set("status", s);
    if (c) p.set("category", c);
    const qs = p.toString();
    return qs ? `/listings?${qs}` : "/listings";
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <p className="eyebrow text-gold">Listings</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        All Listings
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={hrefFor({ status: undefined })}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !status
              ? "border-navy bg-navy text-cream"
              : "border-navy/20 text-navy/70"
          }`}
        >
          All Statuses
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={hrefFor({ status: s })}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              status === s
                ? "border-navy bg-navy text-cream"
                : "border-navy/20 text-navy/70"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={hrefFor({ category: undefined })}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !category
              ? "border-gold bg-gold text-navy"
              : "border-navy/20 text-navy/70"
          }`}
        >
          All Categories
        </Link>
        {(Object.keys(CATEGORY_LABELS) as ListingCategory[]).map((c) => (
          <Link
            key={c}
            href={hrefFor({ category: c })}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === c
                ? "border-gold bg-gold text-navy"
                : "border-navy/20 text-navy/70"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {listings.length === 0 && (
          <p className="text-navy/60">No listings match these filters.</p>
        )}
      </div>
    </div>
  );
}
