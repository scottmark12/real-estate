import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatStats } from "@/lib/format";
import type { Listing } from "@/lib/types";

export const revalidate = 0;

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const listing = data as Listing | null;
  if (!listing) notFound();

  const gallery = [listing.image_url, ...(listing.gallery_urls ?? [])].filter(
    Boolean
  ) as string[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
      <Link href="/listings" className="text-sm text-navy/60 hover:text-navy">
        ← Back to Listings
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={listing.status} />
        <span className="eyebrow text-navy/50">
          {listing.category.replace("_", " ")}
        </span>
      </div>

      <h1 className="mt-3 font-display text-4xl font-semibold text-navy max-[600px]:text-[26px] max-[600px]:leading-[1.1]">
        {listing.title}
      </h1>
      <p className="mt-1 text-lg text-navy/60 max-[600px]:text-sm">{listing.location}</p>

      {gallery.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand sm:col-span-2">
            <Image
              src={gallery[0]}
              alt={listing.title}
              fill
              sizes="(min-width: 640px) 800px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {gallery.slice(1).map((url) => (
            <div
              key={url}
              className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand"
            >
              <Image
                src={url}
                alt={listing.title}
                fill
                sizes="(min-width: 640px) 400px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy">
            About This Property
          </h2>
          <p className="mt-4 whitespace-pre-line text-navy/75">
            {listing.description ?? "More details coming soon."}
          </p>
        </div>

        <aside className="h-fit rounded-2xl border border-sand bg-white/70 p-6">
          <p className="font-display text-2xl font-semibold text-navy">
            {formatPrice(listing)}
          </p>
          <p className="mt-1 text-sm text-navy/60">{formatStats(listing)}</p>
          <Link
            href="/contact"
            className="mt-6 block rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-cream hover:bg-navy-dark"
          >
            Inquire About This Property
          </Link>
        </aside>
      </div>
    </div>
  );
}
