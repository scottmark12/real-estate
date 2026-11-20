import Image from "next/image";
import Link from "next/link";

export default function MeetMark() {
  return (
    <section className="grid items-center gap-10 border-b border-sand px-4 py-16 max-[600px]:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-0 lg:py-24">
      <div className="mx-auto w-full max-w-[460px] lg:mx-0">
        <div className="relative aspect-square overflow-hidden bg-cream-deep">
          <Image
            src="/images/mark-headshot.jpeg"
            alt="Mark Scott, San Diego real estate agent"
            fill
            sizes="(min-width: 1024px) 460px, 90vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="max-w-xl">
        <p className="eyebrow text-gold">Meet Mark</p>
        <h2 className="mt-3 font-georgia text-[38px] font-normal leading-[1.05] text-navy sm:text-[52px]">
          I&apos;m Mark Scott. I work for you, not the listing.
        </h2>
        <p className="mt-6 text-lg text-navy/70">
          I studied interior design and marketing at Florida State, then spent
          years underwriting multifamily acquisitions. So I see a home two ways:
          how it feels to live in, and what it&apos;s really worth.
        </p>
        <p className="mt-4 text-lg text-navy/70">
          Based in Encinitas, helping buyers and sellers across San Diego County
          with Premier Agency Real Estate.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/contact"
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue"
          >
            Talk to Mark
          </Link>
          <Link
            href="/about"
            className="text-[15px] font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            More about me
          </Link>
        </div>
      </div>
    </section>
  );
}
