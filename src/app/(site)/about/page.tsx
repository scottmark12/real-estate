import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { AboutSettings, ContactSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: { absolute: "About Mark Scott | Encinitas Real Estate Agent" },
  description:
    "Mark Scott is an Encinitas real estate agent with Premier Agency, helping people buy and sell across San Diego County with a design and investing background.",
  alternates: { canonical: "/about" },
};


export const revalidate = 300;

const EXPERTISE = [
  {
    n: "01",
    label: "The Eye",
    title: "Does it have the human scale?",
    body: "I majored in marketing at FSU with focuses in entrepreneurship and interior design. I notice light, layout and flow, the things you feel in a house before you can name them.",
  },
  {
    n: "02",
    label: "The Work",
    title: "What would it take to get there?",
    body: "I renovated and managed a six bedroom property near campus, and I work alongside a team that buys and renovates homes. I know what a fix really costs and which ones are worth it.",
  },
  {
    n: "03",
    label: "The Math",
    title: "Do the numbers make sense?",
    body: "I've underwritten multifamily and senior housing acquisitions, from cash flow to IRR. I look at a home the way an investor would, so you know what it's really worth, not just what it's listed at.",
  },
];

const CLIENTS = [
  {
    title: "Moving to San Diego",
    body: "I made the same move. I'll help you figure out which neighborhood fits how you want to live before you ever book a tour.",
  },
  {
    title: "First time buyers",
    body: "What you can afford, what a house will really cost to own, and which compromises are worth making.",
  },
  {
    title: "Selling a home",
    body: "Pricing grounded in real numbers, and knowing which updates pay for themselves before you list.",
  },
  {
    title: "Investors",
    body: "Underwriting, rent and resale math, and an eye for what a property could become.",
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
      <div className={`relative min-h-0 flex-1 overflow-hidden ${boxClassName}`}>
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
          <ImagePlaceholder label={placeholderLabel} className="absolute inset-0" />
        )}
      </div>
      {caption && <p className="eyebrow mt-2 shrink-0 text-navy/40">{caption}</p>}
    </div>
  );
}

const H1 =
  "mt-3 font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em] sm:text-[48px]";
const H2 =
  "font-georgia text-[30px] font-normal leading-[1.2] text-navy max-[600px]:font-bold max-[600px]:leading-[1.02] max-[600px]:tracking-[-0.015em] sm:text-[34px]";

