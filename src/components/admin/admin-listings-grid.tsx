"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ImagePlaceholder from "@/components/image-placeholder";
import { formatPrice, formatStats } from "@/lib/format";
import {
  deleteListing,
  reorderListings,
} from "@/app/admin/(dashboard)/listings/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import type { Listing } from "@/lib/types";

export default function AdminListingsGrid({
  listings: initial,
}: {
  listings: Listing[];
}) {
  const [listings, setListings] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const isFiltering = query.trim().length > 0;
  const visible = isFiltering
    ? listings.filter((l) => {
        const q = query.trim().toLowerCase();
        return l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
      })
    : listings;

  function persist(next: Listing[]) {
    setListings(next);
    reorderListings(next.map((l) => l.id));
  }

  function move(id: string, dir: -1 | 1) {
    const i = listings.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= listings.length) return;
    const next = [...listings];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function reorderTo(targetId: string | null) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const from = listings.findIndex((l) => l.id === draggingId);
    if (from < 0) return;
    const next = [...listings];
    const [moved] = next.splice(from, 1);
    const to = targetId ? next.findIndex((l) => l.id === targetId) : next.length;
    next.splice(to < 0 ? next.length : to, 0, moved);
    persist(next);
    setDraggingId(null);
    setDragOverId(null);
  }

  if (listings.length === 0) {
    return <p className="mt-8 text-navy/50">No listings yet.</p>;
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or location…"
        className="mt-6 w-full max-w-xs border border-navy/15 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/30 focus:border-navy focus:outline-none"
      />
      {isFiltering && (
        <p className="mt-2 text-xs text-navy/40">
          Reordering is disabled while searching — clear the search to drag or use the arrows.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((listing) => {
        const i = listings.findIndex((l) => l.id === listing.id);
        return (
        <div
          key={listing.id}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggingId && draggingId !== listing.id) setDragOverId(listing.id);
          }}
          onDragLeave={() =>
            setDragOverId((cur) => (cur === listing.id ? null : cur))
          }
          onDrop={(e) => {
            e.preventDefault();
            reorderTo(listing.id);
          }}
          className={`flex flex-col border bg-cream transition-opacity ${
            dragOverId === listing.id && draggingId && draggingId !== listing.id
              ? "border-blue"
              : "border-sand/70"
          } ${draggingId === listing.id ? "opacity-40" : ""}`}
        >
          <div className="relative aspect-4/3 w-full overflow-hidden">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder label="Listing Image" className="h-full" />
            )}
            {listing.featured && (
              <span className="eyebrow absolute right-3 top-3 inline-block bg-gold px-2.5 py-1 text-navy">
                Featured
              </span>
            )}
            {!listing.published && (
              <div className="absolute inset-x-0 bottom-0 bg-navy/80 py-1 text-center">
                <span className="eyebrow text-cream">Draft — not published</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1 p-4">
            <p className="font-display text-xl font-normal leading-snug text-navy">
              {listing.title}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-navy/50">
              {listing.location}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-xs text-navy/60">{formatStats(listing)}</p>
              <p className="text-sm font-semibold text-navy">{formatPrice(listing)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-sand px-4 py-3">
            <div className="flex items-center gap-3 text-navy/40">
              {!isFiltering && (
                <>
                  <span
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(listing.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                    title="Drag to reorder"
                    className="cursor-grab select-none text-sm leading-none hover:text-navy active:cursor-grabbing"
                  >
                    ⠿
                  </span>
                  <button
                    type="button"
                    onClick={() => move(listing.id, -1)}
                    disabled={i === 0}
                    title="Move earlier"
                    className="hover:text-navy disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(listing.id, 1)}
                    disabled={i === listings.length - 1}
                    title="Move later"
                    className="hover:text-navy disabled:opacity-30"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href={`/admin/listings/${listing.id}/edit`}
                className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
              >
                Edit
              </Link>
              <form action={deleteListing}>
                <input type="hidden" name="id" value={listing.id} />
                <DeleteButton
                  confirmMessage={`Delete "${listing.title}"? This can't be undone.`}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </DeleteButton>
              </form>
            </div>
          </div>
        </div>
        );
      })}

      {!isFiltering && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (draggingId) setDragOverId("__end__");
          }}
          onDragLeave={() => setDragOverId((cur) => (cur === "__end__" ? null : cur))}
          onDrop={(e) => {
            e.preventDefault();
            reorderTo(null);
          }}
          className={`col-span-full h-4 border-t-2 ${
            dragOverId === "__end__" && draggingId ? "border-blue" : "border-transparent"
          }`}
        />
      )}
      </div>

      {isFiltering && visible.length === 0 && (
        <p className="mt-8 text-navy/50">No listings match &quot;{query}&quot;.</p>
      )}
    </div>
  );
}
