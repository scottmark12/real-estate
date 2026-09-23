"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchMarketReads, fetchPageTitle } from "@/lib/rss";

function str(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw || null;
}

export async function addResearchRead(formData: FormData) {
  const url = str(formData, "url");
  if (!url || !/^https?:\/\//i.test(url)) {
    redirect("/admin/brief?error=Paste a full URL (starting with http:// or https://)");
  }

  const { title, source } = await fetchPageTitle(url);

  const supabase = await createClient();
  // Upsert without touching summary/theme/key_points: if this url was
  // already pulled (and maybe rejected) by the sweep, re-submitting it
  // manually promotes it to kept + manual without clobbering anything
  // the sweep may have already written.
  await supabase.from("market_reads").upsert(
    {
      title,
      url,
      source,
      kept: true,
      source_type: "manual",
    },
    { onConflict: "url" }
  );

  revalidatePath("/admin/brief");
  redirect("/admin/brief");
}

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  await supabase.from("todos").insert({
    title,
    notes: str(formData, "notes"),
    goal_id: str(formData, "goal_id"),
    assigned_block_id: str(formData, "assigned_block_id"),
    scheduled_date: str(formData, "scheduled_date"),
  });

  revalidatePath("/admin");
}

export async function toggleTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const nowDone = String(formData.get("done") ?? "") === "true";

  const supabase = await createClient();
  await supabase
    .from("todos")
    .update({
      status: nowDone ? "done" : "pending",
      completed_at: nowDone ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function assignTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const scheduledDate = str(formData, "scheduled_date");
  if (!id || !scheduledDate) return;

  const supabase = await createClient();
  await supabase
    .from("todos")
    .update({
      scheduled_date: scheduledDate,
      assigned_block_id: str(formData, "assigned_block_id"),
    })
    .eq("id", id);

  revalidatePath("/admin");
}

export async function deleteTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("todos").delete().eq("id", id);

  revalidatePath("/admin");
}

export async function upsertScheduleBlock(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const dayOfWeek = Number(formData.get("day_of_week"));
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  if (!label || !startTime || !endTime || Number.isNaN(dayOfWeek)) return;

  const supabase = await createClient();
  const payload = {
    label,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await supabase.from("schedule_blocks").update(payload).eq("id", id);
  } else {
    await supabase.from("schedule_blocks").insert(payload);
  }

  revalidatePath("/admin");
}

export async function deleteScheduleBlock(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("schedule_blocks").delete().eq("id", id);

  revalidatePath("/admin");
}

export async function refreshMarketReads() {
  const reads = await fetchMarketReads();
  if (reads.length === 0) return;

  const supabase = await createClient();
  await supabase
    .from("market_reads")
    .upsert(
      reads.map((r) => ({
        title: r.title,
        url: r.url,
        source: r.source,
        summary: r.summary,
        theme: r.theme,
        published_at: r.published_at,
      })),
      { onConflict: "url", ignoreDuplicates: true }
    );

  revalidatePath("/admin");
}
