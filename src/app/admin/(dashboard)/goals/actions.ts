"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GoalCategory } from "@/lib/types";

const GOAL_CATEGORIES: GoalCategory[] = ["business", "personal"];

function str(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) ?? "").trim();
  return raw || null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function upsertGoal(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const periodStart =
    str(formData, "period_start") ?? new Date().toISOString().slice(0, 10);

  const payload = {
    title,
    category: GOAL_CATEGORIES.includes(formData.get("category") as GoalCategory)
      ? (formData.get("category") as GoalCategory)
      : "business",
    target_metric: str(formData, "target_metric"),
    period_start: periodStart,
    // A "12 week year" period is 12 weeks (84 days) — day 0 is the start,
    // so the period runs through start + 83 days.
    period_end: addDays(periodStart, 83),
    updated_at: new Date().toISOString(),
  };

  let goalId = id;
  if (id) {
    await supabase.from("goals").update(payload).eq("id", id);
  } else {
    const { data } = await supabase
      .from("goals")
      .insert(payload)
      .select("id")
      .single();
    goalId = data?.id ?? "";
  }

  if (goalId) revalidatePath(`/admin/goals/${goalId}/edit`);
  revalidatePath("/admin");
  redirect(goalId ? `/admin/goals/${goalId}/edit` : "/admin");
}

export async function deleteGoal(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function upsertWeeklyTargets(formData: FormData) {
  const goalId = String(formData.get("goal_id") ?? "");
  if (!goalId) return;

  const supabase = await createClient();
  const rows = Array.from({ length: 12 }, (_, i) => {
    const weekNumber = i + 1;
    const text = String(formData.get(`week_${weekNumber}`) ?? "").trim();
    return { goal_id: goalId, week_number: weekNumber, target_text: text };
  }).filter((row) => row.target_text !== "");

  // Clear existing rows first so a week that's been blanked out doesn't
  // linger — simpler than reconciling inserts/updates/deletes row by row
  // for a fixed 12-row set that's always submitted in full.
  await supabase.from("goal_weekly_targets").delete().eq("goal_id", goalId);
  if (rows.length > 0) {
    await supabase.from("goal_weekly_targets").insert(rows);
  }

  revalidatePath(`/admin/goals/${goalId}/edit`);
  revalidatePath("/admin");
}

export async function toggleDailyCheck(formData: FormData) {
  const goalId = String(formData.get("goal_id") ?? "");
  const checkDate = String(formData.get("check_date") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!goalId || !checkDate) return;

  const supabase = await createClient();
  await supabase
    .from("goal_daily_checks")
    .upsert(
      { goal_id: goalId, check_date: checkDate, completed },
      { onConflict: "goal_id,check_date" }
    );

  revalidatePath(`/admin/goals/${goalId}/edit`);
  revalidatePath("/admin");
}
