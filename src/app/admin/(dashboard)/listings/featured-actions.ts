"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FEATURED_SETTING } from "@/lib/premier-feed";
import { getFeaturedIds } from "@/lib/featured-listings";

export async function toggleFeatured(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const current = await getFeaturedIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [id, ...current];

  await supabase
    .from("site_settings")
    .upsert({ key: FEATURED_SETTING, value: next, updated_at: new Date().toISOString() });

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/buy");
  revalidatePath("/admin/listings");
}
