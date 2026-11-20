"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MobileNav from "@/components/mobile-nav";
import NewsletterModal from "@/components/newsletter-modal";
import SavedLink from "@/components/saved-link";
import type { ContactSettings } from "@/lib/types";

const NAV_LINKS = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/insights", label: "Market Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Pages with a full screen photo hero get a see-through header that turns
// solid once you scroll, like floridacoastal.co.
const OVERLAY_PATHS = ["/neighborhoods", "/buy"];

export default function Header({ contact }: { contact: ContactSettings }) {
  const pathname = usePathname();
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlayPage = OVERLAY_PATHS.includes(pathname);
  const clear = overlayPage && !scrolled;

  useEffect(() => {
    if (!overlayPage) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayPage]);

  return (
    <header
      className={`top-0 z-50 border-b transition-colors duration-300 ${
        overlayPage ? "fixed inset-x-0" : "sticky"
      } ${clear ? "border-transparent bg-transparent" : "border-sand/70 bg-cream/90 backdrop-blur"}`}
    >
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
            className={`mt-1.5 h-9 w-auto transition-[filter] duration-300 sm:h-10 ${clear ? "brightness-0 invert" : ""}`}
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
                  clear
                    ? active
                      ? "border-white text-white"
                      : "border-transparent text-white/85 hover:text-white"
                    : active
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
          <SavedLink light={clear} />
          {contact.phone ? (
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              className={`text-sm font-medium ${clear ? "text-white hover:text-white/80" : "text-navy hover:text-blue"}`}
            >
              {contact.phone}
            </a>
          ) : (
            <span className={`eyebrow ${clear ? "text-white/70" : "text-navy/60"}`}>{contact.city_state}</span>
          )}
          <button
            type="button"
            onClick={() => setNewsletterOpen(true)}
            className={`border px-5 py-2.5 text-sm font-medium transition-colors ${
              clear
                ? "border-white bg-transparent text-white hover:bg-white hover:text-navy"
                : "border-blue bg-blue text-cream hover:bg-blue-dark"
            }`}
          >
            Join the Newsletter
          </button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
        <SavedLink light={clear} />
        <MobileNav
          links={NAV_LINKS}
          phone={contact.phone}
          onOpenNewsletter={() => setNewsletterOpen(true)}
          light={clear}
        />
        </div>
      </div>

      <NewsletterModal
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
      />
    </header>
  );
}
