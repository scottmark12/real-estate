// Live listings from Premier Agency's public feed (the same one that powers
// premieragencyre.com/properties). Temporary until Mark's own IDX feed is set
// up. Fetched server side and cached for 5 minutes.

const BASE = "https://myoffice.premieragencyagents.com/api/public";
const REVALIDATE = 300;

// Rentals come through the same feed. Anything listed under this price is
// almost always a monthly lease, so it is used as a floor along with the
// property_type check below.
const SALE_PRICE_FLOOR = 100_000;

export const BROKERAGE_CREDIT =
  "Listing data provided through Premier Agency Real Estate (CalDRE# 02240990) from the MLS. Information deemed reliable but not guaranteed. Buyer to verify all information.";

export type FeedListing = {
  id: string;
  listing_id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county?: string;
  price: string;
  bedrooms: number | null;
  bathrooms: string | null;
  sqft: number | null;
  lot_sqft?: number | null;
  status: string;
  description: string | null;
  neighborhood: string | null;
  days_on_market: number | null;
  year_built: number | null;
  property_type: string | null;
  property_sub_type?: string | null;
  primary_image_url: string | null;
  images_json?: { MediaURL: string }[] | null;
  latitude?: string | null;
  longitude?: string | null;
};

export type FeedQuery = {
  q?: string;
  city?: string;
  zip?: string;
  limit?: number;
  min_price?: string;
  max_price?: string;
  min_beds?: string;
  property_type?: string;
  sort?: string;
  page?: number;
};

export const SORTS = [
  { value: "recent", label: "Newest" },
  { value: "price-high", label: "Price, high to low" },
  { value: "price-low", label: "Price, low to high" },
] as const;

export const PROPERTY_TYPES = [
  { value: "", label: "Any type" },
  { value: "single-family", label: "House" },
  { value: "condo", label: "Condo / townhome" },
] as const;

export const PAGE_SIZE = 48;

export function isForSale(l: FeedListing) {
  return !/lease|rent/i.test(l.property_type ?? "") && Number(l.price) >= SALE_PRICE_FLOOR;
}

export async function searchListings(query: FeedQuery) {
  const params = new URLSearchParams({
    status: "active",
    limit: String(query.limit ?? PAGE_SIZE),
  });
  const set = (k: string, v?: string | number) => {
    const s = v == null ? "" : String(v).trim();
    if (s) params.set(k, s);
  };
  set("q", query.q);
  set("city", query.city);
  set("zip", /^\d{5}$/.test(query.zip ?? "") ? query.zip : undefined);
  set("min_price", Math.max(Number(query.min_price) || 0, SALE_PRICE_FLOOR));
  set("max_price", query.max_price);
  set("min_beds", query.min_beds);
  if (PROPERTY_TYPES.some((t) => t.value && t.value === query.property_type)) {
    set("property_type", query.property_type);
  }
  set("sort", SORTS.some((s) => s.value === query.sort) ? query.sort : "recent");
  if (query.page && query.page > 1) set("page", Math.floor(query.page));

  try {
    const res = await fetch(`${BASE}/listings?${params}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { listings?: FeedListing[]; total?: number };
    return {
      listings: (data.listings ?? []).filter(isForSale),
      total: data.total ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getListing(id: string): Promise<FeedListing | null> {
  if (!/^\d+$/.test(id)) return null;
  try {
    const res = await fetch(`${BASE}/listings/${id}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { listing?: FeedListing };
    return data.listing ?? null;
  } catch {
    return null;
  }
}

export function listingImages(l: FeedListing): string[] {
  const media = (l.images_json ?? []).map((m) => m.MediaURL).filter(Boolean);
  if (media.length) return media;
  return l.primary_image_url ? [l.primary_image_url] : [];
}

export function formatFeedPrice(price: string) {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatFeedStats(l: FeedListing) {
  const parts: string[] = [];
  if (l.bedrooms != null) parts.push(`${l.bedrooms} bd`);
  const baths = Number(l.bathrooms);
  if (Number.isFinite(baths) && baths > 0) parts.push(`${Number.isInteger(baths) ? baths : baths.toFixed(1)} ba`);
  if (l.sqft) parts.push(`${new Intl.NumberFormat("en-US").format(l.sqft)} sqft`);
  return parts.join(" · ");
}

export const FEATURED_SETTING = "featured_listings";
