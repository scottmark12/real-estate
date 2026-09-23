import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientForm from "@/components/admin/client-form";
import { btnPrimary, btnSecondary, input, label, select, textarea } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import { CALL_OUTCOMES } from "@/lib/call-outcomes";
import type { BuyBox, Client, ClientNote } from "@/lib/types";
import { addClientNote, deleteBuyBox, upsertBuyBox } from "../../actions";

export const revalidate = 0;

function formatCents(cents: number | null) {
  if (cents == null) return "";
  return String(cents / 100);
}

function BuyBoxCard({ clientId, box }: { clientId: string; box?: BuyBox }) {
  return (
    <form
      action={upsertBuyBox}
      className="grid gap-4 border border-sand bg-white/60 p-5 sm:grid-cols-2"
    >
      {box?.id && <input type="hidden" name="id" value={box.id} />}
      <input type="hidden" name="client_id" value={clientId} />

      <div>
        <label className={label}>Label</label>
        <input
          name="label"
          defaultValue={box?.label}
          required
          placeholder="Primary residence search"
          className={input}
        />
      </div>
      <div>
        <label className={label}>Property Type</label>
        <input
          name="property_type"
          defaultValue={box?.property_type ?? ""}
          placeholder="residential / multifamily / development"
          className={input}
        />
      </div>

      <div>
        <label className={label}>Min Price (USD)</label>
        <input
          type="number"
          step="1"
          name="min_price_dollars"
          defaultValue={formatCents(box?.min_price_cents ?? null)}
          className={input}
        />
      </div>
      <div>
        <label className={label}>Max Price (USD)</label>
        <input
          type="number"
          step="1"
          name="max_price_dollars"
          defaultValue={formatCents(box?.max_price_cents ?? null)}
          className={input}
        />
      </div>

      <div>
        <label className={label}>Min Beds</label>
        <input
          type="number"
          step="0.5"
          name="beds_min"
          defaultValue={box?.beds_min ?? ""}
          className={input}
        />
      </div>
      <div>
        <label className={label}>Min Baths</label>
        <input
          type="number"
          step="0.5"
          name="baths_min"
          defaultValue={box?.baths_min ?? ""}
          className={input}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Areas (comma-separated)</label>
        <input
          name="areas"
          defaultValue={box?.areas?.join(", ") ?? ""}
          placeholder="Encinitas, Carlsbad, North County coastal"
          className={input}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          defaultValue={box?.notes ?? ""}
          rows={2}
          className={textarea}
        />
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" className={btnSecondary}>
          {box ? "Save Buy Box" : "Add Buy Box"}
        </button>
        {box?.id && (
          <form action={deleteBuyBox}>
            <input type="hidden" name="id" value={box.id} />
            <input type="hidden" name="client_id" value={clientId} />
            <button type="submit" className="text-sm text-red-600 hover:text-red-700">
              Delete
            </button>
          </form>
        )}
      </div>
    </form>
  );
}

export default async function EditClientPage({
  params,
}: PageProps<"/admin/clients/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: clientData }, { data: buyBoxData }, { data: notesData }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("buy_boxes")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("client_notes")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const client = clientData as Client | null;
  if (!client) notFound();

  const buyBoxes = (buyBoxData as BuyBox[]) ?? [];
  const notes = (notesData as ClientNote[]) ?? [];

  return (
    <div>
      <p className="eyebrow text-gold">Clients</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        {client.name}
      </h1>

      <div className="mt-8">
        <ClientForm client={client} />
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Buy Boxes</p>
        <p className="mt-2 text-xs text-navy/50">
          A client can have more than one — e.g. a primary-residence search
          and a separate investment search.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {buyBoxes.map((box) => (
            <BuyBoxCard key={box.id} clientId={client.id} box={box} />
          ))}
          <div>
            <p className="eyebrow mb-2 text-navy/40">Add Another Buy Box</p>
            <BuyBoxCard clientId={client.id} />
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Activity Log</p>
        <p className="mt-2 text-xs text-navy/50">
          Log a call, email, or note. Setting a follow-up date here updates
          the client&apos;s next-follow-up date above.
        </p>

        <form action={addClientNote} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="client_id" value={client.id} />
          <div>
            <label className={label}>Outcome</label>
            <select name="outcome" required defaultValue="" className={select}>
              <option value="" disabled>
                Select what happened&hellip;
              </option>
              {CALL_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-navy/50">
              Picking an outcome sets the next follow-up date automatically —
              override it below only if you need a specific date.
            </p>
          </div>
          <div>
            <label className={label}>Note</label>
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Called — still deciding on a neighborhood, wants to see North County listings next week."
              className={textarea}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[240px_1fr] sm:items-end">
            <div>
              <label className={label}>Override Next Follow-up (optional)</label>
              <input type="date" name="next_follow_up_date" className={input} />
            </div>
            <button type="submit" className={`self-start ${btnPrimary}`}>
              Add Note
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col divide-y divide-sand border-t border-sand">
          {notes.map((note) => (
            <div key={note.id} className="py-4">
              {note.outcome && (
                <p className="text-sm font-medium text-navy">
                  {CALL_OUTCOMES.find((o) => o.value === note.outcome)?.label ??
                    note.outcome}
                </p>
              )}
              <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{note.body}</p>
              <p className="eyebrow mt-2 text-navy/40">
                {formatDate(note.created_at)}
                {note.next_follow_up_date &&
                  ` · Follow up ${note.next_follow_up_date}`}
              </p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">
              No activity logged yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
