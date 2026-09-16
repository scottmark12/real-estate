import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import { btnPrimary } from "@/components/admin/ui";
import AdminListingsGrid from "@/components/admin/admin-listings-grid";

export const revalidate = 0;

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const listings = (data as Listing[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Listings</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            All Listings
          </h1>
          <p className="mt-2 text-sm text-navy/50">
            Drag a card (or use the arrows) to set the order listings appear
            in across the site.
          </p>
        </div>
        <Link href="/admin/listings/new" className={btnPrimary}>
          + New Listing
        </Link>
      </div>

      <AdminListingsGrid listings={listings} />
    </div>
  );
}
