import { btnPrimary, input, label, select, textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { upsertClient } from "@/app/admin/(dashboard)/clients/actions";
import type { Client } from "@/lib/types";

export default function ClientForm({ client }: { client?: Partial<Client> }) {
  return (
    <form action={upsertClient} className="flex flex-col gap-8">
      {client?.id && <input type="hidden" name="id" value={client.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input name="name" defaultValue={client?.name} required className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            name="email"
            defaultValue={client?.email ?? ""}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Phone</label>
          <input name="phone" defaultValue={client?.phone ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Timeline</label>
          <input
            name="timeline"
            defaultValue={client?.timeline ?? ""}
            placeholder="0-3 months"
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Status</label>
          <select name="status" defaultValue={client?.status ?? "lead"} className={select}>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="under_contract">Under Contract</option>
            <option value="past_client">Past Client</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div>
          <label className={label}>Type</label>
          <select
            name="client_type"
            defaultValue={client?.client_type ?? "buyer"}
            className={select}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="investor">Investor</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={label}>Next Follow-up</label>
          <input
            type="date"
            name="next_follow_up_date"
            defaultValue={client?.next_follow_up_date ?? ""}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          defaultValue={client?.notes ?? ""}
          rows={4}
          placeholder="General profile notes — for a dated log of calls/touchpoints, use the activity log below instead."
          className={textarea}
        />
      </div>

      <SubmitButton className={`self-start ${btnPrimary}`} pendingLabel="Saving…">
        {client ? "Save Changes" : "Create Client"}
      </SubmitButton>
    </form>
  );
}
