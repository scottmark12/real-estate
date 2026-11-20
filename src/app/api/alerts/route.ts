import { createClient } from "@/lib/supabase/server";
import { cleanParams, describeParams } from "@/lib/listing-alerts";
import { notifyLead } from "@/lib/notify-lead";
import { searchListings } from "@/lib/premier-feed";

// Save a search so the daily job can email new matches.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const params = cleanParams(body?.params);
  const label = describeParams(params);

  // Mark everything already on the market as seen, so the first email
  // only has homes listed after they signed up.
  const current = await searchListings({ ...params, sort: "recent", limit: 48 });
  const seen = current?.listings.map((l) => l.id) ?? [];

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_searches")
    .insert({ email, name: name || null, label, params, seen_ids: seen });
  if (error) {
    return Response.json({ error: "Could not save that search right now." }, { status: 500 });
  }

  notifyLead({ source: "alert", name: name || null, email, context: label, intent: "Buying" });
  return Response.json({ ok: true, label });
}
