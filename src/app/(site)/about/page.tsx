import Image from "next/image";
import ImagePlaceholder from "@/components/image-placeholder";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { AboutSettings, ContactSettings } from "@/lib/types";

export const revalidate = 0;

const ATTENTION_ITEMS = [
  { n: "01", label: "Property", body: "What's actually here?" },
  { n: "02", label: "Numbers", body: "What is it really worth?" },
  {
    n: "03",
    label: "Neighborhood",
    body: "Why do people want to be here?",
  },
  {
    n: "04",
    label: "Long view",
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
      {/* I care about what makes a place worth living in. */}
      <section>
        <div className="grid gap-12 lg:grid-cols-[36fr_64fr] lg:items-stretch">
          <div>
            <p className="eyebrow text-gold">About</p>
            <h1 className="mt-3 font-georgia text-[42px] font-normal leading-[1.1] text-navy sm:text-[48px]">
              I care about what makes a place worth living in.
            </h1>
            <p className="mt-5 max-w-sm text-navy/80">
              I moved across the country to Encinitas for a pretty simple
              reason: I wanted to live somewhere I actually loved.
            </p>
            <p className="mt-4 max-w-sm text-navy/80">
              The beaches are beautiful, sure. But it&apos;s also walkable
              neighborhoods, local restaurants, people you run into twice in
              the same week, and mountains and desert close enough for a
              weekend. The things that make San Diego valuable aren&apos;t
              contained within anybody&apos;s property lines.
            </p>
            <p className="mt-4 max-w-sm text-navy/80">
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
                <p className="mt-1 text-sm text-navy/80">
                  San Diego, California
                </p>
                <p className="text-sm text-navy/80">
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

      {/* Homes are where community starts. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">Homes &amp; Community</p>
        <h2 className="mt-3 font-georgia max-w-2xl text-[34px] font-normal leading-[1.1] text-navy sm:text-[40px]">
          {about.quote}
        </h2>

        <div className="mt-5 flex max-w-xl flex-col gap-4 text-navy/80">
          <p>
            My work spans residential brokerage and commercial
            acquisitions. On the commercial side, I source and evaluate
            investment opportunities across multifamily and senior
            housing. On the residential side, I help buyers and sellers
            make better decisions about property, value, and place.
          </p>
          {bioParagraphs.slice(0, 3).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* The six-bedroom duplex Mark bought and renovated near Florida
            State, kept DOM-adjacent to the paragraph that discusses it so
            mobile never separates them from that story. */}
        <div className="mt-8">
          <EditorialPhoto
            src={about.community_photo_url}
            alt="The six-bedroom duplex Mark bought and renovated near Florida State University in Tallahassee, FL"
            caption={about.community_photo_caption}
            focal={about.community_photo_focal}
            placeholderLabel="College Renovation — Tallahassee, FL"
            boxClassName="aspect-[21/9] w-full"
            sizes="(min-width: 1024px) 1400px, 100vw"
          />
        </div>

        {bioParagraphs[3] && (
          <div className="mt-8 max-w-xl text-navy/80">
            <p>{bioParagraphs[3]}</p>
          </div>
        )}

        <div className="mt-12 lg:mt-16">
          <p className="eyebrow text-gold">How I Look at a Property</p>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-sand lg:flex-row lg:divide-x lg:divide-y-0">
          {ATTENTION_ITEMS.map((item) => (
            <div
              key={item.label}
              className="py-5 first:pt-0 last:pb-0 lg:flex-1 lg:px-6 lg:py-0 lg:first:pl-0 lg:last:pr-0"
            >
              <p className="eyebrow whitespace-nowrap text-gold">
                {item.n} &middot; {item.label}
              </p>
              <p className="mt-2 text-navy">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* I've seen a lot of ways to build a good place. There isn't just one. */}
      <section className="mt-16 border-t border-sand pt-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-[38fr_31fr_31fr]">
          <EditorialPhoto
            src={about.travel_photo_1_url}
            alt={about.travel_photo_1_caption || "A place Mark has traveled to"}
            caption={about.travel_photo_1_caption}
            focal={about.travel_photo_1_focal}
            placeholderLabel="Travel — Giza"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 38vw, 100vw"
          />
          <EditorialPhoto
            src={about.travel_photo_2_url}
            alt={about.travel_photo_2_caption || "A place Mark has traveled to"}
            caption={about.travel_photo_2_caption}
            focal={about.travel_photo_2_focal}
            placeholderLabel="Travel — Chiang Mai"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 31vw, 100vw"
          />
          <EditorialPhoto
            src={about.travel_photo_3_url}
            alt={about.travel_photo_3_caption || "A place Mark has traveled to"}
            caption={about.travel_photo_3_caption}
            focal={about.travel_photo_3_focal}
            placeholderLabel="Travel — Casablanca"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 31vw, 100vw"
          />
        </div>

        <div className="mt-10">
          <p className="eyebrow text-gold">A Broader Perspective</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-12">
            <h2 className="font-georgia max-w-lg text-[30px] font-normal leading-[1.2] text-navy sm:text-[34px] lg:flex-1">
              I&apos;ve seen a lot of ways to build a good place. There
              isn&apos;t just one.
            </h2>
            <p className="max-w-sm text-sm text-navy/70 lg:flex-1 lg:pt-2">
              Design taught me to notice buildings. Travel taught me to
              notice how people use them. I&apos;ve felt completely at home
              in places where the houses were smaller, streets were
              tighter, cars were less important, and public space did more
              of the work. Real estate taught me to understand the numbers
              that make those places possible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
