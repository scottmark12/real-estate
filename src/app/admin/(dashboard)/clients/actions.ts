"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function str(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw || null;
}

export async function upsertClient(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const payload = {
    name,
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    status: String(formData.get("status") ?? "lead"),
    client_type: String(formData.get("client_type") ?? "buyer"),
    timeline: str(formData, "timeline"),
    next_follow_up_date: str(formData, "next_follow_up_date"),
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  let clientId = id;
  if (id) {
    await supabase.from("clients").update(payload).eq("id", id);
  } else {
    const { data } = await supabase
      .from("clients")
      .insert(payload)
      .select("id")
      .single();
    clientId = data?.id ?? "";
  }

  revalidatePath("/admin/clients");
  if (clientId) revalidatePath(`/admin/clients/${clientId}/edit`);
  revalidatePath("/admin");
  redirect(clientId ? `/admin/clients/${clientId}/edit` : "/admin/clients");
}

export async function deleteClient(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", id);

  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect("/admin/clients");
}

export async function upsertBuyBox(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const minDollars = formData.get("min_price_dollars");
  const maxDollars = formData.get("max_price_dollars");
  const areasRaw = String(formData.get("areas") ?? "");

  const payload = {
    client_id: clientId,
    label,
    property_type: str(formData, "property_type"),
    min_price_cents:
      minDollars && minDollars !== "" ? Math.round(Number(minDollars) * 100) : null,
    max_price_cents:
      maxDollars && maxDollars !== "" ? Math.round(Number(maxDollars) * 100) : null,
    beds_min: num(formData, "beds_min"),
    baths_min: num(formData, "baths_min"),
    areas: areasRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("buy_boxes").update(payload).eq("id", id);
  } else {
    await supabase.from("buy_boxes").insert(payload);
  }

  revalidatePath(`/admin/clients/${clientId}/edit`);
}

export async function deleteBuyBox(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("buy_boxes").delete().eq("id", id);

  revalidatePath(`/admin/clients/${clientId}/edit`);
}

export async function addClientNote(formData: FormData) {
  const supabase = await createClient();

  const clientId = String(formData.get("client_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!clientId || !body) return;

  const nextFollowUpDate = str(formData, "next_follow_up_date");

  await supabase.from("client_notes").insert({
    client_id: clientId,
    body,
    next_follow_up_date: nextFollowUpDate,
  });

  // Logging a note is the primary way a follow-up date gets (re)scheduled,
  // so keep it in sync on the client record too rather than making the
  // "who to call" view join through client_notes to find the latest one.
  if (nextFollowUpDate) {
    await supabase
      .from("clients")
      .update({
        next_follow_up_date: nextFollowUpDate,
        last_contacted_at: new Date().toISOString(),
      })
      .eq("id", clientId);
  } else {
    await supabase
      .from("clients")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", clientId);
  }

  revalidatePath(`/admin/clients/${clientId}/edit`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
}
