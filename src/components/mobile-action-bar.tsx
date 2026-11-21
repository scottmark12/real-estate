"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Phone only bar pinned to the bottom of the screen: Call, Text, and the
 * home value form. It slides in once the visitor scrolls past the hero so
 * it never covers the hero's own buttons.
 */
export default function MobileActionBar({ phone }: { phone?: string | null }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const digits = phone?.replace(/[^\d+]/g, "") || "";

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // The contact page already puts call, text and the form front and center.
  if (!digits || pathname === "/contact") return null;

  const onSell = pathname === "/sell";
  const onListing = pathname.startsWith("/buy/");

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-2 px-3 py-2.5">
        <a
          href={`tel:${digits}`}
          tabIndex={show ? 0 : -1}
          className="flex min-h-[48px] items-center justify-center border border-ink text-[15px] font-semibold text-ink"
        >
          Call
        </a>
        <a
          href={`sms:${digits}`}
          tabIndex={show ? 0 : -1}
          className="flex min-h-[48px] items-center justify-center border border-ink text-[15px] font-semibold text-ink"
        >
          Text
        </a>
        {onListing ? (
          <a
            href="#tour"
            tabIndex={show ? 0 : -1}
            className="flex min-h-[48px] items-center justify-center bg-ink px-2 text-center text-[15px] font-semibold text-white"
          >
            Request a tour
          </a>
        ) : onSell ? (
          <button
            type="button"
            tabIndex={show ? 0 : -1}
            onClick={() => window.dispatchEvent(new Event("open-valuation"))}
            className="flex min-h-[48px] items-center justify-center bg-ink px-2 text-center text-[15px] font-semibold text-white"
          >
            Home value
          </button>
        ) : (
          <Link
            href="/sell?value=1"
            tabIndex={show ? 0 : -1}
            className="flex min-h-[48px] items-center justify-center bg-ink px-2 text-center text-[15px] font-semibold text-white"
          >
            Home value
          </Link>
        )}
      </div>
    </div>
  );
}
