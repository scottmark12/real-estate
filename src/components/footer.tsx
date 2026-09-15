import Link from "next/link";
import type { ContactSettings } from "@/lib/types";

const FOOTER_NAV = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/invest", label: "Invest" },
  { href: "/insights", label: "Market Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ contact }: { contact: ContactSettings }) {
  return (
    <footer
      className="border-t border-sand/70 bg-navy text-cream"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <p className="font-display text-xl font-semibold">
            Mark Scott <span className="text-gold">Real Estate</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Residential, commercial, and investment real estate expertise
            across {contact.city_state}.
          </p>
        </div>

        <div>
          <p className="eyebrow text-cream/50">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm">
            {FOOTER_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-cream/80 hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cream/50">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>{contact.city_state}</li>
            {contact.phone && <li>{contact.phone}</li>}
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-cream"
              >
                {contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cream/50">Follow</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>
              <a
                href={contact.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 py-5 text-center text-xs text-cream/50 lg:px-10">
        &copy; {new Date().getFullYear()} Mark Scott Real Estate. {contact.dre_number}. All rights reserved.
      </div>
    </footer>
  );
}
