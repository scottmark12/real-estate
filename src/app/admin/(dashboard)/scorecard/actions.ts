"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function scoreWeek(formData: FormData) {
  const weekNumber = Number(formData.get("week_number"));
  const executionPct = Number(formData.get("execution_pct"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (Number.isNaN(weekNumber) || Number.isNaN(executionPct)) return;

  const supabase = await createClient();
  await supabase
    .from("weekly_scores")
    .upsert({ week_number: weekNumber, execution_pct: executionPct, notes }, { onConflict: "week_number" });

  revalidatePath("/admin/scorecard");
}
