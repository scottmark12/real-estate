"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCsvToRecords } from "@/lib/csv";
import {
  isTerminalOutcome,
  outcomeLabel,
  requiresManualDate,
  resolveNextDate,
} from "@/lib/call-outcomes";
import type { ClientStatus, ClientType } from "@/lib/types";

const CLIENT_STATUSES: ClientStatus[] = [
  "lead",
  "active",
  "under_contract",
  "past_client",
  "lost",
];
const CLIENT_TYPES: ClientType[] = ["buyer", "seller", "investor", "other"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
  const outcome = String(formData.get("outcome") ?? "").trim();
  const returnTo = str(formData, "return_to") ?? `/admin/clients/${clientId}/edit`;
  if (!clientId || !outcome) return;

  const manualDate = str(formData, "next_follow_up_date");
  if (requiresManualDate(outcome) && !manualDate) {
    redirect(
      `${returnTo}?error=${encodeURIComponent(
        `"${outcomeLabel(outcome)}" needs a date — nothing was logged.`
      )}`
    );
  }

  // Notes are optional — a call-center-style session shouldn't require
  // typing something every time; the outcome label stands in on its own.
  const body = String(formData.get("body") ?? "").trim() || outcomeLabel(outcome);
  const nextFollowUpDate = isTerminalOutcome(outcome)
    ? null
    : resolveNextDate(outcome, manualDate);

  const { error: noteError } = await supabase.from("client_notes").insert({
    client_id: clientId,
    body,
    outcome,
    next_follow_up_date: nextFollowUpDate,
  });

  // Logging a note is the primary way a follow-up date gets (re)scheduled —
  // the outcome picked above determines it automatically unless a manual
  // date override was given, so this never depends on remembering to type
  // a date in by hand.
  const { error: clientError } = noteError
    ? { error: null }
    : await supabase
        .from("clients")
        .update({
          next_follow_up_date: nextFollowUpDate,
          last_contacted_at: new Date().toISOString(),
          ...(isTerminalOutcome(outcome) ? { status: "lost" } : {}),
        })
        .eq("id", clientId);

  if (noteError || clientError) {
    redirect(
      `${returnTo}?error=${encodeURIComponent(
        "That call didn't save — try logging it again."
      )}`
    );
  }

  revalidatePath(`/admin/clients/${clientId}/edit`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  revalidatePath("/admin/calls");
}

export async function importClientsCsv(formData: FormData) {
  const file = formData.get("csv_file") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/clients/import?error=No file selected");
  }

  const text = await file.text();
  const rows = parseCsvToRecords(text);

  const payloads = rows
    .map((row) => {
      const name = (row.name || "").trim();
      if (!name) return null;

      const status = CLIENT_STATUSES.includes(row.status as ClientStatus)
        ? (row.status as ClientStatus)
        : "lead";
      const clientType = CLIENT_TYPES.includes(row.client_type as ClientType)
        ? (row.client_type as ClientType)
        : "buyer";
      const nextFollowUpDate = DATE_RE.test(row.next_follow_up_date)
        ? row.next_follow_up_date
        : null;

      return {
        name,
        email: row.email || null,
        phone: row.phone || null,
        status,
        client_type: clientType,
        timeline: row.timeline || null,
        next_follow_up_date: nextFollowUpDate,
        notes: row.notes || null,
        source: "csv-import",
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const skipped = rows.length - payloads.length;

  if (payloads.length > 0) {
    const supabase = await createClient();
    await supabase.from("clients").insert(payloads);
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect(`/admin/clients?imported=${payloads.length}&skipped=${skipped}`);
}