export default async function AboutPage() {
  const [about, contact] = await Promise.all([
    getSetting<AboutSettings>("about", DEFAULT_ABOUT),
    getSetting<ContactSettings>("contact", DEFAULT_CONTACT),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 max-[600px]:px-6 max-[600px]:pt-10 max-[600px]:pb-12">
      {/* Where it clicked. */}
      <section>
        <div className="grid gap-12 lg:grid-cols-[40fr_60fr] lg:items-stretch">
          <div>
            <p className="eyebrow text-gold">About</p>
            <h1 className={H1}>The places we live shape how we show up in the world.</h1>
            <p className="mt-5 max-w-md text-lg leading-snug text-navy">
              I help people buy and sell homes across San Diego, with a
              designer&apos;s eye and an investor&apos;s math.
            </p>
            <p className="mt-6 max-w-md text-navy/80">
              A couple of months into traveling, I was in Vietnam, walking past
              a row of huts with dirt floors that felt warmer than most homes
              I&apos;d ever been in. Everyone was so friendly, and I realized
              that kind of community starts at home.
            </p>
            <p className="mt-4 max-w-md text-navy/80">
              I call it <span className="text-navy">the human scale</span>: the
              feeling that a place fits the way you actually live.
            </p>
            <p className="mt-4 max-w-md text-navy/80">
              For the first time, I was ready to stop traveling and come home.
              Those huts made me want to build places like that. I won&apos;t be
              the one building them, but getting someone into the right home
              matters just as much.
            </p>

            <div className="mt-8 flex items-center gap-4 border-t border-sand pt-5">
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden">
                {about.headshot_photo_url ? (
                  <Image
                    src={about.headshot_photo_url}
                    alt={about.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder label="Headshot" className="absolute inset-0" />
                )}
              </div>
              <div>
                <p className="eyebrow text-navy">{about.name}</p>
                <p className="mt-1 text-sm text-navy/80">Encinitas, California</p>
                <p className="text-sm text-navy/80">Residential Real Estate · San Diego</p>
                {contact.dre_number && (
                  <p className="mt-1 text-xs text-navy/40">{contact.dre_number}</p>
                )}
              </div>
            </div>
          </div>

          <EditorialPhoto
            src="/images/about/surf-morning.jpg"
            alt="Mark holding his surfboard with a friend on the coast after a morning surf"
            caption="After a morning surf"
            focal="50% 58%"
            placeholderLabel="Opening"
            boxClassName="aspect-[4/3] w-full lg:aspect-auto lg:h-full"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>
      </section>

      {/* How I look at a home: the expertise, right after the story. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">How I Look at a Home</p>
        <h2 className="mt-3 font-georgia max-w-2xl text-[34px] font-normal leading-[1.1] text-navy max-[600px]:text-[30px] max-[600px]:font-bold max-[600px]:leading-[1.02] max-[600px]:tracking-[-0.015em] sm:text-[40px]">
          A designer&apos;s eye and an investor&apos;s math.
        </h2>
        <p className="mt-5 max-w-2xl text-navy/80">
          Now the human scale is how I look at every home in San Diego. I can
          walk into a house and tell you whether it has it, what it would take
          to get there, and whether the numbers make sense.
        </p>

        <div className="mt-10 grid grid-cols-1 divide-y divide-sand lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {EXPERTISE.map((item) => (
            <div
              key={item.label}
              className="py-6 first:pt-0 last:pb-0 lg:px-8 lg:py-0 lg:first:pl-0 lg:last:pr-0"
            >
              <p className="eyebrow whitespace-nowrap text-gold">
                {item.n} &middot; {item.label}
              </p>
              <h3 className="mt-3 font-georgia text-[22px] leading-[1.25] text-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy/80">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <EditorialPhoto
            src={about.community_photo_url}
            alt="The six bedroom property Mark renovated near Florida State University in Tallahassee, FL"
            caption={about.community_photo_caption}
            focal={about.community_photo_focal}
            placeholderLabel="College Renovation"
            boxClassName="aspect-[21/8] w-full"
            sizes="(min-width: 1024px) 1400px, 100vw"
          />
        </div>
        <p className="eyebrow mt-8 text-navy/60">
          Part of San Diego&apos;s real estate community through ULI and NAIOP
        </p>
      </section>

      {/* Who I work with. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">Who I Work With</p>
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CLIENTS.map((c) => (
            <div key={c.title} className="border-t-2 border-navy pt-4">
              <h3 className="font-georgia text-[20px] leading-[1.25] text-navy">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/80">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* One real market take, tied to the Market Research. */}
      <section className="mt-16 bg-cream-deep px-12 py-14 max-[600px]:-mx-6 max-[600px]:px-6">
        <p className="eyebrow text-gold">What I&apos;m Watching</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-12">
          <h2 className={`max-w-lg lg:flex-1 ${H2}`}>
            San Diego keeps adding households faster than it adds homes.
          </h2>
          <div className="flex max-w-xl flex-col gap-4 text-navy/80 lg:flex-1 lg:pt-2">
            <p>
              That gap is why prices have held up even with high rates, and
              why knowing which neighborhoods still have room to grow matters
              more than ever. I dig into the data in my market research.
            </p>
            <Link
              href="/insights"
              className="eyebrow text-gold underline decoration-1 underline-offset-4"
            >
              Read the Market Research
            </Link>
          </div>
        </div>
      </section>

      {/* Why Encinitas: community as local knowledge. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">Why Encinitas</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-12">
          <h2 className={`max-w-lg lg:flex-1 ${H2}`}>
            I know these neighborhoods because I live in them.
          </h2>
          <div className="flex max-w-xl flex-col gap-4 text-navy/80 lg:flex-1 lg:pt-2">
            <p>
              Back in Atlanta, life felt just okay. A friend I&apos;d met in
              Thailand told me, &ldquo;You&apos;d love Encinitas.&rdquo; I
              wanted morning walks by the water, an active lifestyle, friends
              who would push me to be better, and a home where I could set down
              roots. So I moved across the country.
            </p>
            <p>
              It was the first time in a long time that I felt at home. The
              regulars at the American Legion knew me right away, I volunteer
              at my church across the street, and I&apos;m joining the Chamber
              of Commerce and coaching youth lacrosse this coming season. Most
              mornings I sit at the top of the D Street stairs looking out at
              the water.
            </p>
            <p className="text-navy">
              Helping other people find that same feeling is why I do this.
            </p>
          </div>
        </div>

        <div className="mt-12 lg:ml-auto lg:w-[58%]">
          <EditorialPhoto
            src="/images/about/living-room.jpg"
            alt="Friends hanging out in a living room around a surfboard coffee table"
            caption="A small living room that fits everyone. That's the human scale."
            focal="50% 45%"
            placeholderLabel="Home"
            boxClassName="aspect-[4/3] w-full"
            sizes="(min-width: 1024px) 1400px, 100vw"
          />
        </div>
      </section>

      {/* Working with me. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">Working With Me</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-12">
          <h2 className={`max-w-lg lg:flex-1 ${H2}`}>
            It starts with how you want to live, not a list of houses.
          </h2>
          <div className="flex max-w-xl flex-col gap-4 text-navy/80 lg:flex-1 lg:pt-2">
            <p>
              We&apos;ll talk about your budget, your mornings, your weekends
              and what makes home feel like home to you. Then I&apos;ll show you
              where that fits in San Diego, and help you find the right place
              there.
            </p>
            <p>
              Whether you&apos;re moving across the country or across town,
              I&apos;d love to help you find a place that prioritizes the human
              scale. Take the quiz to see where you fit, or just ask me
              anything.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
              >
                Find Your Neighborhood
              </Link>
              <Link
                href="/contact"
                className="border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
              >
                Ask Me Anything
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
