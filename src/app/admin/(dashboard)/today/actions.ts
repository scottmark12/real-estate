"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MetricKey } from "@/lib/types";

export async function logMetric(formData: FormData) {
  const metric = String(formData.get("metric") ?? "") as MetricKey;
  const amount = Number(formData.get("amount") ?? 1);
  const logDate = String(formData.get("log_date") ?? "");
  const goalId = String(formData.get("goal_id") ?? "") || null;
  if (!metric || !logDate || Number.isNaN(amount)) return;

  const supabase = await createClient();
  await supabase.from("lead_logs").insert({ metric, amount, log_date: logDate, goal_id: goalId });

  revalidatePath("/admin/today");
  revalidatePath("/admin/scorecard");
}

// Removes the most recently logged row for this metric+day — the "minus"
// next to each counter, standing in for the spec's long-press undo (a
// plain button works identically on desktop and mobile without needing
// touch-gesture JS, which nothing else in this codebase uses).
export async function undoLastMetric(formData: FormData) {
  const metric = String(formData.get("metric") ?? "") as MetricKey;
  const logDate = String(formData.get("log_date") ?? "");
  if (!metric || !logDate) return;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("lead_logs")
    .select("id")
    .eq("metric", metric)
    .eq("log_date", logDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last) {
    await supabase.from("lead_logs").delete().eq("id", last.id);
  }

  revalidatePath("/admin/today");
  revalidatePath("/admin/scorecard");
}

export async function logCheckpoint(formData: FormData) {
  const logDate = String(formData.get("log_date") ?? "");
  if (!logDate) return;

  const rows: { metric: MetricKey; amount: number; log_date: string }[] = [];

  const numberField = (metric: MetricKey, key: string) => {
    const raw = formData.get(key);
    if (raw === null || String(raw).trim() === "") return;
    const n = Number(raw);
    if (!Number.isNaN(n)) rows.push({ metric, amount: n, log_date: logDate });
  };

  numberField("weight_lbs", "weight_lbs");
  numberField("pushups_max", "pushups_max");
  numberField("pullups_max", "pullups_max");
  numberField("dollars_under_contract", "dollars_under_contract");
  numberField("dollars_closed", "dollars_closed");

  const minutes = Number(formData.get("run_5k_minutes") ?? 0);
  const seconds = Number(formData.get("run_5k_seconds_part") ?? 0);
  const totalSeconds = minutes * 60 + seconds;
  if (totalSeconds > 0) rows.push({ metric: "run_5k_seconds", amount: totalSeconds, log_date: logDate });

  if (formData.get("protein_day") === "on") {
    rows.push({ metric: "protein_day", amount: 1, log_date: logDate });
  }

  if (rows.length === 0) return;

  const supabase = await createClient();
  await supabase.from("lead_logs").insert(rows);

  revalidatePath("/admin/today");
  revalidatePath("/admin/scorecard");
}
