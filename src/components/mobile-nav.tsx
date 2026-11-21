"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Full screen mobile menu. Rendered in a portal on <body> because the
 * sticky header uses backdrop-blur, which would otherwise trap a fixed
 * overlay inside the header box.
 */
export default function MobileNav({
  links,
  phone,
  onOpenNewsletter,
  light = false,
}: {
  links: { href: string; label: string }[];
  phone?: string | null;
  onOpenNewsletter: () => void;
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const digits = phone?.replace(/[^\d+]/g, "") || "";

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Lock the page behind the menu and close it with Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const bar = light && !open ? "bg-white" : "bg-navy";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border ${
          light && !open ? "border-white/50" : "border-navy/20"
        }`}
      >
        <span className={`h-0.5 w-5 ${bar} transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-5 ${bar} transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-5 ${bar} transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-cream px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] lg:hidden"
          >
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-label="Mark Scott Real Estate, home"
              >
                <Image
                  src="/images/logo-v2.png"
                  alt=""
                  width={954}
                  height={370}
                  sizes="120px"
                  className="h-10 w-auto"
                />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 text-2xl leading-none text-navy"
              >
                &times;
              </button>
            </div>
            <nav className="mt-4 flex flex-col">
              {links.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="flex min-h-[60px] items-center justify-between border-b border-navy/10 font-georgia text-[30px] leading-none text-navy"
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={`text-lg ${active ? "text-gold" : "text-navy/30"}`}
                    >
                      &rarr;
                    </span>
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/sell?value=1"
              onClick={() => setOpen(false)}
              className="mt-8 flex min-h-[52px] items-center justify-center bg-ink px-5 text-center text-[15px] font-semibold text-white"
            >
              What&apos;s my home worth?
            </Link>

            {digits && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href={`tel:${digits}`}
                  className="flex min-h-[52px] items-center justify-center border border-ink text-[15px] font-semibold text-ink"
                >
                  Call Mark
                </a>
                <a
                  href={`sms:${digits}`}
                  className="flex min-h-[52px] items-center justify-center border border-ink text-[15px] font-semibold text-ink"
                >
                  Text Mark
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenNewsletter();
              }}
              className="mt-6 min-h-[44px] self-start text-left text-[15px] font-medium text-navy/70 underline decoration-gold underline-offset-4"
            >
              Join the Market Letter
            </button>

            <p className="mt-auto pt-10 text-xs text-navy/50">
              Mark Scott, Premier Agency Real Estate · Encinitas, CA
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
