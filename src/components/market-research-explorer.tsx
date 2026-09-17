"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import { CATEGORY_LABELS } from "@/components/article-card";
import type { Article, ArticleCategory } from "@/lib/types";

const CATEGORIES: ArticleCategory[] = [
  "southern-california",
  "national",
  "rates",
  "development",
  "alternative-construction",
  "architectural-spotlight",
];

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function ArticleImage({
  article,
  imgClassName = "object-cover",
  placeholderLabel,
}: {
  article: Article;
  imgClassName?: string;
  placeholderLabel?: string;
}) {
  if (!article.image_url) {
    return (
      <ImagePlaceholder
        label={
          placeholderLabel ||
          `${CATEGORY_LABELS[article.category] ?? article.category} — Article Image`
        }
        className="absolute inset-0"
      />
    );
  }
  return (
    <Image
      src={article.image_url}
      alt={article.image_caption || article.title}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      className={imgClassName}
      style={
        article.image_position
          ? { objectPosition: article.image_position }
          : undefined
      }
    />
  );
}

function splitStat(value: string) {
  const match = value.match(/^([+\-$]?[\d.,]+[%MBK]?)\s+(.+)$/);
  return {
    number: match ? match[1] : value,
    label: match ? match[2] : null,
  };
}

function StatInline({ value }: { value: string }) {
  const { number, label } = splitStat(value);
  return (
    <p className="text-sm text-navy/70">
      <span className="font-semibold text-navy">{number}</span>
      {label && (
        <span className="ml-1.5 text-xs uppercase tracking-wide text-navy/50">
          {label}
        </span>
      )}
    </p>
  );
}

