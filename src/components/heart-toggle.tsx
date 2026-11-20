"use client";

import { useSyncExternalStore } from "react";
import { savedSnapshot, subscribeSaved, toggleSaved } from "@/lib/saved-homes";

export default function HeartToggle({
  id,
  className = "",
  withLabel = false,
}: {
  id: string;
  className?: string;
  withLabel?: boolean;
}) {
  const snap = useSyncExternalStore(subscribeSaved, savedSnapshot, () => "[]");
  const on = snap.includes(`"${id}"`);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from saved homes" : "Save this home"}
      className={`flex items-center gap-2 ${className}`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110 ${
          on ? "text-red-500" : "text-navy/70"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.4 5 7 5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.6 0 5.8 3.6 4.5 6.8C19.5 16.4 12 21 12 21z" />
        </svg>
      </span>
      {withLabel && (
        <span className="text-sm font-medium text-navy">{on ? "Saved" : "Save this home"}</span>
      )}
    </button>
  );
}
