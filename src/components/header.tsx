import Link from "next/link";
import MobileNav from "@/components/mobile-nav";
import type { ContactSettings } from "@/lib/types";

const NAV_LINKS = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/invest", label: "Invest" },
  { href: "/insights", label: "Market Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ contact }: { contact: ContactSettings }) {
  return (
    <header className="sticky top-0 z-50 border-b border-sand/70 bg-cream/90 backdrop-blur">
      <div
        className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <Link href="/" className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-tight text-navy sm:text-xl">
            Mark Scott
          </span>
          <span className="eyebrow mt-0.5 block text-navy/60">
            Real Estate
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy/80 transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="eyebrow text-navy/60">{contact.city_state}</span>
          <Link
            href="/contact"
            className="border border-blue bg-blue px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-blue-dark"
          >
            Join the Newsletter
          </Link>
        </div>

        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}
