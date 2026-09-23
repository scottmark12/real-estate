import { btnPrimary } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { importClientsCsv } from "../actions";

export default async function ImportClientsPage({
  searchParams,
}: PageProps<"/admin/clients/import">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div>
      <p className="eyebrow text-gold">Clients</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Import Clients from CSV
      </h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 border border-sand bg-white/60 p-5">
        <p className="eyebrow text-navy/50">Expected Columns</p>
        <p className="mt-2 text-sm text-navy/70">
          The first row must be a header row. Column names are matched
          case-insensitively; spaces become underscores automatically, so
          &quot;Next Follow Up Date&quot; and{" "}
          <code className="text-xs">next_follow_up_date</code> both work.
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
              <td className="py-2 pr-4 font-mono text-xs">name</td>
              <td className="py-2">Required — rows without a name are skipped.</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">email</td>
              <td className="py-2">Optional</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">phone</td>
              <td className="py-2">Optional</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">status</td>
              <td className="py-2">
                lead / active / under_contract / past_client / lost — defaults
                to &quot;lead&quot; if blank or unrecognized.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">client_type</td>
              <td className="py-2">
                buyer / seller / investor / other — defaults to &quot;buyer&quot;.
              </td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">timeline</td>
              <td className="py-2">Free text, e.g. &quot;0-3 months&quot;</td>
            </tr>
            <tr className="border-b border-sand/60">
              <td className="py-2 pr-4 font-mono text-xs">next_follow_up_date</td>
              <td className="py-2">
                YYYY-MM-DD — ignored if not in that format.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">notes</td>
              <td className="py-2">Optional</td>
            </tr>
          </tbody>
        </table>
      </div>

      <form action={importClientsCsv} className="mt-6 flex flex-col gap-4">
        <input
          type="file"
          name="csv_file"
          accept=".csv,text/csv"
          required
          className="text-sm text-navy"
        />
        <SubmitButton className={`self-start ${btnPrimary}`} pendingLabel="Importing…">
          Import CSV
        </SubmitButton>
      </form>
    </div>
  );
}
