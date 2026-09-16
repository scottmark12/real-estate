import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { btnPrimary, tag } from "@/components/admin/ui";
import { deleteListing, toggleListingField } from "./actions";

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
        </div>
        <Link href="/admin/listings/new" className={btnPrimary}>
          + New Listing
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border-t border-sand">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="eyebrow px-4 py-3 font-medium">Title</th>
              <th className="eyebrow px-4 py-3 font-medium">Status</th>
              <th className="eyebrow px-4 py-3 font-medium">Price</th>
              <th className="eyebrow px-4 py-3 font-medium">Published</th>
              <th className="eyebrow px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b border-sand/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{listing.title}</p>
                  <p className="text-xs text-navy/50">{listing.location}</p>
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {STATUS_LABELS[listing.status]}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {formatPrice(listing)}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleListingField}>
                    <input type="hidden" name="id" value={listing.id} />
                    <input type="hidden" name="field" value="published" />
                    <input
                      type="hidden"
                      name="value"
                      value={(!listing.published).toString()}
                    />
                    <button
                      type="submit"
                      className={`${tag} ${
                        listing.published
                          ? "border-navy bg-navy text-cream"
                          : "border-navy/20 text-navy/50"
                      }`}
                    >
                      {listing.published ? "Published" : "Draft"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleListingField}>
                    <input type="hidden" name="id" value={listing.id} />
                    <input type="hidden" name="field" value="featured" />
                    <input
                      type="hidden"
                      name="value"
                      value={(!listing.featured).toString()}
                    />
                    <button
                      type="submit"
                      className={`${tag} ${
                        listing.featured
                          ? "border-gold bg-gold text-navy"
                          : "border-navy/20 text-navy/50"
                      }`}
                    >
                      {listing.featured ? "Featured" : "—"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                    >
                      Edit
                    </Link>
                    <form action={deleteListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <button type="submit" className="text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  No listings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
