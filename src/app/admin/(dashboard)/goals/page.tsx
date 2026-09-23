import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, tag } from "@/components/admin/ui";
import { currentWeekNumber } from "@/lib/format";
import { deleteGoal } from "./actions";
import type { Goal } from "@/lib/types";

export const revalidate = 0;

function daysRemaining(periodEnd: string) {
  const today = new Date().toISOString().slice(0, 10);
  const diff =
    (new Date(periodEnd).getTime() - new Date(today).getTime()) /
    (1000 * 60 * 60 * 24);
  return Math.round(diff);
}

export default async function AdminGoalsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const goals = (data as Goal[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Goals</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            12-Week Goals
          </h1>
          <p className="mt-2 max-w-lg text-navy/60">
            What you&apos;re working toward this cycle. The Today brief
            pulls each goal&apos;s current week&apos;s target automatically.
          </p>
        </div>
        <Link href="/admin/goals/new" className={btnPrimary}>
          + New Goal
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border-t border-sand">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="eyebrow px-4 py-3 font-medium">Goal</th>
              <th className="eyebrow px-4 py-3 font-medium">Category</th>
              <th className="eyebrow px-4 py-3 font-medium">Target</th>
              <th className="eyebrow px-4 py-3 font-medium">Week</th>
              <th className="eyebrow px-4 py-3 font-medium">Days Left</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => {
              const remaining = daysRemaining(g.period_end);
              return (
                <tr key={g.id} className="border-b border-sand/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy">
                    <Link
                      href={`/admin/goals/${g.id}/edit`}
                      className="underline decoration-gold decoration-2 underline-offset-4"
                    >
                      {g.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${tag} border-navy/20 text-navy/70 capitalize`}>
                      {g.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    {g.target_metric || "—"}
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    {currentWeekNumber(g.period_start)} of 12
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        remaining < 0
                          ? "text-navy/30"
                          : remaining <= 7
                            ? "font-semibold text-red-600"
                            : "text-navy/70"
                      }
                    >
                      {remaining < 0 ? "Ended" : `${remaining} days`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/admin/goals/${g.id}/edit`}
                        className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                      >
                        Edit
                      </Link>
                      <form action={deleteGoal}>
                        <input type="hidden" name="id" value={g.id} />
                        <button type="submit" className="text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {goals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  No goals set yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
