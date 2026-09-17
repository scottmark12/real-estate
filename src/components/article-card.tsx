import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import type { Article } from "@/lib/types";

export const CATEGORY_LABELS: Record<string, string> = {
  "southern-california": "Southern California",
  national: "National",
  rates: "Rates",
  development: "Development",
  "alternative-construction": "Alternative Construction",
  "architectural-spotlight": "Architectural Spotlight",
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col overflow-hidden border border-sand/70 bg-white/60">
      <div className="relative aspect-16/9 w-full overflow-hidden">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label="Editorial Image" className="h-full" />
        )}
      </div>
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
          className="mt-auto pt-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 max-[600px]:text-[13px] max-[600px]:tracking-[0.12em]"
        >
          Read &rarr;
        </Link>
      </div>
    </article>
  );
}
