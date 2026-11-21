import { createPublicClient } from "@/lib/supabase/public";
import { DAYS_AHEAD, SLOT_MINUTES, formatSlot, isRealSlot, openSlots } from "@/lib/booking";
import { notifyLead } from "@/lib/notify-lead";

export const dynamic = "force-dynamic";

// Open times for the booking page.
export async function GET() {
  const now = new Date();
  const until = new Date(now.getTime() + (DAYS_AHEAD + 1) * 86400000);
  const { data } = await createPublicClient().rpc("booked_slots", {
    p_from: now.toISOString(),
    p_to: until.toISOString(),
  });
  const taken = new Set(((data as string[] | null) ?? []).map((t) => new Date(t).toISOString()));
  return Response.json(
    { slots: openSlots(taken, now) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Book (or request) a time.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const s = (k: string) => (typeof body?.[k] === "string" ? body[k].trim() : "");
  if (s("website")) return Response.json({ ok: true }); // spam trap

  const name = s("name");
  const email = s("email").toLowerCase();
  const phone = s("phone");
  const note = s("note");
  const start = s("start");

  if (!name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Name, phone and a valid email are required." }, { status: 400 });
  }
  const slot = isRealSlot(start);
  if (!slot) {
    return Response.json({ error: "That time isn't available anymore. Pick another." }, { status: 409 });
  }
  const status = slot.kind === "book" ? "confirmed" : "requested";
  const end = new Date(new Date(start).getTime() + SLOT_MINUTES * 60000).toISOString();

  const { data: id, error } = await createPublicClient().rpc("book_slot", {
    p_start: start,
    p_end: end,
    p_status: status,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_note: note || null,
  });
  if (error) {
    return Response.json({ error: "Couldn't book that right now. Call or text Mark." }, { status: 500 });
  }
  if (!id) {
    return Response.json({ error: "Someone just took that time. Pick another." }, { status: 409 });
  }

  notifyLead({
    source: "booking",
    name,
    email,
    phone,
    intent: status === "confirmed" ? "Booked call" : "Call request (short notice)",
    context: formatSlot(start),
    message: note || null,
    booking: { start, end, status },
  });

  return Response.json({ ok: true, status, when: formatSlot(start) });
}
