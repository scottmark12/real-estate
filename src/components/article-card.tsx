import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  national: "National",
  "market-insights": "Market Insights",
  feature: "Feature",
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-sand/70 bg-white/60">
      {article.image_url && (
        <div className="relative aspect-16/9 w-full overflow-hidden bg-sand">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="eyebrow text-gold">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </p>
        <h3 className="font-display text-xl font-semibold leading-snug text-navy">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-3 text-sm text-navy/70">
            {article.excerpt}
          </p>
        )}
        <Link
          href={`/insights/${article.slug}`}
          className="mt-auto pt-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
