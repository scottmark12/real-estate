import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { input, textarea } from "@/components/admin/ui";
import { CALL_OUTCOMES, outcomeLabel } from "@/lib/call-outcomes";
import { addClientNote } from "../clients/actions";
import { addCallLog } from "../deals/actions";
import type {
  Client,
  ClientNote,
  DealCallLog,
  DealCompany,
  DealContact,
  DealProperty,
} from "@/lib/types";

export const revalidate = 0;

const outcomeButton =
  "border border-navy/20 px-4 py-3 text-center text-sm font-medium text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream";
const terminalButton =
  "border border-red-300 px-4 py-3 text-center text-sm font-medium text-red-700 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white";

export default async function AdminCallsPage({
  searchParams,
}: PageProps<"/admin/calls">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const logged = typeof params.logged === "string" ? params.logged : undefined;
  const loggedOutcome =
    typeof params.outcome === "string" ? params.outcome : undefined;

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: dueClientsData }, { data: dueDealsData }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .lte("next_follow_up_date", today)
      .order("next_follow_up_date", { ascending: true }),
    supabase
      .from("deal_companies")
      .select("*")
      .lte("next_action_date", today)
      .order("next_action_date", { ascending: true }),
  ]);

  const dueClients = (dueClientsData as Client[]) ?? [];
  const dueDeals = (dueDealsData as DealCompany[]) ?? [];

  const queue = [
    ...dueClients.map((c) => ({ kind: "client" as const, date: c.next_follow_up_date as string, record: c })),
    ...dueDeals.map((d) => ({ kind: "deal" as const, date: d.next_action_date as string, record: d })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const remaining = queue.length;
  const current = queue[0];

  if (!current) {
    return (
      <div>
        <p className="eyebrow text-gold">Call Center</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          You&apos;re caught up
        </h1>
        <p className="mt-4 text-navy/60">Nothing due right now.</p>
      </div>
    );
  }

  let name = "";
  let phone: string | null = null;
  let email: string | null = null;
  let contextLine: string | null = null;
  let editHref = "";
  let contactId: string | null = null;

  if (current.kind === "client") {
    const client = current.record;
    name = client.name;
    phone = client.phone;
    email = client.email;
    editHref = `/admin/clients/${client.id}/edit`;

    const { data: notesData } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const lastNote = (notesData as ClientNote[] | null)?.[0] ?? null;

    contextLine = [
      client.timeline ? `Timeline: ${client.timeline}` : null,
      lastNote ? `Last: ${lastNote.body}` : "No prior activity logged",
    ]
      .filter(Boolean)
      .join(" — ");
  } else {
    const deal = current.record;
    name = deal.name;
    editHref = `/admin/deals/${deal.id}/edit`;

    const [{ data: contactsData }, { data: logsData }, { data: propsData }] =
      await Promise.all([
        supabase
          .from("deal_contacts")
          .select("*")
          .eq("company_id", deal.id)
          .order("is_decision_maker", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(1),
        supabase
          .from("deal_call_logs")
          .select("*")
          .eq("company_id", deal.id)
          .order("called_at", { ascending: false })
          .limit(1),
        supabase.from("deal_properties").select("name").eq("company_id", deal.id),
      ]);

    const contact = (contactsData as DealContact[] | null)?.[0] ?? null;
    const lastLog = (logsData as DealCallLog[] | null)?.[0] ?? null;
    const properties = (propsData as Pick<DealProperty, "name">[] | null) ?? [];

    phone = contact?.phone ?? null;
    email = contact?.email ?? null;
    contactId = contact?.id ?? null;
    name = contact?.name ? `${deal.name} — ${contact.name}` : deal.name;

    contextLine = [
      properties.length > 0
        ? properties.map((p) => p.name).filter(Boolean).join(", ")
        : null,
      lastLog
        ? `Last: ${lastLog.outcome ? outcomeLabel(lastLog.outcome) : lastLog.notes ?? "logged"}`
        : "No prior calls logged",
    ]
      .filter(Boolean)
      .join(" — ");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Call Center</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Who to Call
          </h1>
        </div>
        <p className="eyebrow text-navy/40">{remaining} remaining</p>
      </div>

      {error && (
        <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!error && logged && (
        <p className="mt-4 border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          &#10003; Logged {logged || "that call"}
          {loggedOutcome ? ` — ${loggedOutcome}` : ""}.
        </p>
      )}

      <div className="mt-8 border border-sand bg-white/60 p-8">
        <span
          className={`inline-block border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            current.kind === "client"
              ? "border-blue/40 text-blue"
              : "border-gold/40 text-gold"
          }`}
        >
          {current.kind === "client" ? "Client" : "Deal"}
        </span>

        <h2 className="mt-3 font-display text-3xl font-semibold text-navy">{name}</h2>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-lg">
          {phone ? (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-navy underline decoration-gold decoration-2 underline-offset-4">
              {phone}
            </a>
          ) : (
            <span className="text-navy/30">No phone on file</span>
          )}
          {email && <span className="text-navy/60">{email}</span>}
        </div>

        {contextLine && <p className="mt-4 text-sm text-navy/70">{contextLine}</p>}

        <Link
          href={editHref}
          className="eyebrow mt-4 inline-block text-navy/40 underline decoration-gold decoration-2 underline-offset-4"
        >
          View Full Profile &rarr;
        </Link>

        <form
          action={current.kind === "client" ? addClientNote : addCallLog}
          className="mt-8 flex flex-col gap-3 border-t border-sand pt-6"
        >
          <input type="hidden" name="return_to" value="/admin/calls" />
          <input type="hidden" name="record_name" value={name} />
          <input type="hidden" name="expected_date" value={current.date} />
          <input
            type="hidden"
            name={current.kind === "client" ? "client_id" : "company_id"}
            value={current.record.id}
          />
          {current.kind === "deal" && contactId && (
            <input type="hidden" name="contact_id" value={contactId} />
          )}
          <textarea
            name={current.kind === "client" ? "body" : "notes"}
            rows={2}
            placeholder="Optional note&hellip;"
            className={textarea}
          />
          <input
            type="date"
            name={current.kind === "client" ? "next_follow_up_date" : "next_action_date"}
            className={`${input} max-w-[200px]`}
          />
          <p className="text-xs text-navy/40">
            Date above only needed for &quot;Requested Callback&quot; — every
            other outcome schedules itself.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CALL_OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="submit"
                name="outcome"
                value={o.value}
                className={o.terminal ? terminalButton : outcomeButton}
              >
                {o.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
