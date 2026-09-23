import GoalForm from "@/components/admin/goal-form";

export default function NewGoalPage() {
  return (
    <div>
      <p className="eyebrow text-gold">Goals</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        New Goal
      </h1>
      <p className="mt-2 max-w-lg text-navy/60">
        Set the goal and its 12-week period. You&apos;ll add the
        week-by-week targets on the next screen.
      </p>

      <div className="mt-8">
        <GoalForm />
      </div>
    </div>
  );
}
