import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

export default async function InvestPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("published", true)
    .in("category", ["multifamily", "development"])
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const listings = (data as Listing[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">Invest</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Investment &amp; Development Opportunities
      </h1>
      <p className="mt-3 max-w-xl text-navy/70">
        Multifamily and development properties across San Diego County,
        underwritten with real numbers.{" "}
        <Link href="/contact" className="underline decoration-gold">
          Talk to Mark
        </Link>
        .
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {listings.length === 0 && (
          <p className="text-navy/60">
            No investment opportunities listed right now — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
