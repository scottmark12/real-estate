"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import FeedListingCard from "@/components/feed-listing-card";
import type { FeedListing } from "@/lib/premier-feed";
import { savedSnapshot, subscribeSaved } from "@/lib/saved-homes";

export default function SavedHomesView() {
  const snap = useSyncExternalStore(subscribeSaved, savedSnapshot, () => "[]");
  const [listings, setListings] = useState<FeedListing[] | null>(null);
  const [sendStatus, setSendStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(snap) as string[];
    } catch {
      ids = [];
    }
    let cancelled = false;
    const load = ids.length
      ? fetch(`/api/listings?ids=${ids.join(",")}`)
          .then((r) => r.json())
          .then((j: { listings: FeedListing[] }) => {
            const byId = new Map(j.listings.map((l) => [l.id, l]));
            return ids.map((id) => byId.get(id)).filter((l): l is FeedListing => l != null);
          })
          .catch(() => [] as FeedListing[])
      : Promise.resolve([] as FeedListing[]);
    load.then((ls) => {
      if (!cancelled) setListings(ls);
    });
    return () => {
      cancelled = true;
    };
  }, [snap]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const list = (listings ?? [])
      .map((l) => `${l.address}, ${l.city} (markscott.co/buy/${l.id})`)
      .join("\n");
    setSendStatus("loading");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        intent: "Buying",
        context: `${listings?.length ?? 0} saved homes`,
        message: `Saved homes: I'd like your take on these.\n${list}`,
      }),
    }).catch(() => null);
    setSendStatus(res?.ok ? "done" : "error");
  }

  if (listings === null) {
    return <p className="mt-10 text-navy/60">Loading your saved homes…</p>;
  }

  if (listings.length === 0) {
    return (
      <div className="mt-10 border border-navy/10 bg-cream-deep p-10 text-center">
        <p className="font-georgia text-[26px] text-navy">No saved homes yet.</p>
        <p className="mt-2 text-navy/60">Tap the heart on any home to keep it here.</p>
        <Link href="/buy" className="mt-6 inline-block bg-ink px-6 py-3 text-sm font-semibold text-white">
          Browse homes
        </Link>
      </div>
    );
  }

  const field =
    "w-full border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none";

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.id}>
            <FeedListingCard listing={l} />
            {l.status !== "active" && (
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-red-600">
                No longer active
              </p>
            )}
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-8 bg-ink p-8 text-white sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="font-georgia text-[30px] leading-tight">Want my take on these?</p>
          <p className="mt-2 text-white/70">
            Send me your list and I&apos;ll tell you what each listing doesn&apos;t:
            comps, condition and what I&apos;d offer.
          </p>
        </div>
        {sendStatus === "done" ? (
          <p className="text-lg">Got it. I&apos;ll call or text you today.</p>
        ) : (
          <form onSubmit={send} className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Your name" className={field} />
            <input name="email" type="email" required placeholder="Email" className={field} />
            <input name="phone" type="tel" placeholder="Phone (optional)" className={field} />
            <button
              type="submit"
              disabled={sendStatus === "loading"}
              className="bg-blue px-5 py-3 text-sm font-semibold text-white hover:bg-blue-dark disabled:opacity-60"
            >
              {sendStatus === "loading" ? "Sending…" : "Send My List to Mark"}
            </button>
            {sendStatus === "error" && (
              <p className="text-xs text-red-300 sm:col-span-2">Something went wrong. Try again?</p>
            )}
          </form>
        )}
      </section>
    </>
  );
}
