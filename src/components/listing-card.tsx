import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import { formatPrice, formatStats } from "@/lib/format";
import type { Listing } from "@/lib/types";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand/70 bg-white/60 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-sand">
        {listing.image_url && (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={listing.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-display text-lg font-semibold leading-snug text-navy">
          {listing.title}
        </p>
        <p className="text-sm text-navy/60">{listing.location}</p>
        <p className="text-sm text-navy/70">{formatStats(listing)}</p>
        <p className="mt-2 font-medium text-navy">{formatPrice(listing)}</p>
      </div>
    </Link>
  );
}
