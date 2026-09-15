"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav({
  links,
  onOpenNewsletter,
}: {
  links: { href: string; label: string }[];
  onOpenNewsletter: () => void;
}) {
  const [open, setOpen] = useState(false);

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
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenNewsletter();
              }}
              className="mt-2 rounded-full bg-navy px-5 py-2.5 text-center text-sm font-medium text-cream"
            >
              Join the Newsletter
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
