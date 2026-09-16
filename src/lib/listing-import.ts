import { randomUUID } from "node:crypto";
import type { createClient } from "@/lib/supabase/server";
import type { ListingCategory, ListingStatus } from "@/lib/types";

export interface ListingImportResult {
  title: string;
  published: boolean;
  status: ListingStatus;
  category: ListingCategory;
  price_cents: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  location: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[];
}

export type ListingImportOutcome =
  | { ok: true; data: ListingImportResult }
  | { ok: false; error: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_IMAGES = 20;
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; MarkScottRE-Import/1.0)",
};

function cleanDescription(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return null;
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() || null;
}

function mapStatus(raw: unknown): ListingStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("sold") || s.includes("closed")) return "sold";
  if (s.includes("off") || s.includes("withdrawn") || s.includes("expired")) return "off_market";
  return "for_sale";
}

function mapCategory(raw: unknown): ListingCategory {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("multi") || s.includes("duplex") || s.includes("apartment")) return "multifamily";
  if (s.includes("land") || s.includes("lot") || s.includes("development")) return "development";
  return "residential";
}

// Downloads each image and re-uploads it to our own storage bucket so the
// listing never depends on the source site continuing to host it (and so
// next/image doesn't need every possible source domain allowlisted).
async function importImages(
  supabase: SupabaseServerClient,
  urls: string[]
): Promise<string[]> {
  const capped = urls.slice(0, MAX_IMAGES);
  const uploaded = await Promise.all(
    capped.map(async (url) => {
      try {
        const res = await fetch(url, { headers: FETCH_HEADERS });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png")
          ? "png"
          : contentType.includes("webp")
            ? "webp"
            : "jpg";
        const bytes = new Uint8Array(await res.arrayBuffer());
        const path = `uploads/${randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("site-images")
          .upload(path, bytes, { contentType, upsert: true });
        if (error) return null;
        const { data } = supabase.storage.from("site-images").getPublicUrl(path);
        return data.publicUrl;
      } catch {
        return null;
      }
    })
  );
  return uploaded.filter((u): u is string => Boolean(u));
}

async function importFromPremierAgency(
  supabase: SupabaseServerClient,
  url: URL
): Promise<ListingImportOutcome> {
  const match = url.pathname.match(/\/properties\/([A-Za-z0-9-]+)/);
  if (!match) {
    return { ok: false, error: "Couldn't find a listing ID in that URL." };
  }

  const res = await fetch(
    `https://myoffice.premieragencyagents.com/api/public/listings/${match[1]}`,
    { headers: FETCH_HEADERS }
  );
  if (!res.ok) {
    return { ok: false, error: `Premier Agency returned an error (${res.status}) for that listing.` };
  }
  const json = await res.json();
  const l = json?.listing;
  if (!l) {
    return { ok: false, error: "That listing couldn't be read — it may no longer be active." };
  }

  const photoUrls: string[] = Array.isArray(l.images_json)
    ? l.images_json
        .filter(
          (m: unknown): m is { MediaURL: string } =>
            !!m &&
            typeof (m as { MediaURL?: unknown }).MediaURL === "string" &&
            /\/PHOTO-/i.test((m as { MediaURL: string }).MediaURL)
        )
        .map((m: { MediaURL: string }) => m.MediaURL)
    : [];

  const [image_url, ...gallery_urls] = await importImages(supabase, photoUrls);

  return {
    ok: true,
    data: {
      title: String(l.address ?? ""),
      status: mapStatus(l.status),
      category: mapCategory(l.property_sub_type ?? l.property_type),
      price_cents: l.price ? Math.round(parseFloat(l.price) * 100) : null,
      beds: typeof l.bedrooms === "number" ? l.bedrooms : null,
      baths: l.bathrooms ? parseFloat(l.bathrooms) : null,
      sqft: typeof l.sqft === "number" ? l.sqft : null,
      acres: l.lot_sqft ? Math.round((l.lot_sqft / 43560) * 100) / 100 : null,
      location: [l.city, l.state].filter(Boolean).join(", "),
      description: cleanDescription(l.description),
      image_url: image_url ?? null,
      gallery_urls,
      published: false,
    },
  };
}

// Best-effort fallback for any other listing URL: reads schema.org JSON-LD
// (RealEstateListing / SingleFamilyResidence / etc.) and Open Graph tags
// out of the server-rendered HTML. Sites that render listing data purely
// client-side after page load won't have anything for this to find.
async function importGeneric(url: URL): Promise<ListingImportOutcome> {
  let html: string;
  try {
    const res = await fetch(url.toString(), { headers: FETCH_HEADERS });
    if (!res.ok) return { ok: false, error: `That page returned an error (${res.status}).` };
    html = await res.text();
  } catch {
    return { ok: false, error: "Couldn't reach that URL." };
  }

  const ldBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  ).map((m) => m[1]);

  let listing: Record<string, unknown> | null = null;
  for (const block of ldBlocks) {
    try {
      const parsed = JSON.parse(block.trim());
      const candidates: unknown[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as Record<string, unknown>)["@graph"])
          ? ((parsed as Record<string, unknown>)["@graph"] as unknown[])
          : [parsed];
      const found = candidates.find(
        (c): c is Record<string, unknown> =>
          !!c &&
          typeof c === "object" &&
          typeof (c as Record<string, unknown>)["@type"] === "string" &&
          /Residence|House|Apartment|RealEstateListing|Product|SingleFamily/i.test(
            (c as Record<string, unknown>)["@type"] as string
          )
      );
      if (found) {
        listing = found;
        break;
      }
    } catch {
      // Malformed JSON-LD on the source page — skip it.
    }
  }

  const og = (prop: string): string | null => {
    const m =
      html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, "i")) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, "i"));
    return m ? m[1] : null;
  };

  const title = (listing?.name as string) || og("title") || "";
  const description = cleanDescription(listing?.description ?? og("description"));
  const offers = listing?.offers as { price?: string } | { price?: string }[] | undefined;
  const priceRaw = Array.isArray(offers) ? offers[0]?.price : offers?.price;
  const address = listing?.address as
    | { addressLocality?: string; addressRegion?: string }
    | undefined;
  const location = address
    ? [address.addressLocality, address.addressRegion].filter(Boolean).join(", ")
    : "";

  const rawImages = listing?.image
    ? Array.isArray(listing.image)
      ? (listing.image as string[])
      : [listing.image as string]
    : og("image")
      ? [og("image") as string]
      : [];
  const absoluteImages = rawImages
    .map((src) => {
      try {
        return new URL(src, url).toString();
      } catch {
        return null;
      }
    })
    .filter((u): u is string => Boolean(u));

  if (!title && absoluteImages.length === 0 && !priceRaw) {
    return {
      ok: false,
      error:
        "Couldn't find listing data on that page — this site may load listings after the page loads, which we can't read. Try adding the listing manually.",
    };
  }

  return {
    ok: true,
    data: {
      title,
      status: "for_sale",
      category: "residential",
      price_cents: priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null,
      beds: listing?.numberOfRooms ? Number(listing.numberOfRooms) : null,
      baths: null,
      sqft: null,
      acres: null,
      location,
      description,
      image_url: absoluteImages[0] ?? null,
      gallery_urls: absoluteImages.slice(1, MAX_IMAGES),
      published: false,
    },
  };
}

// This does the actual image download/re-upload — split out so both
// import paths share it, but generic mode only downloads once fields are
// confirmed worth keeping (see importGeneric's early-return above).
async function finalizeGenericImages(
  supabase: SupabaseServerClient,
  outcome: ListingImportOutcome
): Promise<ListingImportOutcome> {
  if (!outcome.ok) return outcome;
  const urls = [outcome.data.image_url, ...outcome.data.gallery_urls].filter(
    (u): u is string => Boolean(u)
  );
  if (urls.length === 0) return outcome;
  const [image_url, ...gallery_urls] = await importImages(supabase, urls);
  return {
    ok: true,
    data: { ...outcome.data, image_url: image_url ?? null, gallery_urls },
  };
}

export async function importListingFromUrl(
  supabase: SupabaseServerClient,
  rawUrl: string
): Promise<ListingImportOutcome> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "premieragencyre.com") {
    return importFromPremierAgency(supabase, url);
  }

  return finalizeGenericImages(supabase, await importGeneric(url));
}
