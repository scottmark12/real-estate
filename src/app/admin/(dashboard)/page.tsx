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

      <div className="mt-10 grid grid-cols-1 divide-y divide-sand border-t border-sand sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="py-6 sm:pr-8">
          <p className="font-display text-4xl font-normal text-navy">
            {listingCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Listings</p>
          <Link
            href="/admin/listings"
            className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Manage &rarr;
          </Link>
        </div>
        <div className="py-6 sm:px-8">
          <p className="font-display text-4xl font-normal text-navy">
            {articleCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Articles</p>
          <Link
            href="/admin/articles"
            className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Manage &rarr;
          </Link>
        </div>
        <div className="py-6 sm:pl-8">
          <p className="font-display text-4xl font-normal text-navy">
            {subCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Newsletter Subscribers</p>
        </div>
      </div>
    </div>
  );
}
