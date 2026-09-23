import { login } from "./actions";
import { btnPrimary, input, label } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-gold">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-navy">
          Sign In
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Mark Scott Real Estate admin panel.
        </p>

        <form action={login} className="mt-8 flex flex-col gap-4 border-t border-sand pt-8">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className={label}>Email</label>
            <input type="email" name="email" required className={input} />
          </div>
          <div>
            <label className={label}>Password</label>
            <input type="password" name="password" required className={input} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <SubmitButton className={`mt-2 self-start ${btnPrimary}`} pendingLabel="Signing in…">
            Sign In
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
