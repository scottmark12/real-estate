import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-white/70 p-8">
        <p className="eyebrow text-gold">Admin</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy">
          Sign In
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Mark Scott Real Estate admin panel.
        </p>

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="text-sm font-medium text-navy">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="mt-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-dark"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
