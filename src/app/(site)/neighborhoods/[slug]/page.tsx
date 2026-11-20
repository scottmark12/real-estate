import type { Metadata } from "next";
import Link from "next/link";
import RecentSalesForm from "@/components/recent-sales-form";
import { notFound } from "next/navigation";
import {
  NEIGHBORHOODS,
  PRICE_TIERS,
  TRAIT_LABELS,
  getNeighborhood,
  nearbyNeighborhoods,
} from "@/lib/neighborhoods";

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/neighborhoods/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) return {};
  return {
    title: `Living in ${n.name}, San Diego`,
    description: n.tagline,
  };
}

function Score({ value }: { value: number }) {
  return (
    <div className="flex gap-1" aria-label={`${value} out of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-2 w-8 ${i <= value ? "bg-blue" : "bg-sand"}`} />
      ))}
    </div>
  );
}

export default async function NeighborhoodPage({
  params,
}: PageProps<"/neighborhoods/[slug]">) {
  const { slug } = await params;
  const n = getNeighborhood(slug);
  if (!n) notFound();

  const nearby = nearbyNeighborhoods(n);

  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-12 pb-20 max-[600px]:px-6 max-[600px]:pt-8 max-[600px]:pb-12">
      <p className="text-sm text-navy/60">
        <Link href="/neighborhoods" className="hover:text-navy">
          Neighborhoods
        </Link>{" "}
        / {n.region}
      </p>

      {/* Header */}
      <section className="mt-8 grid gap-10 lg:grid-cols-[60fr_40fr] lg:items-end">
        <div>
          <p className="eyebrow text-gold">{n.region}</p>
          <h1 className="mt-3 font-georgia text-[48px] font-normal leading-[1.05] text-navy max-[600px]:text-[40px] sm:text-[60px]">
            {n.name}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-snug text-navy">{n.tagline}</p>
          <p className="eyebrow mt-5 text-navy/50">{n.tags.join(" · ")}</p>
        </div>
        <div className="border-t-2 border-navy pt-4">
          <p className="eyebrow text-navy/50">Typical house</p>
          <p className="mt-2 font-georgia text-[28px] leading-tight text-navy">
            {PRICE_TIERS[n.priceTier]}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-navy/50">
            A rough range, not a median. Prices vary a lot by street, so ask me
            for recent sales.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="mt-16 border-t border-sand pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
          <div className="lg:w-[40%]">
            <p className="eyebrow text-gold">About {n.name}</p>
          </div>
          <div className="flex max-w-2xl flex-col gap-4 text-navy/80 lg:flex-1">
            {n.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {n.markTake && (
              <blockquote className="mt-2 border-l-2 border-blue pl-4 font-georgia text-lg text-navy">
                {n.markTake}
                <span className="eyebrow mt-2 block text-navy/50">Mark&apos;s take</span>
              </blockquote>
            )}
          </div>
        </div>
      </section>

      {/* Highlights + trade offs */}
      <section className="mt-12 grid gap-10 border-t border-sand pt-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-gold">What people love</p>
          <ul className="mt-4 flex flex-col divide-y divide-sand">
            {n.highlights.map((h) => (
              <li key={h} className="py-3 font-georgia text-[20px] text-navy">
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold">The honest trade offs</p>
          <p className="mt-4 text-navy/80">{n.tradeoffs}</p>
        </div>
      </section>

      {/* Scorecard */}
      <section className="mt-12 border-t border-sand pt-12">
        <p className="eyebrow text-gold">The scorecard</p>
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
          {TRAIT_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4 border-b border-sand pb-3">
              <span className="text-sm text-navy">{label}</span>
              <Score value={n.traits[key]} />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-navy/50">
          My read of each place on a 0 to 3 scale. It describes the place, not
          the people who live there.
        </p>
      </section>

      {/* Recent sales — lead capture */}
      <section className="mt-12 bg-cream-deep px-12 py-12 max-[600px]:-mx-6 max-[600px]:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold">Thinking about {n.name}?</p>
            <h2 className="mt-3 max-w-xl font-georgia text-[30px] leading-[1.2] text-navy">
              Get the recent sales in {n.name}.
            </h2>
            <p className="mt-3 max-w-md text-navy/70">
              What actually sold, for how much, and how fast. Straight from me,
              not an automated alert.
            </p>
            <p className="mt-4 text-sm text-navy/60">
              Or{" "}
              <Link
                href={`/contact?intent=buying&location=${encodeURIComponent(n.name)}`}
                className="underline decoration-gold decoration-2 underline-offset-4"
              >
                ask me anything
              </Link>{" "}
              about living here, or{" "}
              <Link href="/quiz" className="underline decoration-gold decoration-2 underline-offset-4">
                take the quiz
              </Link>
              .
            </p>
          </div>
          <RecentSalesForm place={n.name} />
        </div>
      </section>

      {/* Nearby */}
      {nearby.length > 0 && (
        <section className="mt-12 border-t border-sand pt-12">
          <p className="eyebrow text-gold">Nearby in {n.region}</p>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {nearby.map((o) => (
              <Link key={o.slug} href={`/neighborhoods/${o.slug}`} className="group border-t-2 border-navy pt-4">
                <h3 className="font-georgia text-[22px] text-navy group-hover:text-blue">{o.name}</h3>
                <p className="mt-2 text-sm text-navy/80">{o.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
