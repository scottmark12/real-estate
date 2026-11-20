"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

// Pages with a full screen photo hero get a see-through header that sits on
// the photo and scrolls away with it, same as floridacoastal.co.
const OVERLAY_PATHS = ["/", "/neighborhoods", "/buy", "/sell"];

export default function Header({ contact }: { contact: ContactSettings }) {
  const pathname = usePathname();
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const clear = OVERLAY_PATHS.includes(pathname);

  return (
    <header
      className={`top-0 z-50 ${
        clear
          ? "absolute inset-x-0 bg-gradient-to-b from-black/35 to-transparent"
          : "sticky border-b border-sand/70 bg-cream/90 backdrop-blur"
      }`}
    >
      <div
        className="flex items-center gap-6 px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-10"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <Link href="/" className="shrink-0 justify-self-start">
          <Image
            src="/images/logo-v2.png"
            alt="Mark Scott Real Estate"
            width={954}
            height={370}
            priority
            className={`mt-1.5 h-10 w-auto sm:h-11 ${clear ? "brightness-0 invert" : ""}`}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-2.5 py-2 text-[16px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current xl:px-3 ${
                  clear
                    ? active
                      ? "text-white underline decoration-2 underline-offset-[10px]"
                      : "text-white hover:bg-white/15"
                    : active
                      ? "text-navy underline decoration-2 underline-offset-[10px]"
                      : "text-navy/80 hover:bg-navy/5 hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 justify-self-end lg:flex">
          <SavedLink light={clear} />
          {contact.phone ? (
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              className={`hidden text-[16px] font-semibold xl:block ${clear ? "text-white hover:text-white/80" : "text-navy hover:text-blue"}`}
            >
              {contact.phone}
            </a>
          ) : (
            <span className={`eyebrow hidden xl:block ${clear ? "text-white/70" : "text-navy/60"}`}>{contact.city_state}</span>
          )}
          <button
            type="button"
            onClick={() => setNewsletterOpen(true)}
            className={`rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors ${
              clear
                ? "bg-white text-ink hover:bg-white/85"
                : "bg-ink text-white hover:bg-blue"
            }`}
          >
            Join the Newsletter
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
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
