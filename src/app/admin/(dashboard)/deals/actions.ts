"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCsvToRecords } from "@/lib/csv";
import { isTerminalOutcome, outcomeLabel, resolveNextDate } from "@/lib/call-outcomes";
import type { PipelineStage } from "@/lib/types";

const PIPELINE_STAGES: PipelineStage[] = [
  "sourced",
  "researching",
  "contacted",
  "negotiating",
  "under_contract",
  "closed",
  "dead",
];
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
  const outcome = String(formData.get("outcome") ?? "").trim();
  const notes = str(formData, "notes");
  if (!companyId || !outcome) return;

  const contactId = str(formData, "contact_id");
  const manualDate = str(formData, "next_action_date");
  const nextActionDate = isTerminalOutcome(outcome)
    ? null
    : resolveNextDate(outcome, manualDate);
  const nextActionType = outcomeLabel(outcome);

  await supabase.from("deal_call_logs").insert({
    company_id: companyId,
    contact_id: contactId,
    outcome: nextActionType,
    notes,
    next_action_date: nextActionDate,
    next_action_type: nextActionType,
  });

  // Logging a call is the primary way a deal's next action gets
  // (re)scheduled — the outcome picked above determines it automatically
  // unless a manual date override was given, so this never depends on
  // remembering to type a date in by hand.
  await supabase
    .from("deal_companies")
    .update({
      next_action_date: nextActionDate,
      next_action_type: nextActionDate ? nextActionType : null,
      ...(isTerminalOutcome(outcome) ? { pipeline_stage: "dead" } : {}),
    })
    .eq("id", companyId);

  revalidatePath(`/admin/deals/${companyId}/edit`);
  revalidatePath("/admin/deals");
  revalidatePath("/admin");
}

export async function importDealsCsv(formData: FormData) {
  const file = formData.get("csv_file") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/deals/import?error=No file selected");
  }

  const text = await file.text();
  const rows = parseCsvToRecords(text);
  const supabase = await createClient();

  // One row = one property, with the owner company and a contact inline —
  // matches how the source data (a spreadsheet export or the old Vesper
  // tool) naturally shapes this. Rows sharing a company_name are grouped
  // under one company, reusing an existing company row by name if one
  // already exists rather than creating a duplicate.
  const companyIdByNormalizedName = new Map<string, string>();
  let propertiesImported = 0;
  let skipped = 0;

  for (const row of rows) {
    const companyName = (row.company_name || "").trim();
    const propertyName = (row.property_name || "").trim();
    if (!companyName && !propertyName) {
      skipped += 1;
      continue;
    }
    const effectiveCompanyName = companyName || propertyName;
    const normalized = effectiveCompanyName.toLowerCase();

    let companyId = companyIdByNormalizedName.get(normalized);
    if (!companyId) {
      const { data: existing } = await supabase
        .from("deal_companies")
        .select("id")
        .ilike("name", effectiveCompanyName)
        .maybeSingle();

      if (existing) {
        companyId = existing.id;
      } else {
        const pipelineStage = PIPELINE_STAGES.includes(
          row.pipeline_stage as PipelineStage
        )
          ? (row.pipeline_stage as PipelineStage)
          : "sourced";
        const { data: created } = await supabase
          .from("deal_companies")
          .insert({
            name: effectiveCompanyName,
            website: row.company_website || null,
            pipeline_stage: pipelineStage,
            next_action_date: DATE_RE.test(row.next_action_date)
              ? row.next_action_date
              : null,
            next_action_type: row.next_action_type || null,
            source: row.source || "csv-import",
            notes: row.company_notes || null,
          })
          .select("id")
          .single();
        companyId = created?.id;
      }
      if (companyId) companyIdByNormalizedName.set(normalized, companyId);
    }

    if (!companyId) {
      skipped += 1;
      continue;
    }

    if (propertyName) {
      await supabase.from("deal_properties").insert({
        company_id: companyId,
        name: propertyName,
        address: row.property_address || null,
        city: row.property_city || null,
        state: row.property_state || null,
        property_type: row.property_type || null,
        units: row.property_units && !Number.isNaN(Number(row.property_units))
          ? Number(row.property_units)
          : null,
        notes: row.property_notes || null,
      });
      propertiesImported += 1;
    }

    if (row.contact_name || row.contact_phone || row.contact_email) {
      await supabase.from("deal_contacts").insert({
        company_id: companyId,
        name: row.contact_name || "Primary Contact",
        phone: row.contact_phone || null,
        email: row.contact_email || null,
      });
    }
  }

  revalidatePath("/admin/deals");
  revalidatePath("/admin");
  redirect(`/admin/deals?imported=${propertiesImported}&skipped=${skipped}`);
}
