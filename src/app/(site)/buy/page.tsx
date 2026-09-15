import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">Buy</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Homes For Sale
      </h1>
      <p className="mt-3 max-w-xl text-navy/70">
        Current for-sale listings across San Diego. Looking for something
        specific?{" "}
        <Link href="/contact" className="underline decoration-gold">
          Get in touch
        </Link>
        .
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        {listings.length === 0 && (
          <p className="text-navy/60">
            No active for-sale listings right now — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
