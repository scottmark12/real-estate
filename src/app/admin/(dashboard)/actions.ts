"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchMarketReads } from "@/lib/rss";

function str(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw || null;
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

export async function deleteTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("todos").delete().eq("id", id);

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
