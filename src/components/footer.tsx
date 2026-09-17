import Link from "next/link";
import type { ContactSettings } from "@/lib/types";

const FOOTER_NAV = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/invest", label: "Invest" },
  { href: "/insights", label: "Market Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ contact }: { contact: ContactSettings }) {
  return (
    <footer
      className="border-t border-ink-cream/10 bg-ink text-ink-cream"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid gap-x-8 gap-y-10 px-[4vw] py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10">
        <div>
          <p className="font-display text-2xl font-normal">Mark Scott</p>
          <p className="eyebrow mt-1 text-blue">Real Estate</p>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Residential, commercial, and investment real estate across{" "}
            {contact.city_state}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:contents">
          <div className="lg:border-l lg:border-ink-cream/10 lg:pl-8">
            <p className="eyebrow text-ink-muted">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-cream/80 hover:text-ink-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:border-l lg:border-ink-cream/10 lg:pl-8">
            <p className="eyebrow text-ink-muted">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-cream/80">
              <li>{contact.city_state}</li>
              {contact.phone && <li>{contact.phone}</li>}
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-ink-cream"
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:border-l lg:border-ink-cream/10 lg:pl-8">
          <p className="eyebrow text-ink-muted">Follow</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-cream/80">
            <li>
              <a
                href={contact.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-cream"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-cream"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-cream/10 px-[4vw] py-5">
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p className="eyebrow text-ink-muted">
            San Diego, CA{" "}
            <span className="hidden sm:inline">
              &middot; 32.7157&deg; N, 117.1611&deg; W
            </span>
          </p>
          <p>
            &copy; {new Date().getFullYear()} Mark Scott Real Estate &middot;{" "}
            {contact.dre_number} &middot; All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
