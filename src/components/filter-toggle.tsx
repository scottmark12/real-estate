"use client";

import { useState, type ReactNode } from "react";

// Phones see just the search box plus a Filters button; desktop shows everything inline.
export default function FilterToggle({ children, active = 0 }: { children: ReactNode; active?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between bg-white px-5 py-4 text-sm font-medium text-navy lg:hidden"
      >
        <span>Filters{active ? ` (${active})` : ""}</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      <div className={open ? "contents" : "hidden lg:contents"}>{children}</div>
    </>
  );
}
