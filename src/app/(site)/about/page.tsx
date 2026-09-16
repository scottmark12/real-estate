import Image from "next/image";
import ImagePlaceholder from "@/components/image-placeholder";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { AboutSettings, ContactSettings } from "@/lib/types";

export const revalidate = 0;

const ATTENTION_ITEMS = [
  { title: "The property", body: "What's actually here?" },
  { title: "The numbers", body: "What is it really worth?" },
  { title: "The neighborhood", body: "Why do people want to be here?" },
  {
    title: "The long view",
    body: "What makes this better—or worse—ten years from now?",
  },
];

function EditorialPhoto({
  src,
  alt,
  caption,
  focal,
  placeholderLabel,
  boxClassName,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src: string;
  alt: string;
  caption?: string;
  focal?: string;
  placeholderLabel: string;
  boxClassName: string;
  sizes?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`relative min-h-0 flex-1 overflow-hidden ${boxClassName}`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover"
            style={{ objectPosition: focal || "50% 50%" }}
          />
        ) : (
          <ImagePlaceholder
            label={placeholderLabel}
            className="absolute inset-0"
          />
        )}
      </div>
      {caption && (
        <p className="eyebrow mt-2 shrink-0 text-navy/40">{caption}</p>
      )}
    </div>
  );
}

export default async function AboutPage() {
  const [about, contact] = await Promise.all([
    getSetting<AboutSettings>("about", DEFAULT_ABOUT),
    getSetting<ContactSettings>("contact", DEFAULT_CONTACT),
  ]);

  const bioParagraphs = about.bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20">
      {/* Opening composition */}
      <section>
        <div className="grid gap-12 lg:grid-cols-[36fr_64fr] lg:items-stretch">
          <div>
            <p className="eyebrow text-gold">About</p>
            <h1 className="mt-3 font-display text-[42px] font-normal leading-[1.1] text-navy sm:text-[48px]">
              I care about what makes a place worth living in.
            </h1>
            <p className="mt-5 max-w-sm text-navy/70">
              I moved across the country to Encinitas for a pretty simple
              reason: I wanted to live somewhere I actually loved.
            </p>
            <p className="mt-4 max-w-sm text-navy/70">
              The beaches are beautiful, sure. But it&apos;s also walkable
              neighborhoods, local restaurants, people you run into twice in
              the same week, and mountains and desert close enough for a
              weekend. The things that make San Diego valuable aren&apos;t
              contained within anybody&apos;s property lines.
            </p>
            <p className="mt-4 max-w-sm text-navy/70">
              That&apos;s a big part of what drew me to real estate.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden">
                {about.headshot_photo_url ? (
                  <Image
                    src={about.headshot_photo_url}
                    alt={about.name}
                    fill
                    sizes="104px"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label="Headshot"
                    className="absolute inset-0"
                  />
                )}
              </div>
              <div>
                <p className="eyebrow text-navy">{about.name}</p>
                <p className="mt-1 text-sm text-navy/70">
                  San Diego, California
                </p>
                <p className="text-sm text-navy/70">
                  Residential + Commercial Real Estate
                </p>
                {contact.dre_number && (
                  <p className="mt-1 text-xs text-navy/40">
                    {contact.dre_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          <EditorialPhoto
            src={about.opening_photo_url}
            alt={about.opening_photo_caption || "San Diego"}
            caption={about.opening_photo_caption}
            focal={about.opening_photo_focal}
            placeholderLabel="Opening — San Diego Place"
            boxClassName="aspect-[1.7/1] w-full lg:aspect-auto lg:h-full"
            sizes="(min-width: 1024px) 64vw, 100vw"
          />
        </div>
      </section>

      {/* Community composition */}
      <section className="mt-16 border-t border-sand pt-16">
        <div className="grid gap-12 lg:grid-cols-[43fr_57fr] lg:items-stretch">
          <div className="lg:order-2 lg:pt-2">
            <div className="h-px w-10 bg-gold" />
            <h2 className="mt-4 font-display text-[34px] font-normal leading-[1.1] text-navy sm:text-[40px]">
              {about.quote}
            </h2>
            <div className="mt-5 flex max-w-xl flex-col gap-4 text-navy/75">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="lg:order-1 lg:h-full">
            <EditorialPhoto
              src={about.community_photo_url}
              alt={about.community_photo_caption || "A San Diego neighborhood"}
              caption={about.community_photo_caption}
              focal={about.community_photo_focal}
              placeholderLabel="Community — Neighborhood"
              boxClassName="aspect-[4/5] w-full sm:aspect-[6/5] lg:aspect-auto lg:h-full lg:min-h-[420px]"
              sizes="(min-width: 1024px) 43vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* What I Want to Understand */}
      <section className="mt-16 border-t border-sand pt-10">
        <p className="eyebrow text-gold">What I Want to Understand</p>
        <div className="mt-6 flex flex-col divide-y divide-sand lg:flex-row lg:divide-x lg:divide-y-0">
          {ATTENTION_ITEMS.map((item) => (
            <div
              key={item.title}
              className="py-5 first:pt-0 last:pb-0 lg:flex-1 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
            >
              <h3 className="font-display text-xl font-normal text-navy">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-navy/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* A Broader Perspective — travel collage */}
      <section className="mt-16 border-t border-sand pt-16">
        <div className="grid gap-6 lg:grid-cols-[40fr_22fr_38fr]">
          <EditorialPhoto
            src={about.travel_photo_1_url}
            alt={about.travel_photo_1_caption || "A place Mark has traveled to"}
            caption={about.travel_photo_1_caption}
            focal={about.travel_photo_1_focal}
            placeholderLabel="Travel — Large"
            boxClassName="aspect-[4/5] w-full lg:h-full lg:aspect-auto"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <div className="flex flex-col gap-6">
            <EditorialPhoto
              src={about.travel_photo_2_url}
              alt={about.travel_photo_2_caption || "A place Mark has traveled to"}
              caption={about.travel_photo_2_caption}
              focal={about.travel_photo_2_focal}
              placeholderLabel="Travel — Small"
              boxClassName="aspect-[4/3] w-full"
              sizes="(min-width: 1024px) 22vw, 100vw"
            />
            <EditorialPhoto
              src={about.travel_photo_3_url}
              alt={about.travel_photo_3_caption || "A place Mark has traveled to"}
              caption={about.travel_photo_3_caption}
              focal={about.travel_photo_3_focal}
              placeholderLabel="Travel — Small"
              boxClassName="aspect-[4/3] w-full"
              sizes="(min-width: 1024px) 22vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-gold">A Broader Perspective</p>
            <h2 className="mt-4 font-display text-[30px] font-normal leading-[1.2] text-navy sm:text-[34px]">
              I&apos;ve seen a lot of ways to build a good place. There
              isn&apos;t just one.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-navy/60">
              Design taught me to notice buildings. Travel taught me to
              notice how people use them. Real estate taught me to
              understand the numbers that make them possible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
