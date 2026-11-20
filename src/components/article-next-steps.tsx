import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/components/article-card";
import type { Article } from "@/lib/types";

// Ends every research article: turn a reader into a conversation, then keep
// them reading.
export default function ArticleNextSteps({ related }: { related: Article[] }) {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 sm:px-10">
        <div className="border border-ink bg-white p-8 sm:p-10">
          <p className="eyebrow text-gold">What this means for you</p>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
            <Image
              src="/images/mark-headshot.jpeg"
              alt="Mark Scott"
              width={160}
              height={160}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="font-georgia text-[28px] leading-[1.1] text-navy sm:text-[32px]">
                Want me to run these numbers on your home or neighborhood?
              </p>
              <p className="mt-3 text-navy/70">
                Research is the big picture. I&apos;ll tell you what it means for your
                street, your timing and your price. Same day reply.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sell?value=1"
                  className="rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue"
                >
                  Get my home value
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-ink px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  Talk to Mark
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl px-6 sm:px-10">
          <div className="flex items-end justify-between gap-4 border-b border-sand pb-3">
            <p className="font-georgia text-[30px] leading-none text-navy">Keep reading</p>
            <Link
              href="/insights"
              className="eyebrow text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              All research &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {related.map((a) => (
              <Link key={a.id} href={`/insights/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                  {a.image_url && (
                    <Image
                      src={a.image_url}
                      alt={a.title}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="eyebrow mt-4 text-gold">
                  {a.eyebrow || CATEGORY_LABELS[a.category] || a.category}
                </p>
                <p className="mt-2 font-georgia text-xl leading-snug text-navy group-hover:underline">
                  {a.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
