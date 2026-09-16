import Image from "next/image";
import { marked } from "marked";
import type { ArticleBlock } from "@/lib/types";

async function md(text: string) {
  return marked.parse(text);
}

export default async function ArticleBlocks({
  blocks,
}: {
  blocks: ArticleBlock[];
}) {
  const rendered = await Promise.all(
    blocks.map(async (block) => {
      switch (block.type) {
        case "heading":
          return (
            <h2
              key={block.id}
              className="mt-14 font-display text-2xl font-semibold leading-snug text-navy first:mt-0"
            >
              {block.text}
            </h2>
          );

        case "text": {
          const html = block.text ? await md(block.text) : "";
          return (
            <div
              key={block.id}
              className="article-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        case "image":
          if (!block.url) return null;
          return (
            <figure key={block.id} className="my-10">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                <Image
                  src={block.url}
                  alt={block.caption || ""}
                  fill
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: block.focal || "50% 50%" }}
                />
              </div>
              {block.caption && (
                <figcaption className="mt-2 text-xs text-navy/50">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );

        case "image_text": {
          const html = block.text ? await md(block.text) : "";
          return (
            <div
              key={block.id}
              className="my-10 grid gap-6 sm:grid-cols-2 sm:items-center"
            >
              {block.url && (
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden bg-sand ${
                    block.side === "right" ? "sm:order-2" : ""
                  }`}
                >
                  <Image
                    src={block.url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 350px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        }

        case "two_column_text": {
          const [leftHtml, rightHtml] = await Promise.all([
            block.left ? md(block.left) : "",
            block.right ? md(block.right) : "",
          ]);
          return (
            <div key={block.id} className="my-10 grid gap-8 sm:grid-cols-2">
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: leftHtml }}
              />
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: rightHtml }}
              />
            </div>
          );
        }

        case "quote":
          if (!block.text) return null;
          return (
            <figure
              key={block.id}
              className="my-12 border-l-2 border-gold pl-6"
            >
              <blockquote className="font-display text-2xl font-normal italic leading-snug text-navy">
                &ldquo;{block.text}&rdquo;
              </blockquote>
              {block.attribution && (
                <figcaption className="eyebrow mt-3 text-navy/50">
                  {block.attribution}
                </figcaption>
              )}
            </figure>
          );

        case "stat":
          if (!block.value) return null;
          return (
            <div key={block.id} className="my-10 border-t border-sand pt-6">
              <p className="font-display text-5xl font-semibold text-navy">
                {block.value}
              </p>
              {block.label && (
                <p className="eyebrow mt-2 text-navy/50">{block.label}</p>
              )}
            </div>
          );

        case "gallery":
          if (block.urls.length === 0) return null;
          return (
            <div key={block.id} className="my-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {block.urls.map((u, i) => (
                <div
                  key={u + i}
                  className="relative aspect-square w-full overflow-hidden bg-sand"
                >
                  <Image
                    src={u}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 220px, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          );

        case "divider":
          return <hr key={block.id} className="my-12 border-sand" />;
      }
    })
  );

  return <div>{rendered}</div>;
}
