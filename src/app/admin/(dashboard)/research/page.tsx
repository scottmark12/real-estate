import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnSecondary, input, label, textarea } from "@/components/admin/ui";
import { advanceResearch, upsertProperty } from "../deals/actions";
import type { DealCompany, DealProperty } from "@/lib/types";

export const revalidate = 0;

const outcomeButton =
  "border border-navy/20 px-4 py-3 text-center text-sm font-medium text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream";
const terminalButton =
  "border border-red-300 px-4 py-3 text-center text-sm font-medium text-red-700 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white";

function missingFields(p: DealProperty): string[] {
  const missing: string[] = [];
  if (!p.address) missing.push("Address");
  if (!p.property_type) missing.push("Property Type");
  if (p.units === null) missing.push("Units");
  if (p.year_built === null) missing.push("Year Built");
  if (p.total_sf === null) missing.push("Total SF");
  if (p.lot_size_acres === null) missing.push("Lot Size");
  if (p.occupancy_current === null) missing.push("Occupancy");
  return missing;
}

export default async function AdminResearchPage({ searchParams }: PageProps<"/admin/research">) {
  const params = await searchParams;
  const logged = typeof params.logged === "string" ? params.logged : undefined;

  const supabase = await createClient();

  const { data: queueData } = await supabase
    .from("deal_companies")
    .select("*")
    .in("pipeline_stage", ["sourced", "researching"])
    .order("heat_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: true });

  const queue = (queueData as DealCompany[]) ?? [];
  const remaining = queue.length;
  const current = queue[0];

  if (!current) {
    return (
      <div>
        <p className="eyebrow text-gold">Research Center</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          Nothing to research
        </h1>
        <p className="mt-4 text-navy/60">
          Every deal in the pipeline has moved past sourcing and research.
        </p>
      </div>
    );
  }

  const { data: propertiesData } = await supabase
    .from("deal_properties")
    .select("*")
    .eq("company_id", current.id)
    .order("created_at", { ascending: true });
  const properties = (propertiesData as DealProperty[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Research Center</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            What to Research
          </h1>
        </div>
        <p className="eyebrow text-navy/40">{remaining} remaining</p>
      </div>

      {logged && (
        <p className="mt-4 border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          &#10003; Logged {logged || "that company"}.
        </p>
      )}

      <div className="mt-8 border border-sand bg-white/60 p-8">
        <span className="inline-block border border-gold/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold">
          {current.pipeline_stage?.replace("_", " ")}
        </span>

        <h2 className="mt-3 font-display text-3xl font-semibold text-navy">{current.name}</h2>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          {current.website ? (
            <a
              href={current.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline decoration-gold decoration-2 underline-offset-4"
            >
              {current.website} &#8599;
            </a>
          ) : (
            <span className="text-navy/30">No website on file</span>
          )}
          {current.source && <span className="text-navy/60">Source: {current.source}</span>}
        </div>

        {current.notes && <p className="mt-4 text-sm text-navy/70">{current.notes}</p>}

        <Link
          href={`/admin/deals/${current.id}/edit`}
          className="eyebrow mt-4 inline-block text-navy/40 underline decoration-gold decoration-2 underline-offset-4"
        >
          View Full Profile &rarr;
        </Link>

        <div className="mt-8 flex flex-col gap-6 border-t border-sand pt-6">
          {properties.map((p) => {
            const missing = missingFields(p);
            return (
              <div key={p.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-navy">{p.name || p.address || "Untitled property"}</p>
                  {missing.length === 0 ? (
                    <span className="eyebrow text-navy/30">Fully researched</span>
                  ) : (
                    <span className="eyebrow text-red-600">To research: {missing.join(", ")}</span>
                  )}
                </div>
                <form action={upsertProperty} className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="company_id" value={current.id} />
                  <input type="hidden" name="name" value={p.name ?? ""} />
                  <input type="hidden" name="city" value={p.city ?? ""} />
                  <input type="hidden" name="state" value={p.state ?? ""} />
                  <input type="hidden" name="property_type" value={p.property_type ?? ""} />
                  <div className="sm:col-span-3">
                    <label className={label}>Address</label>
                    <input name="address" defaultValue={p.address ?? ""} className={input} />
                  </div>
                  <div>
                    <label className={label}>Units</label>
                    <input type="number" name="units" defaultValue={p.units ?? ""} className={input} />
                  </div>
                  <div>
                    <label className={label}>Year Built</label>
                    <input type="number" name="year_built" defaultValue={p.year_built ?? ""} className={input} />
                  </div>
                  <div>
                    <label className={label}>Total SF</label>
                    <input type="number" name="total_sf" defaultValue={p.total_sf ?? ""} className={input} />
                  </div>
                  <div>
                    <label className={label}>Lot Size (acres)</label>
                    <input type="number" step="0.01" name="lot_size_acres" defaultValue={p.lot_size_acres ?? ""} className={input} />
                  </div>
                  <div>
                    <label className={label}>Occupancy (%)</label>
                    <input type="number" step="0.1" name="occupancy_current" defaultValue={p.occupancy_current ?? ""} className={input} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={label}>Findings</label>
                    <textarea name="notes" defaultValue={p.notes ?? ""} rows={2} className={textarea} placeholder="What you found while researching…" />
                  </div>
                  <button type="submit" className={`${btnSecondary} self-start sm:col-span-3`}>
                    Save Findings
                  </button>
                </form>
              </div>
            );
          })}

          {properties.length === 0 && (
            <div>
              <p className="text-sm text-navy/50">
                No property on file yet — add the one you&apos;re researching.
              </p>
              <form action={upsertProperty} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="company_id" value={current.id} />
                <div>
                  <label className={label}>Property Name</label>
                  <input name="name" required placeholder="What are you researching?" className={input} />
                </div>
                <div>
                  <label className={label}>Address</label>
                  <input name="address" className={input} />
                </div>
                <button type="submit" className={`${btnSecondary} sm:col-span-2`}>
                  Add Property
                </button>
              </form>
            </div>
          )}
        </div>

        <form action={advanceResearch} className="mt-8 grid grid-cols-2 gap-3 border-t border-sand pt-6">
          <input type="hidden" name="company_id" value={current.id} />
          <input type="hidden" name="record_name" value={current.name} />
          <button type="submit" name="stage" value="contacted" className={outcomeButton}>
            Researched &mdash; Ready to Contact
          </button>
          <button type="submit" name="stage" value="dead" className={terminalButton}>
            Pass &mdash; Not a Fit
          </button>
        </form>
      </div>
    </div>
  );
}