function FeaturedBlock({ featured }: { featured: Article }) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[28fr_72fr] lg:items-start">
        <div className="flex flex-col pt-1">
          <p className="eyebrow text-gold">Market Research</p>
          <h1 className="font-display mt-3 text-[32px] font-normal leading-[1.1] text-navy sm:text-[36px] lg:text-[40px]">
            Research worth reading.
          </h1>
          <p className="mt-4 max-w-[22rem] text-sm text-navy/70">
            Real estate, development, architecture and the forces shaping
            Southern California and beyond.
          </p>
        </div>

        <div className="relative">
          <div className="relative h-[235px] w-full overflow-hidden sm:h-[310px] lg:h-[365px] lg:w-[90%]">
            <ArticleImage article={featured} placeholderLabel="Featured Article Image" />
          </div>

          {(featured.stat || featured.secondary_stat) && (
            <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-1 border-t border-sand pt-3 lg:w-[90%]">
              {featured.stat && <StatInline value={featured.stat} />}
              {featured.secondary_stat && (
                <StatInline value={featured.secondary_stat} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature headline is deliberately not aligned to the image column —
          it breaks left across the grid so the story reads as the
          dominant event on the page, not a caption under the photo. */}
      <div className="mt-6 flex flex-col gap-4 lg:mt-10 lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:ml-[2%] lg:w-[68%]">
          <p className="eyebrow text-gold">
            {featured.eyebrow || CATEGORY_LABELS[featured.category]}
          </p>
          <h2 className="font-georgia mt-2 text-[36px] font-bold leading-[1.05] tracking-[-0.01em] text-navy lg:text-[46px]">
            {featured.title}
          </h2>
        </div>
        <div className="lg:w-[22%] lg:pt-14">
          {featured.excerpt && (
            <p className="text-sm text-navy/70">{featured.excerpt}</p>
          )}
          <p className="eyebrow mt-2 text-navy/40">
            {formatDate(featured.published_at)}
            {featured.read_time ? ` · ${featured.read_time}` : ""}
          </p>
          <Link
            href={`/insights/${featured.slug}`}
            className="eyebrow mt-3 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            {featured.cta_label || "Read the Full Report →"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PrimaryStory({
  article,
  textLed = false,
}: {
  article: Article;
  textLed?: boolean;
}) {
  const chartLed = (textLed || article.category === "rates") && article.stat;
  const stat = chartLed && article.stat ? splitStat(article.stat) : null;
  return (
    <Link href={`/insights/${article.slug}`} className="group block">
      <div className="relative aspect-[7/4] w-full overflow-hidden">
        {chartLed ? (
          <div className="flex h-full flex-col justify-center gap-1.5 bg-[color-mix(in_srgb,var(--cream)_97%,var(--navy)_3%)] p-6">
            <p className="font-georgia text-5xl font-bold leading-none text-navy">
              {stat?.number}
            </p>
            {stat?.label && (
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {stat.label}
              </p>
            )}
          </div>
        ) : (
          <ArticleImage
            article={article}
            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {article.annotation && !chartLed && (
          <p className="font-[family-name:var(--font-hand)] absolute left-3 top-3 max-w-[160px] text-base leading-snug text-navy">
            {article.annotation}
          </p>
        )}
      </div>
      <p className="eyebrow mt-3 text-gold">
        {article.eyebrow || CATEGORY_LABELS[article.category]}
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold leading-snug text-navy">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="mt-1 line-clamp-2 text-sm text-navy/70">
          {article.excerpt}
        </p>
      )}
      {article.metadata && (
        <p className="eyebrow mt-2 text-navy/40">{article.metadata}</p>
      )}
      <span className="mt-2 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
        {article.cta_label || "Read More →"}
      </span>
    </Link>
  );
}

function ArchitecturalBanner({ article }: { article: Article }) {
  return (
    <Link
      href={`/insights/${article.slug}`}
      className="group grid lg:grid-cols-[35fr_65fr]"
    >
      <div className="flex flex-col justify-center bg-cream-deep px-8 py-10">
        <p className="eyebrow text-gold">Architectural Spotlight</p>
        <h3 className="mt-3 font-display text-3xl font-normal leading-tight text-navy sm:text-4xl">
          {article.title}
        </h3>
        {article.metadata && (
          <p className="eyebrow mt-3 text-navy/50">{article.metadata}</p>
        )}
        {article.excerpt && (
          <p className="mt-3 italic text-navy/70">{article.excerpt}</p>
        )}
        <span className="mt-4 inline-block w-fit text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
          {article.cta_label || "Take a Look →"}
        </span>
      </div>
      <div className="relative h-[300px] w-full overflow-hidden lg:h-auto lg:min-h-[340px]">
        <ArticleImage
          article={article}
          imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
          placeholderLabel="Architectural Spotlight — Article Image"
        />
        {article.annotation && (
          <p className="font-[family-name:var(--font-hand)] absolute right-4 top-4 max-w-[200px] text-xl leading-snug text-navy">
            {article.annotation}
          </p>
        )}
      </div>
    </Link>
  );
}

function MoreResearchItem({ article }: { article: Article }) {
  return (
    <Link href={`/insights/${article.slug}`} className="group block">
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <ArticleImage
          article={article}
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="eyebrow mt-3 text-gold">
        {CATEGORY_LABELS[article.category]}
      </p>
      <h4 className="mt-1 font-display text-base font-semibold leading-snug text-navy">
        {article.title}
      </h4>
      <p className="eyebrow mt-1 text-navy/40">
        {formatDate(article.published_at)}
      </p>
    </Link>
  );
}

export default function MarketResearchExplorer({
  articles,
}: {
  articles: Article[];
}) {
  const [active, setActive] = useState<"all" | ArticleCategory>("all");
  const isAll = active === "all";

  const featured = useMemo(
    () => articles.find((a) => a.featured) ?? null,
    [articles]
  );
  const architectural = useMemo(
    () => articles.find((a) => a.architectural_feature) ?? null,
    [articles]
  );

  const pool = isAll
    ? articles.filter((a) => a.id !== featured?.id && a.id !== architectural?.id)
    : articles.filter((a) => a.category === active && a.id !== featured?.id);

  const primaryStories = isAll ? pool.slice(0, 3) : [];
  const textLedStoryId = primaryStories.find((a) => a.stat)?.id ?? null;
  const moreResearch = isAll ? pool.slice(3, 7) : [];
  const archiveList = isAll ? [] : pool;

  return (
    <div className="mx-auto max-w-[1500px] px-12">
      <section className="pt-6 lg:pt-8">
        {featured ? (
          <FeaturedBlock featured={featured} />
        ) : (
          <div>
            <p className="eyebrow text-gold">Market Research</p>
            <h1 className="font-display mt-3 text-[32px] font-normal leading-[1.1] text-navy sm:text-[36px] lg:text-[40px]">
              Research worth reading.
            </h1>
            <p className="mt-4 max-w-md text-navy/70">
              Real estate, development, architecture and the forces shaping
              Southern California and beyond.
            </p>
          </div>
        )}
      </section>

      <nav className="mt-2 border-t border-sand">
        <div className="flex gap-6 overflow-x-auto py-2 text-sm">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={`eyebrow shrink-0 border-b-2 pb-1 transition-colors ${
              isAll
                ? "border-blue text-navy"
                : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`eyebrow shrink-0 border-b-2 pb-1 transition-colors ${
                active === c
                  ? "border-blue text-navy"
                  : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </nav>

      {isAll ? (
        <>
          {primaryStories.length > 0 && (
            <section className="border-t border-sand py-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {primaryStories.map((article) => (
                  <PrimaryStory
                    key={article.id}
                    article={article}
                    textLed={article.id === textLedStoryId}
                  />
                ))}
              </div>
            </section>
          )}

          {architectural && (
            <section className="pb-8">
              <ArchitecturalBanner article={architectural} />
            </section>
          )}

          {moreResearch.length > 0 && (
            <section className="border-t border-sand py-8">
              <div className="flex items-end justify-between gap-4 border-b border-sand pb-3">
                <p className="eyebrow text-gold">More Research</p>
                <Link
                  href="/insights"
                  className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
                >
                  View All Articles &rarr;
                </Link>
              </div>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {moreResearch.map((article) => (
                  <MoreResearchItem key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="border-t border-sand py-8">
          {archiveList.length === 0 ? (
            <p className="text-navy/60">
              No published articles in this category yet.
            </p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {archiveList.map((article) => (
                <PrimaryStory key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
