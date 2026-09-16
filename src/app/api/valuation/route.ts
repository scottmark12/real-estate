import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const timeline = typeof body?.timeline === "string" ? body.timeline.trim() || null : null;

  if (!address || !name || !email) {
    return Response.json(
      { error: "Property address, name, and email are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    intent: "Selling",
    context: address,
    timeline,
    source: "valuation",
  });

  if (error) {
    return Response.json(
      { error: "Could not submit your request right now." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
