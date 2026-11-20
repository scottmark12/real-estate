import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { AboutSettings, ContactSettings } from "@/lib/types";

export const revalidate = 0;

const LENS_ITEMS = [
  { n: "01", label: "Human Scale", body: "Does it fit the way you'll actually live?" },
  { n: "02", label: "Potential", body: "What would it take to get there?" },
  { n: "03", label: "Numbers", body: "Do the numbers make sense?" },
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
        <div className="grid gap-12 lg:grid-cols-[36fr_64fr] lg:items-stretch">
          <div>
            <p className="eyebrow text-gold">About</p>
            <h1 className={H1}>The places we live shape how we show up in the world.</h1>
            <p className="mt-5 max-w-sm text-navy/80">
              A couple of months into traveling, I was in Vietnam, walking past
              a row of huts with dirt floors that felt warmer than most homes
              I&apos;d ever been in. Everyone was so friendly, and I realized
              that kind of community starts at home.
            </p>
            <p className="mt-4 max-w-sm text-navy/80">
              I call it <span className="text-navy">the human scale</span>: the
              feeling that a place fits the way you actually live.
            </p>
            <p className="mt-4 max-w-sm text-navy/80">
              For the first time, I was ready to stop traveling and come home.
              Those huts made me want to build places like that. I won&apos;t be
              the one building them, but getting someone into the right home
              matters just as much.
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
            focal="50% 62%"
            placeholderLabel="Opening"
            boxClassName="aspect-[1.7/1] w-full lg:aspect-auto lg:h-full"
            sizes="(min-width: 1024px) 64vw, 100vw"
          />
        </div>
      </section>

      {/* How I ended up in Encinitas. */}
      <section className="mt-16 border-t border-sand pt-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-[38fr_31fr_31fr]">
          <EditorialPhoto
            src="/images/about/white-temple.jpg"
            alt="Mark at a white temple in Thailand"
            caption="Thailand"
            focal="40% 50%"
            placeholderLabel="Travel"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 38vw, 100vw"
          />
          <EditorialPhoto
            src={about.travel_photo_2_url}
            alt={about.travel_photo_2_caption || "A place Mark has traveled to"}
            caption={about.travel_photo_2_caption}
            focal={about.travel_photo_2_focal}
            placeholderLabel="Travel"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 31vw, 100vw"
          />
          <EditorialPhoto
            src="/images/about/quokka.jpg"
            alt="Mark taking a selfie with a quokka"
            caption="Western Australia"
            focal="60% 40%"
            placeholderLabel="Travel"
            boxClassName="aspect-[4/5] w-full"
            sizes="(min-width: 1024px) 31vw, 100vw"
          />
        </div>

        <div className="mt-10">
          <p className="eyebrow text-gold">How I Ended Up in Encinitas</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-12">
            <h2 className={`max-w-lg lg:flex-1 ${H2}`}>
              Back in Atlanta, though, life felt just okay.
            </h2>
            <div className="flex max-w-xl flex-col gap-4 text-navy/80 lg:flex-1 lg:pt-2">
              <p>
                A friend I&apos;d met in Thailand had told me, &ldquo;You&apos;d
                love Encinitas.&rdquo;
              </p>
              <p>
                I wanted morning walks where I could see the water, an active
                lifestyle, friends who would push me to be better, and a home
                where I could set down roots and look forward to what&apos;s to
                come. So I moved across the country.
              </p>
              <p>
                When I got here, it was the first time in a long time that I
                felt at home. The regulars at the American Legion knew me right
                away. I found my church across the street and now volunteer
                there, and I&apos;m joining the Chamber of Commerce and coaching
                youth lacrosse this coming season.
              </p>
              <p>
                Most mornings I walk to D Street and sit at the top of the
                stairs looking out at the water. It&apos;s a small town with
                world class amenities, and the mountains, the desert and a big
                city airport are all close by. I even talked my sister into
                moving out.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <EditorialPhoto
            src="/images/about/living-room.jpg"
            alt="Friends hanging out in a living room around a surfboard coffee table"
            caption="Friends over at home"
            focal="50% 55%"
            placeholderLabel="Home"
            boxClassName="aspect-[4/5] w-full"
          />
          <EditorialPhoto
            src="/images/about/beach-crew.jpg"
            alt="Friends on the beach with surfboards lined up against the bluff"
            caption="Beach day with the crew"
            focal="50% 75%"
            placeholderLabel="Beach"
            boxClassName="aspect-[4/5] w-full"
          />
        </div>
      </section>

      {/* Why I do this, and how I look at a home. */}
      <section className="mt-16 border-t border-sand pt-16">
        <p className="eyebrow text-gold">Homes &amp; Community</p>
        <h2 className="mt-3 font-georgia max-w-2xl text-[34px] font-normal leading-[1.1] text-navy max-[600px]:text-[30px] max-[600px]:font-bold max-[600px]:leading-[1.02] max-[600px]:tracking-[-0.015em] sm:text-[40px]">
          Helping other people find that same feeling is why I do this.
        </h2>

        <div className="mt-5 flex flex-col gap-4 text-navy/80">
          <p>
            Now the human scale is how I look at every home in San Diego. I
            majored in marketing at FSU with focuses in entrepreneurship and
            interior design, renovated and managed a six bedroom property near
            campus, and have underwritten investment deals ever since. So I can
            walk into a house and tell you whether it has the human scale, what
            it would take to get there, and whether the numbers make sense.
            I&apos;m also part of San Diego&apos;s real estate community through
            ULI and NAIOP.
          </p>
        </div>

        <div className="mt-8">
          <EditorialPhoto
            src={about.community_photo_url}
            alt="The six bedroom property Mark renovated near Florida State University in Tallahassee, FL"
            caption={about.community_photo_caption}
            focal={about.community_photo_focal}
            placeholderLabel="College Renovation"
            boxClassName="aspect-[21/9] w-full"
            sizes="(min-width: 1024px) 1400px, 100vw"
          />
        </div>

        <div className="mt-12 lg:mt-16">
          <p className="eyebrow text-gold">How I Look at a Home</p>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-sand lg:flex-row lg:divide-x lg:divide-y-0">
          {LENS_ITEMS.map((item) => (
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
                href="/discover"
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
