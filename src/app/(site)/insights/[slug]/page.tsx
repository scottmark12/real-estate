import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/components/article-card";
import type { Article } from "@/lib/types";

export const revalidate = 0;

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

  const html = article.body ? await marked.parse(article.body) : "";

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <Link href="/insights" className="text-sm text-navy/60 hover:text-navy">
        ← Back to Insights
      </Link>

      <p className="eyebrow mt-6 text-gold">
        {article.eyebrow || CATEGORY_LABELS[article.category] || article.category}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-navy">
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

      <div
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
