import { getListing } from "@/lib/premier-feed";

// Listings by id, for the Saved homes page.
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .filter((id) => /^\d+$/.test(id))
    .slice(0, 30);
  const listings = (await Promise.all(ids.map((id) => getListing(id)))).filter(
    (l) => l != null
  );
  return Response.json(
    {
      listings: listings.map((l) => ({
        id: l.id,
        address: l.address,
        city: l.city,
        state: l.state,
        zip: l.zip,
        price: l.price,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        sqft: l.sqft,
        status: l.status,
        primary_image_url: l.primary_image_url,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
