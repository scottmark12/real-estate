import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketLetterBand from "@/components/market-letter-band";
import ArticleNextSteps from "@/components/article-next-steps";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { createPublicClient as createClient } from "@/lib/supabase/public";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/components/article-card";
import ArticleBlocks from "@/components/article-blocks";
import type { Article } from "@/lib/types";
import { JsonLd, SITE_URL, breadcrumbLd, clip, seoTitle } from "@/lib/site";

export const revalidate = 300;

// Render each page on first visit, then serve it cached (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, image_url")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return { title: "Market Research" };
  return {
    // Long research titles drop the brand suffix so Google doesn't cut them off.
    title: { absolute: seoTitle(data.title) },
    description: clip(data.excerpt),
    alternates: { canonical: `/insights/${slug}` },
    openGraph: data.image_url
      ? { type: "article", images: [data.image_url] }
      : { type: "article" },
  };
}

export default async function ArticleDetailPage({
  params,
}: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const article = data as Article | null;
  if (!article) notFound();

  // Three more to read: same topic first, then the newest.
  const { data: others } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(12);
  const pool = (others as Article[] | null) ?? [];
  const related = [
    ...pool.filter((a) => a.category === article.category),
    ...pool.filter((a) => a.category !== article.category),
  ].slice(0, 3);

  const hasBlocks = article.blocks && article.blocks.length > 0;
  const html = !hasBlocks && article.body ? await marked.parse(article.body) : "";

  return (
    <>
    <JsonLd
      data={breadcrumbLd([
        { name: "Market Research", path: "/insights" },
        { name: article.title, path: `/insights/${article.slug}` },
      ])}
    />
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt ?? undefined,
        image: article.image_url ?? undefined,
        datePublished: article.published_at ?? undefined,
        dateModified: article.updated_at ?? article.published_at ?? undefined,
        mainEntityOfPage: `${SITE_URL}/insights/${article.slug}`,
        author: { "@type": "Person", name: "Mark Scott", url: `${SITE_URL}/about` },
        publisher: { "@id": `${SITE_URL}/#agent` },
      }}
    />
    <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <Link href="/insights" className="text-sm text-navy/60 hover:text-navy">
        ← Back to Insights
      </Link>

      <p className="eyebrow mt-6 text-gold">
        {article.eyebrow || CATEGORY_LABELS[article.category] || article.category}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-navy max-[600px]:text-[27px] max-[600px]:leading-[1.1]">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-navy/50">
        {formatDate(article.published_at)}
      </p>

      {article.image_url && (
        <div className="relative mt-8 aspect-16/9 w-full overflow-hidden rounded-2xl bg-sand">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 640px) 700px, 100vw"
            className="object-cover"
            preload
          />
        </div>
      )}

      {hasBlocks ? (
        <div className="mt-8">
          <ArticleBlocks blocks={article.blocks} />
        </div>
      ) : (
        <div
          className="article-body mt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </article>
    <ArticleNextSteps related={related} />
    <div className="mx-auto mt-16 max-w-5xl sm:px-10">
      <MarketLetterBand className="mb-16" />
    </div>
    </>
  );
}
