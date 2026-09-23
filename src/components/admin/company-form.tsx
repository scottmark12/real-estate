import { btnPrimary, input, label, select, textarea } from "@/components/admin/ui";
import { upsertCompany } from "@/app/admin/(dashboard)/deals/actions";
import type { DealCompany } from "@/lib/types";

export default function CompanyForm({ company }: { company?: Partial<DealCompany> }) {
  return (
    <form action={upsertCompany} className="flex flex-col gap-8">
      {company?.id && <input type="hidden" name="id" value={company.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input name="name" defaultValue={company?.name} required className={input} />
        </div>
        <div>
          <label className={label}>Website</label>
          <input
            name="website"
            defaultValue={company?.website ?? ""}
            placeholder="https://example.com"
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Pipeline Stage</label>
          <select
            name="pipeline_stage"
            defaultValue={company?.pipeline_stage ?? "sourced"}
            className={select}
          >
            <option value="sourced">Sourced</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="negotiating">Negotiating</option>
            <option value="under_contract">Under Contract</option>
            <option value="closed">Closed</option>
            <option value="dead">Dead</option>
          </select>
        </div>
        <div>
          <label className={label}>Heat Score (0-10, optional)</label>
          <input
            type="number"
            step="1"
            min="0"
            max="10"
            name="heat_score"
            defaultValue={company?.heat_score ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Source</label>
          <input
            name="source"
            defaultValue={company?.source ?? ""}
            placeholder="referral, scrape, cold outreach..."
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Next Action Date</label>
          <input
            type="date"
            name="next_action_date"
            defaultValue={company?.next_action_date ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Next Action Type</label>
          <input
            name="next_action_type"
            defaultValue={company?.next_action_type ?? ""}
            placeholder="Call, email, follow up on LOI..."
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          defaultValue={company?.notes ?? ""}
          rows={4}
          placeholder="General notes about this owner/company — for a dated log of calls, use the activity log below instead."
          className={textarea}
        />
      </div>

      <button type="submit" className={`self-start ${btnPrimary}`}>
        {company ? "Save Changes" : "Create Company"}
      </button>
    </form>
  );
}
