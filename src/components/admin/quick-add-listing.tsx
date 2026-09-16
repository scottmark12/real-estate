"use client";

import { useState } from "react";
import ListingForm from "@/components/admin/listing-form";
import { btnSecondary } from "@/components/admin/ui";
import { importListing } from "@/app/admin/(dashboard)/listings/actions";
import type { Listing } from "@/lib/types";

export default function QuickAddListing() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<Partial<Listing> | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleFetch() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await importListing(url.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setImported(result.data);
      setFormKey((k) => k + 1);
    } catch {
      setError("Something went wrong reading that URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="border-b border-sand pb-8">
        <p className="eyebrow text-gold">Quick Add</p>
        <p className="mt-2 text-sm text-navy/60">
          Paste a link to the listing on our company site and we&apos;ll
          pull in the details and photos — review everything below before
          saving.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.premieragencyre.com/properties/…"
            className="w-full border border-navy/15 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/30 focus:border-navy focus:outline-none sm:flex-1"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className={`shrink-0 self-start ${btnSecondary} disabled:opacity-50`}
          >
            {loading ? "Fetching…" : "Fetch Listing"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {imported && !error && (
          <p className="mt-2 text-sm text-navy/60">
            Pulled in {imported.title || "the listing"}
            {imported.gallery_urls?.length
              ? ` and ${imported.gallery_urls.length + (imported.image_url ? 1 : 0)} photos`
              : ""}
            . Review the fields below, then save.
          </p>
        )}
      </div>

      <div className="mt-8">
        <ListingForm key={formKey} listing={imported ?? undefined} />
      </div>
    </div>
  );
}
