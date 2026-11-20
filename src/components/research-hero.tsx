import Image from "next/image";

export default function ResearchHero() {
  return (
    <section className="relative flex min-h-[60svh] items-end overflow-hidden bg-ink">
      <Image
        src="https://images.unsplash.com/photo-1641353190354-a1d4c14df4da?auto=format&fit=crop&w=2600&q=85"
        alt="The downtown San Diego skyline across the bay"
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />

      <div className="relative w-full px-12 pb-16 pt-32 max-[600px]:px-6 lg:pb-24">
        <div className="mx-auto max-w-[1500px]">
          <h1 className="eyebrow text-white/80">Market Research</h1>
          <p className="mt-3 max-w-3xl font-georgia text-[42px] font-normal leading-[1.02] tracking-[-0.01em] text-white sm:text-[60px] lg:text-[64px]">
            What&apos;s actually moving San Diego prices.
          </p>
          <p className="mt-5 max-w-xl text-lg text-white max-[600px]:text-base">
            Housing supply, rates, ADUs and development, read by a local agent
            with an investor&apos;s math. No fluff, just what the numbers mean for
            your next move.
          </p>
          <a
            href="#research"
            className="mt-9 inline-block rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-white/85"
          >
            Read the research
          </a>
        </div>
      </div>

      <p className="absolute bottom-3 right-3 text-[10px] text-white/60">
        Photo:{" "}
        <a
          href="https://unsplash.com/@alyssa_best?utm_source=markscott&utm_medium=referral"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Alyssa Best
        </a>{" "}
        / Unsplash
      </p>
    </section>
  );
}
