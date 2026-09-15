"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ServiceItem } from "@/lib/types";

async function upsertSetting(key: string, value: unknown) {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}

export async function updateHero(formData: FormData) {
  await upsertSetting("hero", {
    headline: String(formData.get("headline") ?? ""),
    subhead: String(formData.get("subhead") ?? ""),
    cta_primary_label: String(formData.get("cta_primary_label") ?? ""),
    cta_primary_href: String(formData.get("cta_primary_href") ?? ""),
    cta_secondary_label: String(formData.get("cta_secondary_label") ?? ""),
    cta_secondary_href: String(formData.get("cta_secondary_href") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    location_label: String(formData.get("location_label") ?? ""),
    dateline: String(formData.get("dateline") ?? ""),
  });
}

function parseNumberList(raw: string) {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

export async function updateMarketChart(formData: FormData) {
  await upsertSetting("market_chart", {
    years: parseNumberList(String(formData.get("years") ?? "")),
    households: parseNumberList(String(formData.get("households") ?? "")),
    housing_units: parseNumberList(
      String(formData.get("housing_units") ?? "")
    ),
    source_note: String(formData.get("source_note") ?? ""),
  });
}

export async function updateServices(formData: FormData) {
  const services: ServiceItem[] = [];
  for (let i = 0; i < 6; i++) {
    const title = String(formData.get(`service_${i}_title`) ?? "").trim();
    if (!title) continue;
    services.push({
      title,
      description: String(
        formData.get(`service_${i}_description`) ?? ""
      ).trim(),
      href: String(formData.get(`service_${i}_href`) ?? "").trim() || "/",
      icon: String(formData.get(`service_${i}_icon`) ?? "").trim(),
    });
  }
  await upsertSetting("services", services);
}

export async function updateAbout(formData: FormData) {
  const field = (name: string) => String(formData.get(name) ?? "");
  await upsertSetting("about", {
    quote: field("quote"),
    name: field("name"),
    headshot_url: field("headshot_url"),
    portrait_url: field("portrait_url"),
    location_label: field("location_label"),
    handwritten_note: field("handwritten_note"),
    bio: field("bio"),
    headshot_photo_url: field("headshot_photo_url"),
    opening_photo_url: field("opening_photo_url"),
    opening_photo_caption: field("opening_photo_caption"),
    opening_photo_focal: field("opening_photo_focal") || "50% 50%",
    community_photo_url: field("community_photo_url"),
    community_photo_caption: field("community_photo_caption"),
    community_photo_focal: field("community_photo_focal") || "50% 50%",
    travel_photo_1_url: field("travel_photo_1_url"),
    travel_photo_1_caption: field("travel_photo_1_caption"),
    travel_photo_1_focal: field("travel_photo_1_focal") || "50% 50%",
    travel_photo_2_url: field("travel_photo_2_url"),
    travel_photo_2_caption: field("travel_photo_2_caption"),
    travel_photo_2_focal: field("travel_photo_2_focal") || "50% 50%",
    travel_photo_3_url: field("travel_photo_3_url"),
    travel_photo_3_caption: field("travel_photo_3_caption"),
    travel_photo_3_focal: field("travel_photo_3_focal") || "50% 50%",
  });
}

export async function updateNewsletter(formData: FormData) {
  await upsertSetting("newsletter", {
    image_url: String(formData.get("image_url") ?? ""),
    tagline_line1: String(formData.get("tagline_line1") ?? ""),
    tagline_line2: String(formData.get("tagline_line2") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    subhead: String(formData.get("subhead") ?? ""),
  });
}

export async function updateContact(formData: FormData) {
  await upsertSetting("contact", {
    city_state: String(formData.get("city_state") ?? ""),
    dre_number: String(formData.get("dre_number") ?? ""),
    instagram_url: String(formData.get("instagram_url") ?? ""),
    linkedin_url: String(formData.get("linkedin_url") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    name: String(formData.get("name") ?? ""),
    photo_url: String(formData.get("photo_url") ?? ""),
    photo_caption: String(formData.get("photo_caption") ?? ""),
    handwritten_note: String(formData.get("handwritten_note") ?? ""),
  });
}
