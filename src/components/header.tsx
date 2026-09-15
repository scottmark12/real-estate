"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MobileNav from "@/components/mobile-nav";
import NewsletterModal from "@/components/newsletter-modal";
import type { ContactSettings } from "@/lib/types";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/insights", label: "Market Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ contact }: { contact: ContactSettings }) {
  const pathname = usePathname();
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sand/70 bg-cream/90 backdrop-blur">
      <div
        className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo-v2.png"
            alt="Mark Scott Real Estate"
            width={954}
            height={370}
            priority
            className="mt-1.5 h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 pb-0.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-navy text-navy"
                    : "border-transparent text-navy/80 hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="eyebrow text-navy/60">{contact.city_state}</span>
          <button
            type="button"
            onClick={() => setNewsletterOpen(true)}
            className="border border-blue bg-blue px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-blue-dark"
          >
            Join the Newsletter
          </button>
        </div>

        <MobileNav
          links={NAV_LINKS}
          onOpenNewsletter={() => setNewsletterOpen(true)}
        />
      </div>

      <NewsletterModal
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
    </header>
  );
}
