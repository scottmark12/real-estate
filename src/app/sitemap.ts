import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/about",
    "/buy",
    "/sell",
    "/invest",
    "/insights",
    "/neighborhoods",
    "/quiz",
    "/tools",
    "/tools/cost-calculator",
    "/contact",
  ].map((path) => ({ url: `${BASE}${path}` }));

  const neighborhoods = NEIGHBORHOODS.map((n) => ({
    url: `${BASE}/neighborhoods/${n.slug}`,
  }));

  let articles: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("published", true);
    articles = (data ?? []).map((a) => ({
      url: `${BASE}/insights/${a.slug}`,
      lastModified: a.updated_at,
    }));
  } catch {
    // Sitemap still works without the articles.
  }

  return [...pages, ...neighborhoods, ...articles];
}
