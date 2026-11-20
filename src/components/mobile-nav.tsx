"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav({
  links,
  phone,
  onOpenNewsletter,
}: {
  links: { href: string; label: string }[];
  phone?: string | null;
  onOpenNewsletter: () => void;
}) {
  const [open, setOpen] = useState(false);
  const digits = phone?.replace(/[^\d+]/g, "") || "";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-navy/20"
      >
        <span
          className={`h-0.5 w-5 bg-navy transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-navy transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-navy transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-sand bg-cream px-6 py-6 shadow-lg">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-navy"
              >
                {link.label}
              </Link>
            ))}
            {digits && (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <a
                  href={`tel:${digits}`}
                  className="bg-blue px-5 py-3 text-center text-sm font-semibold text-cream"
                >
                  Call Mark
                </a>
                <a
                  href={`sms:${digits}`}
                  className="border border-blue px-5 py-3 text-center text-sm font-semibold text-blue"
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
              className="text-left text-sm font-medium text-navy/70 underline decoration-gold underline-offset-4"
            >
              Join the Market Letter
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
