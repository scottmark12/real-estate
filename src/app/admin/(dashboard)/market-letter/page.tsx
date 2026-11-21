import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/components/article-card";
import { SITE_URL } from "@/lib/site";
import MarketLetterBuilder from "@/components/admin/market-letter-builder";
import type { LetterStory } from "@/lib/market-letter-email";

export const revalidate = 0;

export default async function MarketLetterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, category")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(10);

  const stories: LetterStory[] = (data ?? []).map((a) => ({
    title: a.title,
    excerpt: a.excerpt ?? "",
    url: `${SITE_URL}/insights/${a.slug}`,
    // AVIF photos don't show in Gmail or Outlook, so those stories go photo free.
    image: a.image_url && !/\.avif(\?|$)/i.test(a.image_url)
      ? a.image_url.startsWith("/")
        ? `${SITE_URL}${a.image_url}`
        : a.image_url
      : null,
    category: CATEGORY_LABELS[a.category] ?? a.category,
  }));

  return (
    <div>
      <p className="eyebrow text-gold">Newsletter</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Market Letter
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-navy/60">
        Write this month&apos;s letter, pick the research to feature, and copy the
        finished email. Your latest articles are filled in for you.
      </p>
      <MarketLetterBuilder stories={stories} />
    </div>
  );
}
