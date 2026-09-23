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

export async function upsertCompany(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const payload = {
    name,
    website: str(formData, "website"),
    pipeline_stage: String(formData.get("pipeline_stage") ?? "sourced"),
    heat_score: num(formData, "heat_score"),
    next_action_date: str(formData, "next_action_date"),
    next_action_type: str(formData, "next_action_type"),
    source: str(formData, "source"),
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  let companyId = id;
  if (id) {
    await supabase.from("deal_companies").update(payload).eq("id", id);
  } else {
    const { data } = await supabase
      .from("deal_companies")
      .insert(payload)
      .select("id")
      .single();
    companyId = data?.id ?? "";
  }

  revalidatePath("/admin/deals");
  if (companyId) revalidatePath(`/admin/deals/${companyId}/edit`);
  revalidatePath("/admin");
  redirect(companyId ? `/admin/deals/${companyId}/edit` : "/admin/deals");
}

export async function deleteCompany(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("deal_companies").delete().eq("id", id);

  revalidatePath("/admin/deals");
  revalidatePath("/admin");
  redirect("/admin/deals");
}

export async function upsertProperty(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");

  const payload = {
    company_id: companyId,
    name: str(formData, "name"),
    address: str(formData, "address"),
    city: str(formData, "city"),
    state: str(formData, "state"),
    property_type: str(formData, "property_type"),
    units: num(formData, "units"),
    year_built: num(formData, "year_built"),
    total_sf: num(formData, "total_sf"),
    lot_size_acres: num(formData, "lot_size_acres"),
    occupancy_current: num(formData, "occupancy_current"),
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("deal_properties").update(payload).eq("id", id);
  } else {
    await supabase.from("deal_properties").insert(payload);
  }

  revalidatePath(`/admin/deals/${companyId}/edit`);
}

export async function deleteProperty(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("deal_properties").delete().eq("id", id);

  revalidatePath(`/admin/deals/${companyId}/edit`);
}

export async function upsertFinancials(formData: FormData) {
  const supabase = await createClient();

  const propertyId = String(formData.get("property_id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  if (!propertyId) return;

  const payload = {
    property_id: propertyId,
    purchase_price: num(formData, "purchase_price"),
    gross_revenue: num(formData, "gross_revenue"),
    operating_expenses: num(formData, "operating_expenses"),
    exit_cap_rate: num(formData, "exit_cap_rate"),
    hold_period_years: num(formData, "hold_period_years"),
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  await supabase.from("deal_financials").upsert(payload);

  revalidatePath(`/admin/deals/${companyId}/edit`);
}

export async function upsertContact(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const payload = {
    company_id: companyId,
    name,
    role: str(formData, "role"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    is_decision_maker: formData.get("is_decision_maker") === "on",
    notes: str(formData, "notes"),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("deal_contacts").update(payload).eq("id", id);
  } else {
    await supabase.from("deal_contacts").insert(payload);
  }

  revalidatePath(`/admin/deals/${companyId}/edit`);
}

export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const companyId = String(formData.get("company_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("deal_contacts").delete().eq("id", id);

  revalidatePath(`/admin/deals/${companyId}/edit`);
}

export async function addCallLog(formData: FormData) {
  const supabase = await createClient();

  const companyId = String(formData.get("company_id") ?? "");
  const outcome = str(formData, "outcome");
  const notes = str(formData, "notes");
  if (!companyId || (!outcome && !notes)) return;

  const contactId = str(formData, "contact_id");
  const nextActionDate = str(formData, "next_action_date");
  const nextActionType = str(formData, "next_action_type");

  await supabase.from("deal_call_logs").insert({
    company_id: companyId,
    contact_id: contactId,
    outcome,
    notes,
    next_action_date: nextActionDate,
    next_action_type: nextActionType,
  });

  // Logging a call is the primary way a deal's next action gets
  // (re)scheduled, so keep deal_companies in sync — same pattern as
  // addClientNote syncing clients.next_follow_up_date.
  if (nextActionDate) {
    await supabase
      .from("deal_companies")
      .update({
        next_action_date: nextActionDate,
        next_action_type: nextActionType,
      })
      .eq("id", companyId);
  }

  revalidatePath(`/admin/deals/${companyId}/edit`);
  revalidatePath("/admin/deals");
  revalidatePath("/admin");
}
