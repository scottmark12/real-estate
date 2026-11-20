import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketLetterBand from "@/components/market-letter-band";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/components/article-card";
import ArticleBlocks from "@/components/article-blocks";
import type { Article } from "@/lib/types";
import { JsonLd, SITE_URL, breadcrumbLd } from "@/lib/site";

export const revalidate = 0;

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
    title: data.title,
    description: data.excerpt ?? undefined,
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
            priority
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
    <div className="mx-auto max-w-5xl sm:px-10">
      <MarketLetterBand className="mb-16" />
    </div>
    </>
  );
}
