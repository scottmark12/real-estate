import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/brief", label: "Brief" },
  { href: "/admin/today", label: "Today" },
  { href: "/admin/scorecard", label: "Scorecard" },
  { href: "/admin/calls", label: "Call Center" },
  { href: "/admin/research", label: "Research Center" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/deals", label: "Deals" },
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
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink text-ink-cream sm:flex">
        <div className="px-6 py-6">
          <p className="font-display text-xl font-normal">Mark Scott</p>
          <p className="eyebrow mt-1 text-blue">Admin</p>
        </div>
        <nav className="flex-1 space-y-3 border-t border-ink-cream/10 px-6 py-6 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-ink-cream/80 hover:text-ink-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ink-cream/10 px-6 py-6 text-sm">
          <Link href="/" className="block text-ink-muted hover:text-ink-cream">
            View Site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="mt-3 block text-left text-ink-muted hover:text-ink-cream"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-sand bg-cream/90 px-6 py-4 backdrop-blur sm:hidden">
          <p className="font-display text-lg font-normal text-navy">
            Mark Scott <span className="text-blue">Admin</span>
          </p>
          <form action={logout}>
            <button type="submit" className="text-sm text-navy/60">
              Sign Out
            </button>
          </form>
        </header>
        <nav className="flex gap-5 overflow-x-auto border-b border-sand bg-cream/90 px-6 py-3 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 text-sm font-medium text-navy/70 hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
