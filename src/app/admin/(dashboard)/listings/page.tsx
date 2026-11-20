/* eslint-disable @next/next/no-img-element -- MLS thumbnails come from the feed's image host */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import { btnPrimary } from "@/components/admin/ui";
import AdminListingsGrid from "@/components/admin/admin-listings-grid";
import {
  PAGE_SIZE,
  SORTS,
  formatFeedPrice,
  formatFeedStats,
  searchListings,
} from "@/lib/premier-feed";

export const revalidate = 0;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminListingsPage({
  searchParams,
}: PageProps<"/admin/listings">) {
  const sp = await searchParams;
  const q = one(sp.q) ?? "";
  const sort = one(sp.sort) ?? "recent";
  const page = Math.max(1, Math.floor(Number(one(sp.page)) || 1));

  const supabase = await createClient();
  const [feed, manual] = await Promise.all([
    searchListings({ q, sort, page }),
    supabase
      .from("listings")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);
  const manualListings = (manual.data as Listing[]) ?? [];

  const hasNext = feed ? page * PAGE_SIZE < feed.total : false;
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort !== "recent") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/listings?${s}` : "/admin/listings";
  };

  return (
    <div>
      <p className="eyebrow text-gold">Listings</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Live Listings
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-navy/60">
        What&apos;s showing on the site right now at{" "}
        <Link href="/buy" target="_blank" className="underline">
          /buy
        </Link>
        . Pulled from Premier Agency&apos;s MLS feed every 5 minutes, all of San
        Diego County, rentals filtered out.
      </p>

      {!feed ? (
        <p className="mt-8 border border-sand p-4 text-sm text-navy/70">
          The feed isn&apos;t responding right now, so the site is showing the
          &ldquo;Listings coming soon&rdquo; page. It&apos;ll come back on its own.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <form action="/admin/listings" method="get" className="flex flex-wrap gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="City, zip or address"
                className="w-64 border border-sand bg-white px-3 py-2 text-sm text-navy"
              />
              <select
                name="sort"
                defaultValue={sort}
                className="border border-sand bg-white px-3 py-2 text-sm text-navy"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button type="submit" className={btnPrimary}>Search</button>
            </form>
            <p className="text-sm text-navy/50">
              {new Intl.NumberFormat("en-US").format(feed.total)} active in the
              feed{q ? ` for “${q}”` : ""} &middot; page {page}
            </p>
          </div>

          <div className="mt-6 overflow-x-auto border-t border-sand">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-sand text-navy/40">
                <tr>
                  <th className="py-3 pr-4 font-medium">Home</th>
                  <th className="py-3 pr-4 font-medium">City</th>
                  <th className="py-3 pr-4 font-medium">Details</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">DOM</th>
                  <th className="py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {feed.listings.map((l) => (
                  <tr key={l.id} className="border-b border-sand/60 align-middle">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden bg-sand">
                          {l.primary_image_url && (
                            <img
                              src={l.primary_image_url}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-navy">{l.address}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-navy/70">
                      {l.city} {l.zip}
                    </td>
                    <td className="py-3 pr-4 text-navy/70">{formatFeedStats(l)}</td>
                    <td className="py-3 pr-4 font-semibold text-navy">
                      {formatFeedPrice(l.price)}
                    </td>
                    <td className="py-3 pr-4 text-navy/70">{l.days_on_market ?? "–"}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/buy/${l.id}`}
                        target="_blank"
                        className="text-blue underline underline-offset-2"
                      >
                        View on site
                      </Link>
                    </td>
                  </tr>
                ))}
                {feed.listings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-navy/60">
                      No homes match that search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {(page > 1 || hasNext) && (
            <div className="mt-6 flex justify-between text-sm">
              {page > 1 ? (
                <Link href={href(page - 1)} className="text-navy hover:text-blue">
                  &larr; Previous
                </Link>
              ) : (
                <span />
              )}
              {hasNext && (
                <Link href={href(page + 1)} className="text-navy hover:text-blue">
                  Next &rarr;
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <details className="mt-16 border-t border-sand pt-6">
        <summary className="cursor-pointer text-sm font-medium text-navy">
          Manual listings ({manualListings.length}) &middot; hidden from the site
          while the live feed is on
        </summary>
        <div className="mt-4 flex justify-end">
          <Link href="/admin/listings/new" className={btnPrimary}>
            + New Listing
          </Link>
        </div>
        <AdminListingsGrid listings={manualListings} />
      </details>
    </div>
  );
}
