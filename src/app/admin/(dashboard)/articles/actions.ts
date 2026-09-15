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

  const payload = {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    category: String(formData.get("category") ?? "residential"),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    is_feature_story: formData.get("is_feature_story") === "on",
    is_market_report: formData.get("is_market_report") === "on",
    featured: formData.get("featured") === "on",
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
  ];
  if (!id || !allowed.includes(field)) return;

  const supabase = await createClient();
  await supabase
    .from("articles")
    .update({ [field]: value })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/insights");
  revalidatePath("/admin/articles");
}
