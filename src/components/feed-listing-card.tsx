import Link from "next/link";
import ImagePlaceholder from "@/components/image-placeholder";
import { type FeedListing, formatFeedPrice, formatFeedStats } from "@/lib/premier-feed";

export default function FeedListingCard({
  listing,
  tone = "light",
}: {
  listing: FeedListing;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Link href={`/buy/${listing.id}`} className="group flex flex-col">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-cream-deep">
        {listing.primary_image_url ? (
          // MLS photos come from Premier's image proxy, so a plain img avoids
          // allowlisting it for next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.primary_image_url}
            alt={`${listing.address}, ${listing.city}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder label="Listing Image" className="h-full" />
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className={`font-display text-xl font-normal leading-snug ${dark ? "text-white" : "text-navy"}`}>
          {listing.address}
        </p>
        <p className={`text-[10px] font-medium uppercase tracking-wide ${dark ? "text-white/50" : "text-navy/50"}`}>
          {listing.city}, {listing.state} {listing.zip}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className={`text-xs ${dark ? "text-white/60" : "text-navy/60"}`}>{formatFeedStats(listing)}</p>
          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-navy"}`}>{formatFeedPrice(listing.price)}</p>
        </div>
      </div>
    </Link>
  );
}
