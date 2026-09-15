import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.trim() : "";

  if (!address) {
    return Response.json(
      { error: "Property address is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: "Home Valuation Request",
    message: `Property address: ${address}`,
  });

  if (error) {
    return Response.json(
      { error: "Could not submit your request right now." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
