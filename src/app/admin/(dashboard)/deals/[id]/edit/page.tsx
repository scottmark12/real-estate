import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanyForm from "@/components/admin/company-form";
import { btnPrimary, btnSecondary, input, label, textarea } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import type {
  DealCallLog,
  DealCompany,
  DealContact,
  DealFinancials,
  DealProperty,
} from "@/lib/types";
import {
  addCallLog,
  deleteContact,
  deleteProperty,
  upsertContact,
  upsertFinancials,
  upsertProperty,
} from "../../actions";

export const revalidate = 0;

function PropertyCard({
  companyId,
  property,
  financials,
}: {
  companyId: string;
  property?: DealProperty;
  financials?: DealFinancials;
}) {
  return (
    <div className="border border-sand bg-white/60 p-5">
      <form action={upsertProperty} className="grid gap-4 sm:grid-cols-2">
        {property?.id && <input type="hidden" name="id" value={property.id} />}
        <input type="hidden" name="company_id" value={companyId} />

        <div>
          <label className={label}>Property Name</label>
          <input name="name" defaultValue={property?.name ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Property Type</label>
          <input
            name="property_type"
            defaultValue={property?.property_type ?? ""}
            placeholder="multifamily / senior_living / development"
            className={input}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label}>Address</label>
          <input name="address" defaultValue={property?.address ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>City</label>
          <input name="city" defaultValue={property?.city ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>State</label>
          <input name="state" defaultValue={property?.state ?? ""} className={input} />
        </div>

        <div>
          <label className={label}>Units</label>
          <input
            type="number"
            name="units"
            defaultValue={property?.units ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Year Built</label>
          <input
            type="number"
            name="year_built"
            defaultValue={property?.year_built ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Total SF</label>
          <input
            type="number"
            name="total_sf"
            defaultValue={property?.total_sf ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Lot Size (acres)</label>
          <input
            type="number"
            step="0.01"
            name="lot_size_acres"
            defaultValue={property?.lot_size_acres ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Current Occupancy (%)</label>
          <input
            type="number"
            step="0.1"
            name="occupancy_current"
            defaultValue={property?.occupancy_current ?? ""}
            className={input}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <textarea
            name="notes"
            defaultValue={property?.notes ?? ""}
            rows={2}
            className={textarea}
          />
        </div>

        <div className="flex items-center gap-4 sm:col-span-2">
          <button type="submit" className={btnSecondary}>
            {property ? "Save Property" : "Add Property"}
          </button>
          {property?.id && (
            <form action={deleteProperty}>
              <input type="hidden" name="id" value={property.id} />
              <input type="hidden" name="company_id" value={companyId} />
              <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                Delete
              </button>
            </form>
          )}
        </div>
      </form>

      {property?.id && (
        <form
          action={upsertFinancials}
          className="mt-6 grid gap-4 border-t border-sand pt-5 sm:grid-cols-3"
        >
          <input type="hidden" name="property_id" value={property.id} />
          <input type="hidden" name="company_id" value={companyId} />
          <p className="eyebrow text-navy/40 sm:col-span-3">Financials</p>
          <div>
            <label className={label}>Purchase Price</label>
            <input
              type="number"
              name="purchase_price"
              defaultValue={financials?.purchase_price ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Gross Revenue</label>
            <input
              type="number"
              name="gross_revenue"
              defaultValue={financials?.gross_revenue ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Operating Expenses</label>
            <input
              type="number"
              name="operating_expenses"
              defaultValue={financials?.operating_expenses ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Exit Cap Rate (%)</label>
            <input
              type="number"
              step="0.01"
              name="exit_cap_rate"
              defaultValue={financials?.exit_cap_rate ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Hold Period (years)</label>
            <input
              type="number"
              step="0.5"
              name="hold_period_years"
              defaultValue={financials?.hold_period_years ?? ""}
              className={input}
            />
          </div>
          <div className="sm:col-span-3">
            <label className={label}>Notes</label>
            <textarea
              name="notes"
              defaultValue={financials?.notes ?? ""}
              rows={2}
              className={textarea}
            />
          </div>
          <button type="submit" className={`self-start ${btnSecondary} sm:col-span-3`}>
            Save Financials
          </button>
        </form>
      )}
    </div>
  );
}

function ContactCard({ companyId, contact }: { companyId: string; contact?: DealContact }) {
  return (
    <form
      action={upsertContact}
      className="grid gap-4 border border-sand bg-white/60 p-5 sm:grid-cols-2"
    >
      {contact?.id && <input type="hidden" name="id" value={contact.id} />}
      <input type="hidden" name="company_id" value={companyId} />

      <div>
        <label className={label}>Name</label>
        <input
          name="name"
          defaultValue={contact?.name}
          required
          className={input}
        />
      </div>
      <div>
        <label className={label}>Role</label>
        <input name="role" defaultValue={contact?.role ?? ""} className={input} />
      </div>
      <div>
        <label className={label}>Phone</label>
        <input name="phone" defaultValue={contact?.phone ?? ""} className={input} />
      </div>
      <div>
        <label className={label}>Email</label>
        <input
          type="email"
          name="email"
          defaultValue={contact?.email ?? ""}
          className={input}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Notes</label>
        <textarea
          name="notes"
          defaultValue={contact?.notes ?? ""}
          rows={2}
          className={textarea}
        />
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="is_decision_maker"
            defaultChecked={contact?.is_decision_maker}
          />
          Decision maker
        </label>
        <button type="submit" className={btnSecondary}>
          {contact ? "Save Contact" : "Add Contact"}
        </button>
        {contact?.id && (
          <form action={deleteContact}>
            <input type="hidden" name="id" value={contact.id} />
            <input type="hidden" name="company_id" value={companyId} />
            <button type="submit" className="text-sm text-red-600 hover:text-red-700">
              Delete
            </button>
          </form>
        )}
      </div>
    </form>
  );
}

export default async function EditDealCompanyPage({
  params,
}: PageProps<"/admin/deals/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: companyData },
    { data: propertyData },
    { data: contactData },
    { data: callLogData },
  ] = await Promise.all([
    supabase.from("deal_companies").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("deal_properties")
      .select("*")
      .eq("company_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("deal_contacts")
      .select("*")
      .eq("company_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("deal_call_logs")
      .select("*")
      .eq("company_id", id)
      .order("called_at", { ascending: false }),
  ]);

  const company = companyData as DealCompany | null;
  if (!company) notFound();

  const properties = (propertyData as DealProperty[]) ?? [];
  const contacts = (contactData as DealContact[]) ?? [];
  const callLogs = (callLogData as DealCallLog[]) ?? [];

  const propertyIds = properties.map((p) => p.id);
  const { data: financialsData } =
    propertyIds.length > 0
      ? await supabase.from("deal_financials").select("*").in("property_id", propertyIds)
      : { data: [] };
  const financialsByProperty = new Map(
    ((financialsData as DealFinancials[]) ?? []).map((f) => [f.property_id, f])
  );

  return (
    <div>
      <p className="eyebrow text-gold">Deals</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        {company.name}
      </h1>

      <div className="mt-8">
        <CompanyForm company={company} />
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Properties</p>
        <div className="mt-4 flex flex-col gap-4">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              companyId={company.id}
              property={p}
              financials={financialsByProperty.get(p.id)}
            />
          ))}
          <div>
            <p className="eyebrow mb-2 text-navy/40">Add Another Property</p>
            <PropertyCard companyId={company.id} />
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Contacts</p>
        <div className="mt-4 flex flex-col gap-4">
          {contacts.map((c) => (
            <ContactCard key={c.id} companyId={company.id} contact={c} />
          ))}
          <div>
            <p className="eyebrow mb-2 text-navy/40">Add Another Contact</p>
            <ContactCard companyId={company.id} />
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow text-gold">Activity Log</p>
        <p className="mt-2 text-xs text-navy/50">
          Log a call. Setting a next-action date here updates the
          company&apos;s next-action date above.
        </p>

        <form action={addCallLog} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="company_id" value={company.id} />
          {contacts.length > 0 && (
            <div>
              <label className={label}>Contact (optional)</label>
              <select name="contact_id" defaultValue="" className={input}>
                <option value="">—</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Outcome</label>
              <input
                name="outcome"
                placeholder="Left voicemail, spoke with owner, not interested..."
                className={input}
              />
            </div>
            <div>
              <label className={label}>Next Action Type</label>
              <input name="next_action_type" placeholder="Follow-up call" className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea name="notes" rows={3} className={textarea} />
          </div>
          <div className="grid gap-4 sm:grid-cols-[240px_1fr] sm:items-end">
            <div>
              <label className={label}>Next Action Date (optional)</label>
              <input type="date" name="next_action_date" className={input} />
            </div>
            <button type="submit" className={`self-start ${btnPrimary}`}>
              Log Call
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col divide-y divide-sand border-t border-sand">
          {callLogs.map((log) => (
            <div key={log.id} className="py-4">
              {log.outcome && <p className="text-sm font-medium text-navy">{log.outcome}</p>}
              {log.notes && (
                <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{log.notes}</p>
              )}
              <p className="eyebrow mt-2 text-navy/40">
                {formatDate(log.called_at)}
                {log.next_action_date && ` · Next action ${log.next_action_date}`}
              </p>
            </div>
          ))}
          {callLogs.length === 0 && (
            <p className="py-8 text-center text-sm text-navy/50">
              No calls logged yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
