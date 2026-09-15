import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ count: listingCount }, { count: articleCount }, { count: subCount }] =
    await Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("subscribers").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div>
      <p className="eyebrow text-gold">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Dashboard
      </h1>
      <p className="mt-2 text-navy/60">
        Manage listings, articles, and site settings. Changes go live
        immediately.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sand bg-white/70 p-6">
          <p className="text-3xl font-semibold text-navy">
            {listingCount ?? 0}
          </p>
          <p className="mt-1 text-sm text-navy/60">Listings</p>
          <Link
            href="/admin/listings"
            className="mt-3 inline-block text-sm font-semibold text-navy underline decoration-gold"
          >
            Manage
          </Link>
        </div>
        <div className="rounded-2xl border border-sand bg-white/70 p-6">
          <p className="text-3xl font-semibold text-navy">
            {articleCount ?? 0}
          </p>
          <p className="mt-1 text-sm text-navy/60">Articles</p>
          <Link
            href="/admin/articles"
            className="mt-3 inline-block text-sm font-semibold text-navy underline decoration-gold"
          >
            Manage
          </Link>
        </div>
        <div className="rounded-2xl border border-sand bg-white/70 p-6">
          <p className="text-3xl font-semibold text-navy">{subCount ?? 0}</p>
          <p className="mt-1 text-sm text-navy/60">Newsletter Subscribers</p>
        </div>
      </div>
    </div>
  );
}
