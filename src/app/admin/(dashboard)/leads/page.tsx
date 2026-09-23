import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { SubmitButton } from "@/components/admin/submit-button";
import type { ContactMessage } from "@/lib/types";
import { convertLead } from "./actions";

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const [{ data: messagesData }, { data: clientsData }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, contact_message_id"),
  ]);

  const messages = (messagesData as ContactMessage[]) ?? [];
  const convertedByMessageId = new Map(
    ((clientsData as { id: string; contact_message_id: string | null }[]) ?? [])
      .filter((c) => c.contact_message_id)
      .map((c) => [c.contact_message_id as string, c.id])
  );

  return (
    <div>
      <p className="eyebrow text-gold">Leads</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Inbound Leads
      </h1>
      <p className="mt-2 text-navy/60">
        Everything submitted through the site&apos;s contact and valuation
        forms. Convert a lead to start tracking it as a client.
      </p>

      <div className="mt-8 overflow-x-auto border-t border-sand">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="eyebrow px-4 py-3 font-medium">Name</th>
              <th className="eyebrow px-4 py-3 font-medium">Contact</th>
              <th className="eyebrow px-4 py-3 font-medium">Intent</th>
              <th className="eyebrow px-4 py-3 font-medium">Timeline</th>
              <th className="eyebrow px-4 py-3 font-medium">Source</th>
              <th className="eyebrow px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => {
              const convertedClientId = convertedByMessageId.get(m.id);
              return (
                <tr key={m.id} className="border-b border-sand/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy">
                    {m.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    <p>{m.email || "—"}</p>
                    {m.phone && <p className="text-xs text-navy/50">{m.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-navy/70">{m.intent || "—"}</td>
                  <td className="px-4 py-3 text-navy/70">{m.timeline || "—"}</td>
                  <td className="px-4 py-3 text-navy/70">{m.source || "—"}</td>
                  <td className="px-4 py-3 text-navy/70">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {convertedClientId ? (
                      <Link
                        href={`/admin/clients/${convertedClientId}/edit`}
                        className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                      >
                        View Client &rarr;
                      </Link>
                    ) : (
                      <form action={convertLead}>
                        <input type="hidden" name="id" value={m.id} />
                        <SubmitButton
                          className="border border-blue px-3 py-1.5 text-xs font-medium text-blue transition-colors hover:bg-blue hover:text-cream"
                          pendingLabel="Converting…"
                        >
                          Convert to Client
                        </SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {messages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy/50">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
