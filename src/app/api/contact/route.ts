import { createClient } from "@/lib/supabase/server";

const VALID_INTENTS = ["Buying", "Selling", "Investing", "Something else"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const intent =
    typeof body?.intent === "string" && VALID_INTENTS.includes(body.intent)
      ? body.intent
      : null;
  const context =
    typeof body?.context === "string" ? body.context.trim() || null : null;

  if (!name || !email || !message) {
    return Response.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    message,
    intent,
    context,
    source: "contact",
  });

  if (error) {
    return Response.json(
      { error: "Could not send your message right now." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
