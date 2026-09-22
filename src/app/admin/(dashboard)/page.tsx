import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export const revalidate = 0;

export default async function AdminHomePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const [
    { count: listingCount },
    { count: articleCount },
    { count: subCount },
    { count: clientCount },
    { count: leadCount },
    { data: callToday },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("*")
      .lte("next_follow_up_date", today)
      .order("next_follow_up_date", { ascending: true })
      .limit(8),
  ]);

  const dueClients = (callToday as Client[]) ?? [];

  return (
    <div>
      <p className="eyebrow text-gold">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Dashboard
      </h1>
      <p className="mt-2 text-navy/60">
        Manage clients, listings, articles, and site settings. Changes go
        live immediately.
      </p>

      <div className="mt-10 grid grid-cols-2 divide-y divide-sand border-t border-sand sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        <div className="py-6 sm:pr-6">
          <p className="font-display text-4xl font-normal text-navy">
            {clientCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Clients</p>
          <Link
            href="/admin/clients"
            className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Manage &rarr;
          </Link>
        </div>
        <div className="py-6 sm:px-6">
          <p className="font-display text-4xl font-normal text-navy">
            {leadCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Leads</p>
          <Link
            href="/admin/leads"
            className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Review &rarr;
          </Link>
        </div>
        <div className="py-6 sm:px-6">
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
        <div className="py-6 sm:px-6">
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
        <div className="py-6 sm:pl-6">
          <p className="font-display text-4xl font-normal text-navy">
            {subCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Newsletter Subscribers</p>
        </div>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Call Today</p>
        <p className="mt-2 text-xs text-navy/50">
          Clients whose next follow-up is due today or overdue.
        </p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {dueClients.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clients/${c.id}/edit`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-sand/20"
            >
              <div>
                <p className="font-medium text-navy">{c.name}</p>
                <p className="text-sm text-navy/50">
                  {c.timeline || "No timeline set"}
                </p>
              </div>
              <p className="font-semibold text-red-600">
                {c.next_follow_up_date}
              </p>
            </Link>
          ))}
          {dueClients.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">
              Nothing due — you&apos;re caught up.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
