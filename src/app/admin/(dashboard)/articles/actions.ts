"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";

export async function upsertArticle(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  const tagsInput = String(formData.get("tags") ?? "").trim();

  const payload = {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    category: String(formData.get("category") ?? "southern-california"),
    tags: tagsInput
      ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    image_caption: String(formData.get("image_caption") ?? "").trim() || null,
    image_position:
      String(formData.get("image_position") ?? "").trim() || null,
    read_time: String(formData.get("read_time") ?? "").trim() || null,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    stat: String(formData.get("stat") ?? "").trim() || null,
    secondary_stat:
      String(formData.get("secondary_stat") ?? "").trim() || null,
    annotation: String(formData.get("annotation") ?? "").trim() || null,
    metadata: String(formData.get("metadata") ?? "").trim() || null,
    cta_label: String(formData.get("cta_label") ?? "").trim() || null,
    is_feature_story: formData.get("is_feature_story") === "on",
    is_market_report: formData.get("is_market_report") === "on",
    featured: formData.get("featured") === "on",
    architectural_feature: formData.get("architectural_feature") === "on",
    on_my_radar: formData.get("on_my_radar") === "on",
    homepage_elsewhere: formData.get("homepage_elsewhere") === "on",
    homepage_elsewhere_order: Number(formData.get("homepage_elsewhere_order")) || 0,
    published: formData.get("published") === "on",
    published_at: publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("articles").update(payload).eq("id", id);
  } else {
    await supabase.from("articles").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/insights");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/insights");
  revalidatePath("/admin/articles");
}

export async function toggleArticleField(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";
  const allowed = [
    "published",
    "featured",
    "is_feature_story",
    "is_market_report",
    "on_my_radar",
    "homepage_elsewhere",
  ];
  if (!id || !allowed.includes(field)) return;

  const supabase = await createClient();
  await supabase
    .from("articles")
    .update({ [field]: value })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/insights");
  revalidatePath("/admin/articles");
}
