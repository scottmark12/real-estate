import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, btnSecondary, tag } from "@/components/admin/ui";
import { deleteClient } from "./actions";
import { DeleteButton } from "@/components/admin/delete-button";
import type { Client, ClientStatus } from "@/lib/types";

export const revalidate = 0;

const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: "Lead",
  active: "Active",
  under_contract: "Under Contract",
  past_client: "Past Client",
  lost: "Lost",
};

const TABS: { value: ClientStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "under_contract", label: "Under Contract" },
  { value: "past_client", label: "Past Client" },
  { value: "lost", label: "Lost" },
];

function isOverdue(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr <= today;
}

// `,` `(` `)` are syntactically significant in a PostgREST .or() filter
// string — strip them so a search term can't break out of the filter.
function sanitizeSearch(q: string) {
  return q.replace(/[,()]/g, " ").trim();
}

export default async function AdminClientsPage({
  searchParams,
}: PageProps<"/admin/clients">) {
  const params = await searchParams;
  const statusFilter =
    typeof params.status === "string" ? (params.status as ClientStatus) : undefined;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const imported = typeof params.imported === "string" ? params.imported : undefined;
  const skipped = typeof params.skipped === "string" ? params.skipped : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("*")
    .order("next_follow_up_date", { ascending: true, nullsFirst: false });

  if (statusFilter) query = query.eq("status", statusFilter);
  const cleanQ = sanitizeSearch(q);
  if (cleanQ) query = query.or(`name.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%`);

  const { data } = await query;
  const clients = (data as Client[]) ?? [];

  function hrefFor(status: ClientStatus | "all") {
    const qs = new URLSearchParams();
    if (status !== "all") qs.set("status", status);
    if (q) qs.set("q", q);
    const s = qs.toString();
    return s ? `/admin/clients?${s}` : "/admin/clients";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Clients</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            All Clients
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/clients/import" className={btnSecondary}>
            Import CSV
          </Link>
          <Link href="/admin/clients/new" className={btnPrimary}>
            + New Client
          </Link>
        </div>
      </div>

      {imported !== undefined && (
        <p className="mt-4 border border-sand bg-white/60 px-4 py-3 text-sm text-navy">
          Imported {imported} client{imported === "1" ? "" : "s"}.
          {skipped && skipped !== "0"
            ? ` Skipped ${skipped} row${skipped === "1" ? "" : "s"} with no name.`
            : ""}
        </p>
      )}

      <form method="get" className="mt-6 flex gap-2">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-full max-w-xs border border-navy/15 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/30 focus:border-navy focus:outline-none"
        />
        <button type="submit" className={btnSecondary}>
          Search
        </button>
        {q && (
          <Link
            href={statusFilter ? `/admin/clients?status=${statusFilter}` : "/admin/clients"}
            className="self-center text-xs text-navy/40 underline decoration-gold decoration-2 underline-offset-4"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={hrefFor(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              (statusFilter ?? "all") === t.value
                ? "border-navy bg-navy text-cream"
                : "border-navy/20 text-navy/70"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto border-t border-sand">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="eyebrow px-4 py-3 font-medium">Name</th>
              <th className="eyebrow px-4 py-3 font-medium">Status</th>
              <th className="eyebrow px-4 py-3 font-medium">Type</th>
              <th className="eyebrow px-4 py-3 font-medium">Timeline</th>
              <th className="eyebrow px-4 py-3 font-medium">Next Follow-up</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-sand/60 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">
                  <Link
                    href={`/admin/clients/${c.id}/edit`}
                    className="underline decoration-gold decoration-2 underline-offset-4"
                  >
                    {c.name}
                  </Link>
                  {c.email && (
                    <p className="mt-0.5 text-xs font-normal text-navy/50">{c.email}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`${tag} border-navy/20 text-navy/70`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-navy/70">{c.client_type}</td>
                <td className="px-4 py-3 text-navy/70">{c.timeline || "—"}</td>
                <td className="px-4 py-3">
                  {c.next_follow_up_date ? (
                    <span
                      className={
                        isOverdue(c.next_follow_up_date)
                          ? "font-semibold text-red-600"
                          : "text-navy/70"
                      }
                    >
                      {c.next_follow_up_date}
                    </span>
                  ) : (
                    <span className="text-navy/30">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/clients/${c.id}/edit`}
                      className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                    >
                      Edit
                    </Link>
                    <form action={deleteClient}>
                      <input type="hidden" name="id" value={c.id} />
                      <DeleteButton
                        confirmMessage={`Delete ${c.name}? This can't be undone.`}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </DeleteButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
