"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import { importListingFromUrl, type ListingImportOutcome } from "@/lib/listing-import";

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export async function upsertListing(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const priceDisplay = String(formData.get("price_display") ?? "").trim();
  const priceDollars = formData.get("price_dollars");

  const payload = {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    status: String(formData.get("status") ?? "for_sale"),
    category: String(formData.get("category") ?? "residential"),
    price_cents:
      priceDollars && priceDollars !== ""
        ? Math.round(Number(priceDollars) * 100)
        : null,
    price_display: priceDisplay || null,
    beds: num(formData, "beds"),
    baths: num(formData, "baths"),
    sqft: num(formData, "sqft"),
    acres: num(formData, "acres"),
    units: num(formData, "units"),
    location: String(formData.get("location") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    gallery_urls: formData.getAll("gallery_urls").map(String).filter(Boolean),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: num(formData, "sort_order") ?? 0,
    homepage_elsewhere: formData.get("homepage_elsewhere") === "on",
    homepage_elsewhere_order: num(formData, "homepage_elsewhere_order") ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("listings").update(payload).eq("id", id);
  } else {
    await supabase.from("listings").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/listings");
  revalidatePath("/buy");
  revalidatePath("/invest");
  revalidatePath("/admin/listings");
  redirect("/admin/listings");
}

export async function importListing(url: string): Promise<ListingImportOutcome> {
  const supabase = await createClient();
  return importListingFromUrl(supabase, url);
}

export async function deleteListing(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/listings");
  revalidatePath("/admin/listings");
}

export async function toggleListingField(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";
  if (!id || (field !== "published" && field !== "featured")) return;

  const supabase = await createClient();
  await supabase
    .from("listings")
    .update({ [field]: value })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/listings");
  revalidatePath("/admin/listings");
}
