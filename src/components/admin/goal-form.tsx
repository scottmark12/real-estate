import { btnPrimary, input, label, select } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { upsertGoal } from "@/app/admin/(dashboard)/goals/actions";
import type { Goal } from "@/lib/types";

export default function GoalForm({ goal }: { goal?: Partial<Goal> }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={upsertGoal} className="flex flex-col gap-6">
      {goal?.id && <input type="hidden" name="id" value={goal.id} />}

      <div>
        <label className={label}>Goal</label>
        <input
          name="title"
          defaultValue={goal?.title}
          required
          placeholder="Make $40K in real estate commissions"
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Category</label>
          <select
            name="category"
            defaultValue={goal?.category ?? "business"}
            className={select}
          >
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        <div>
          <label className={label}>Target (optional)</label>
          <input
            name="target_metric"
            defaultValue={goal?.target_metric ?? ""}
            placeholder="$40,000"
            className={input}
          />
        </div>
        <div>
          <label className={label}>12-Week Period Starts</label>
          <input
            type="date"
            name="period_start"
            defaultValue={goal?.period_start ?? today}
            required
            className={input}
          />
        </div>
      </div>

      <SubmitButton className={`self-start ${btnPrimary}`} pendingLabel="Saving…">
        {goal ? "Save Changes" : "Create Goal"}
      </SubmitButton>
    </form>
  );
}
