import { notFound } from "next/navigation";
import ListingForm from "@/components/admin/listing-form";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

export default async function EditListingPage({
  params,
}: PageProps<"/admin/listings/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const listing = data as Listing | null;
  if (!listing) notFound();

  return (
    <div>
      <p className="eyebrow text-gold">Listings</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Edit Listing
      </h1>
      <div className="mt-8">
        <ListingForm listing={listing} />
      </div>
    </div>
  );
}
