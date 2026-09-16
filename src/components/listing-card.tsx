import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import { formatPrice, formatStats } from "@/lib/format";
import type { Listing } from "@/lib/types";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.slug}`} className="group flex flex-col">
      <div className="relative aspect-4/3 w-full overflow-hidden">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder label="Listing Image" className="h-full" />
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="font-display text-xl font-normal leading-snug text-navy">
          {listing.title}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-navy/50">
          {listing.location}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-xs text-navy/60">{formatStats(listing)}</p>
          <p className="text-sm font-semibold text-navy">{formatPrice(listing)}</p>
        </div>
      </div>
    </Link>
  );
}
