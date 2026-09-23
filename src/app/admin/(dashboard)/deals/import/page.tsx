import { btnPrimary } from "@/components/admin/ui";
import { importDealsCsv } from "../actions";

export default async function ImportDealsPage({
  searchParams,
}: PageProps<"/admin/deals/import">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div>
      <p className="eyebrow text-gold">Deals</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Import Deals from CSV
      </h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 border border-sand bg-white/60 p-5">
        <p className="eyebrow text-navy/50">Expected Columns</p>
        <p className="mt-2 text-sm text-navy/70">
          One row = one property, with the owner company and a contact
          inline. Rows sharing the same{" "}
          <code className="text-xs">company_name</code> are grouped under one
          company (reusing an existing company of that name if one already
          exists). Column names are matched case-insensitively; spaces become
          underscores automatically.
        </p>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="py-2 pr-4 font-medium">Column</th>
              <th className="py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="text-navy/70">
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">company_name</td>
              <td className="py-2">
                Falls back to property_name if blank — a row needs at least
                one of the two.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">company_website</td>
              <td className="py-2">Optional — only used when creating a new company.</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">pipeline_stage</td>
              <td className="py-2">
                sourced / researching / contacted / negotiating /
                under_contract / closed / dead — defaults to
                &quot;sourced&quot;. Only used when creating a new company.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">next_action_date</td>
              <td className="py-2">
                YYYY-MM-DD. Only used when creating a new company.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">
                next_action_type, source, company_notes
              </td>
              <td className="py-2">Optional. Only used when creating a new company.</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">property_name</td>
              <td className="py-2">
                If blank, the row only creates/matches the company — no
                property row is added.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">
                property_address, property_city, property_state
              </td>
              <td className="py-2">Optional</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">property_type</td>
              <td className="py-2">
                multifamily / senior_living / development / office / retail /
                industrial / single_family / condo / townhome
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">
                property_units, property_notes
              </td>
              <td className="py-2">Optional</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">
                contact_name, contact_phone, contact_email
              </td>
              <td className="py-2">
                Optional — a contact is added per row if any of these three
                are present.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form action={importDealsCsv} className="mt-6 flex flex-col gap-4">
        <input
          type="file"
          name="csv_file"
          accept=".csv,text/csv"
          required
          className="text-sm text-navy"
        />
        <button type="submit" className={`self-start ${btnPrimary}`}>
          Import CSV
        </button>
      </form>
    </div>
  );
}
