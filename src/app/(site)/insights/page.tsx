import Link from "next/link";
import ArticleCard from "@/components/article-card";
import { createClient } from "@/lib/supabase/server";
import type { Article, ArticleCategory } from "@/lib/types";

export const revalidate = 0;

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  residential: "Residential",
  national: "National",
  "market-insights": "Market Insights",
  feature: "Feature",
};

export default async function InsightsPage({
  searchParams,
}: PageProps<"/insights">) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  const articles = (data as Article[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <p className="eyebrow text-gold">Market Insights</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Articles &amp; Reports
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/insights"
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !category
              ? "border-navy bg-navy text-cream"
              : "border-navy/20 text-navy/70"
          }`}
        >
          All
        </Link>
        {(Object.keys(CATEGORY_LABELS) as ArticleCategory[]).map((c) => (
          <Link
            key={c}
            href={`/insights?category=${c}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === c
                ? "border-navy bg-navy text-cream"
                : "border-navy/20 text-navy/70"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="text-navy/60">No articles match this filter.</p>
        )}
      </div>
    </div>
  );
}
