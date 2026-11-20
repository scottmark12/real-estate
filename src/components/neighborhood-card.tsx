import Image from "next/image";
import Link from "next/link";
import { PRICE_TIERS, type Neighborhood } from "@/lib/neighborhoods";
import { NEIGHBORHOOD_PHOTOS, photoUrl } from "@/lib/neighborhood-photos";

// Photo first, name on the photo, one line underneath.
export default function NeighborhoodCard({ n }: { n: Neighborhood }) {
  const photo = NEIGHBORHOOD_PHOTOS[n.slug];
  return (
    <Link href={`/neighborhoods/${n.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        {photo && (
          <Image
            src={photoUrl(photo, 900)}
            alt={n.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow text-white/75">{n.region}</p>
          <h2 className="mt-1 font-georgia text-[28px] leading-[1.1] text-white">{n.name}</h2>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy/75">{n.tagline}</p>
      <p className="mt-1 text-xs text-navy/50">{PRICE_TIERS[n.priceTier]}</p>
    </Link>
  );
}
