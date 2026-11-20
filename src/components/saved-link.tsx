"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { savedSnapshot, subscribeSaved } from "@/lib/saved-homes";

// Heart in the header with a count, like the template sites.
export default function SavedLink({ className = "", light = false }: { className?: string; light?: boolean }) {
  const snap = useSyncExternalStore(subscribeSaved, savedSnapshot, () => "[]");
  let count = 0;
  try {
    count = (JSON.parse(snap) as unknown[]).length;
  } catch {
    count = 0;
  }
  return (
    <Link
      href="/saved"
      aria-label={`Saved homes${count ? ` (${count})` : ""}`}
      className={`relative flex h-10 w-10 items-center justify-center transition-colors ${light ? "text-white hover:text-white/80" : "text-navy hover:text-blue"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={count ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.4 5 7 5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.6 0 5.8 3.6 4.5 6.8C19.5 16.4 12 21 12 21z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 top-0.5 min-w-[18px] rounded-full bg-blue px-1 text-center text-[10px] font-semibold leading-[18px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
