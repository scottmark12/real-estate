import Image from "next/image";
import Link from "next/link";
import type { ContactSettings } from "@/lib/types";

const FOOTER_NAV = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/insights", label: "Market Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Mobile's compact colophon keeps Invest discoverable (it signals the
// business extends past residential brokerage) without giving it primary
// nav weight while that page stays sparse. Desktop's FOOTER_NAV is
// untouched above.
const MOBILE_FOOTER_NAV = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/insights", label: "Market Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/invest", label: "Invest" },
];

export default function Footer({ contact }: { contact: ContactSettings }) {
  return (
    <footer
      className="border-t border-ink-cream/10 bg-ink text-ink-cream"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Compact mobile colophon — sm: and up render the unchanged
          desktop footer below instead. */}
      <div className="px-[4vw] pt-9 pb-7 sm:hidden">
        <Image
          src="/images/footer-logo.png"
          alt="Mark Scott Real Estate"
          width={1844}
          height={610}
          className="h-9 w-auto"
        />
        <p className="eyebrow mt-3 text-ink-muted">{contact.city_state}</p>

        <div className="mt-6 border-t border-ink-cream/10" />

        <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {MOBILE_FOOTER_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-1.5 text-ink-cream/80 hover:text-ink-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-5 border-t border-ink-cream/10" />

        <div className="mt-5 flex flex-col gap-1.5 text-sm text-ink-cream/80">
          <a
            href={`mailto:${contact.email}`}
            className="py-0.5 hover:text-ink-cream"
          >
            {contact.email}
          </a>
          {contact.phone && (
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              className="py-0.5 hover:text-ink-cream"
            >
              {contact.phone}
            </a>
          )}
        </div>

        <p className="mt-5 text-sm text-ink-cream/80">
          <a
            href={contact.instagram_url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-cream"
          >
            Instagram
          </a>
          <span className="mx-2 text-ink-cream/30">&middot;</span>
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-cream"
          >
            LinkedIn
          </a>
        </p>

        <div className="mt-5 space-y-1 text-xs text-ink-muted">
          <p>{contact.dre_number}</p>
          <p>
            &copy; {new Date().getFullYear()} Mark Scott Real Estate
          </p>
        </div>
      </div>

      <div className="hidden sm:block">
      <div className="grid gap-x-8 gap-y-10 px-[4vw] py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10">
        <div>
          <Image
            src="/images/footer-logo.png"
            alt="Mark Scott Real Estate"
            width={1844}
            height={610}
            className="h-14 w-auto"
          />
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
      </div>
    </footer>
  );
}
