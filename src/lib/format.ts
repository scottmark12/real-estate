import type { Listing, ListingStatus } from "@/lib/types";

export function formatPrice(listing: Pick<Listing, "price_display" | "price_cents">) {
  if (listing.price_display) return listing.price_display;
  if (listing.price_cents != null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(listing.price_cents / 100);
  }
  return "Contact for Details";
}

export function formatStats(
  listing: Pick<Listing, "beds" | "baths" | "sqft" | "units" | "acres">
) {
  const parts: string[] = [];
  if (listing.units != null) {
    parts.push(`${listing.units} unit${listing.units === 1 ? "" : "s"}`);
  } else if (listing.beds != null || listing.baths != null) {
    if (listing.beds != null) parts.push(`${listing.beds} bd`);
    if (listing.baths != null) parts.push(`${listing.baths} ba`);
  }
  if (listing.sqft != null) {
    parts.push(`${new Intl.NumberFormat("en-US").format(listing.sqft)} sqft`);
  }
  if (listing.acres != null) {
    parts.push(`${listing.acres} acres`);
  }
  return parts.join(" · ");
}

export const STATUS_LABELS: Record<ListingStatus, string> = {
  for_sale: "For Sale",
  investment: "Investment",
  off_market: "Off Market",
  sold: "Sold",
};

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export type PropertyTypeCategory = "commercial" | "residential";

export const PROPERTY_TYPE_OPTIONS: {
  value: string;
  label: string;
  category: PropertyTypeCategory;
}[] = [
  { value: "multifamily", label: "Multifamily", category: "commercial" },
  { value: "senior_living", label: "Senior Living", category: "commercial" },
  { value: "development", label: "Development", category: "commercial" },
  { value: "office", label: "Office", category: "commercial" },
  { value: "retail", label: "Retail", category: "commercial" },
  { value: "industrial", label: "Industrial", category: "commercial" },
  { value: "single_family", label: "Single Family", category: "residential" },
  { value: "condo", label: "Condo", category: "residential" },
  { value: "townhome", label: "Townhome", category: "residential" },
];

export function propertyTypeCategory(
  propertyType: string | null
): PropertyTypeCategory | "unspecified" {
  const match = PROPERTY_TYPE_OPTIONS.find((o) => o.value === propertyType);
  return match ? match.category : "unspecified";
}

export function currentWeekNumber(periodStart: string) {
  const today = new Date().toISOString().slice(0, 10);
  const diffDays = Math.floor(
    (new Date(today).getTime() - new Date(periodStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
}
