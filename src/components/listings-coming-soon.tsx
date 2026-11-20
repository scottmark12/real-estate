import Link from "next/link";

export default function ListingsComingSoon({ eyebrow = "Buy" }: { eyebrow?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 max-[600px]:py-12 sm:px-10">
      <p className="eyebrow text-gold">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-normal text-navy max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em] sm:text-5xl">
        Listings coming soon.
      </h1>
      <p className="mt-5 max-w-xl text-navy/80">
        I&apos;m setting up a live feed of homes for sale across San Diego
        County. In the meantime, tell me what you&apos;re looking for and
        I&apos;ll send you homes that fit, including ones before they hit the
        market.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/contact?intent=buying"
          className="border border-blue bg-blue px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-blue-dark"
        >
          Tell Me What You&apos;re Looking For
        </Link>
        <Link
          href="/insights"
          className="border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
        >
          Read the Market Research
        </Link>
      </div>
    </div>
  );
}
