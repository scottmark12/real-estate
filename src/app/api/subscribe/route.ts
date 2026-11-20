import { notifyLead } from "@/lib/notify-lead";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) || null : null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({ email, name });

  if (error && !error.message.includes("duplicate")) {
    return Response.json({ error: "Could not subscribe right now." }, { status: 500 });
  }

  if (!error) notifyLead({ source: "newsletter", email, name });

  return Response.json({ ok: true });
}
