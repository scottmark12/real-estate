import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream-deep">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sand bg-navy text-cream sm:flex">
        <div className="px-6 py-6">
          <p className="font-display text-lg font-semibold">
            Mark Scott <span className="text-gold">Admin</span>
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-cream/10 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-6">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-cream/60 hover:bg-cream/10 hover:text-cream"
          >
            View Site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-cream/60 hover:bg-cream/10 hover:text-cream"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-sand bg-white/70 px-6 py-4 sm:hidden">
          <p className="font-display text-lg font-semibold text-navy">
            Mark Scott Admin
          </p>
          <form action={logout}>
            <button type="submit" className="text-sm text-navy/60">
              Sign Out
            </button>
          </form>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-sand bg-white/70 px-4 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-navy/15 px-3 py-1 text-xs text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
