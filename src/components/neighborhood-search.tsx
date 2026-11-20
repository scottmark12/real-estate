"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

export type SearchItem = {
  slug: string;
  name: string;
  region: string;
  keys: string; // lowercase: name, region, city, zip, tags
};

function rank(item: SearchItem, q: string) {
  const name = item.name.toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  if (item.keys.includes(q)) return 3;
  return 99;
}

// Pill search: type a neighborhood, city, region or ZIP. Suggestions show
// as you type; Enter goes to the best match.
export default function NeighborhoodSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [miss, setMiss] = useState(false);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return items
      .map((it) => ({ it, r: rank(it, t) }))
      .filter((m) => m.r < 99)
      .sort((a, b) => a.r - b.r || a.it.name.localeCompare(b.it.name))
      .slice(0, 6)
      .map((m) => m.it);
  }, [q, items]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (matches[0]) {
      router.push(`/neighborhoods/${matches[0].slug}`);
    } else {
      setMiss(true);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl text-left">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-full border border-white/30 bg-black/35 p-2 pl-6 backdrop-blur-md"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/80" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="nb-search" className="sr-only">
          Search a neighborhood, city or ZIP
        </label>
        <input
          id="nb-search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setMiss(false);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a neighborhood, city or ZIP"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-white placeholder:text-white/65 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-cream"
        >
          Search
        </button>
      </form>

      {open && matches.length > 0 && (
        <ul className="absolute inset-x-4 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white py-2 shadow-2xl">
          {matches.map((m) => (
            <li key={m.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => router.push(`/neighborhoods/${m.slug}`)}
                className="flex w-full items-baseline justify-between gap-4 px-5 py-2.5 text-left hover:bg-cream-deep"
              >
                <span className="text-navy">{m.name}</span>
                <span className="text-xs text-navy/45">{m.region}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {miss && (
        <p className="mt-3 text-center text-sm text-white/85">
          No neighborhood matches that yet. Try a city like Encinitas, or a ZIP.
        </p>
      )}
    </div>
  );
}
