import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client, DealCompany } from "@/lib/types";

export const revalidate = 0;

type CallQueueItem = {
  id: string;
  name: string;
  sub: string;
  date: string;
  kind: "client" | "deal";
  href: string;
};

export default async function AdminHomePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const [
    { count: listingCount },
    { count: articleCount },
    { count: subCount },
    { count: clientCount },
    { count: leadCount },
    { count: dealCount },
    { data: dueClientsData },
    { data: dueDealsData },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true }),
    supabase.from("deal_companies").select("*", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("*")
      .lte("next_follow_up_date", today)
      .order("next_follow_up_date", { ascending: true })
      .limit(8),
    supabase
      .from("deal_companies")
      .select("*")
      .lte("next_action_date", today)
      .order("next_action_date", { ascending: true })
      .limit(8),
  ]);

  const dueClients = (dueClientsData as Client[]) ?? [];
  const dueDeals = (dueDealsData as DealCompany[]) ?? [];

  const callQueue: CallQueueItem[] = [
    ...dueClients.map((c) => ({
      id: c.id,
      name: c.name,
      sub: c.timeline || "No timeline set",
      date: c.next_follow_up_date as string,
      kind: "client" as const,
      href: `/admin/clients/${c.id}/edit`,
    })),
    ...dueDeals.map((d) => ({
      id: d.id,
      name: d.name,
      sub: d.next_action_type || "No next-action type set",
      date: d.next_action_date as string,
      kind: "deal" as const,
      href: `/admin/deals/${d.id}/edit`,
    })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

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

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-sand pt-8 sm:grid-cols-3 lg:grid-cols-6">
        <div>
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
        <div>
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
        <div>
          <p className="font-display text-4xl font-normal text-navy">
            {dealCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Deals</p>
          <Link
            href="/admin/deals"
            className="eyebrow mt-4 inline-block text-navy underline decoration-gold decoration-2 underline-offset-4"
          >
            Manage &rarr;
          </Link>
        </div>
        <div>
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
        <div>
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
        <div>
          <p className="font-display text-4xl font-normal text-navy">
            {subCount ?? 0}
          </p>
          <p className="eyebrow mt-2 text-navy/50">Newsletter Subscribers</p>
        </div>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Call Today</p>
        <p className="mt-2 text-xs text-navy/50">
          Clients and deal companies whose next follow-up/action is due
          today or overdue.
        </p>
        <div className="mt-4 flex flex-col divide-y divide-sand border-t border-sand">
          {callQueue.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="flex items-center justify-between gap-4 py-4 hover:bg-sand/20"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-navy">{item.name}</p>
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      item.kind === "client"
                        ? "border-blue/40 text-blue"
                        : "border-gold/40 text-gold"
                    }`}
                  >
                    {item.kind === "client" ? "Client" : "Deal"}
                  </span>
                </div>
                <p className="text-sm text-navy/50">{item.sub}</p>
              </div>
              <p className="font-semibold text-red-600">{item.date}</p>
            </Link>
          ))}
          {callQueue.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">
              Nothing due — you&apos;re caught up.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
