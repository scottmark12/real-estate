import { getSetting } from "@/lib/settings";
import { type FeedListing, FEATURED_SETTING, getListing, isForSale } from "@/lib/premier-feed";

// Feed listings Mark has hearted in the admin. Stored in site_settings as a
// list of feed ids, newest heart first. Homes that sell or come off the
// market drop out on their own.

export async function getFeaturedIds(): Promise<string[]> {
  const ids = await getSetting<string[]>(FEATURED_SETTING, []);
  return ids.filter((id) => typeof id === "string" && /^\d+$/.test(id));
}

export async function getFeaturedListings(limit = 12): Promise<FeedListing[]> {
  const ids = (await getFeaturedIds()).slice(0, limit);
  const listings = await Promise.all(ids.map((id) => getListing(id)));
  return listings.filter(
    (l): l is FeedListing => l != null && l.status === "active" && isForSale(l)
  );
}
