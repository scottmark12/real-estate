import type { MetadataRoute } from "next";
import { createPublicClient as createClient } from "@/lib/supabase/public";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { SITE_URL } from "@/lib/site";
import { searchListings } from "@/lib/premier-feed";

// Rebuilt hourly so new listings get found and sold ones drop off.
export const revalidate = 3600;

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

  // Every active listing, so people searching an address can find it here.
  const homes: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  for (let page = 1; page <= 40; page++) {
    const res = await searchListings({ limit: 100, page, sort: "recent" });
    if (!res || res.listings.length === 0) break;
    for (const l of res.listings) {
      if (seen.has(l.id)) continue;
      seen.add(l.id);
      homes.push({ url: `${BASE}/buy/${l.id}`, changeFrequency: "daily" });
    }
    if (page * 100 >= res.total) break;
  }

  return [...pages, ...neighborhoods, ...articles, ...homes];
}
