import Image from "next/image";
import Link from "next/link";

// Full screen homepage hero, Spears Group style: a short muted clip on loop
// with one line over it. Until Mark's own clip is filmed, VIDEO_SRC stays
// empty and the poster photo shows on its own.
const VIDEO_SRC = "";
const POSTER = {
  src: "https://images.unsplash.com/photo-1728649054288-61f332ee389b?auto=format&fit=crop&w=2400&q=80",
  alt: "A bright white living room with a fireplace",
  by: "Clay Banks",
  user: "claybanks",
};

export default function HomeVideoHero() {
  return (
    <section className="full-bleed relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <Image
        src={POSTER.src}
        alt={POSTER.alt}
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      {VIDEO_SRC && (
        <video
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          src={VIDEO_SRC}
          poster={POSTER.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />

      <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 pt-32 sm:px-10 lg:px-12 lg:pb-24">
        <p className="eyebrow text-white/80">Mark Scott &middot; San Diego Real Estate</p>
        <h1 className="mt-4 max-w-4xl font-georgia text-[44px] font-normal leading-[1] text-white sm:text-[68px] lg:text-[88px]">
          A designer&apos;s eye.
          <br />
          An investor&apos;s math.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/85 max-[600px]:text-base">
          Helping buyers and sellers across San Diego County, from Oceanside to the border.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/buy"
            className="rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-white/85"
          >
            Search homes
          </Link>
          <Link
            href="/sell?value=1"
            className="rounded-full border border-white/70 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-ink"
          >
            What&apos;s my home worth?
          </Link>
        </div>
      </div>

      <p className="absolute bottom-3 right-3 text-[10px] text-white/60">
        Photo:{" "}
        <a
          href={`https://unsplash.com/@${POSTER.user}?utm_source=markscott&utm_medium=referral`}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {POSTER.by}
        </a>{" "}
        / Unsplash
      </p>
    </section>
  );
}
