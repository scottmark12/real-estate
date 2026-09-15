import { STATUS_LABELS } from "@/lib/format";
import type { ListingStatus } from "@/lib/types";

const STATUS_STYLES: Record<ListingStatus, string> = {
  for_sale: "bg-navy text-cream",
  investment: "bg-gold text-navy",
  off_market: "bg-sand text-navy",
  sold: "bg-navy/40 text-cream",
};

export default function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={`eyebrow inline-block px-2.5 py-1 ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
