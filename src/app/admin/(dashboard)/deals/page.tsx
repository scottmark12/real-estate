import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, tag } from "@/components/admin/ui";
import { propertyTypeCategory, type PropertyTypeCategory } from "@/lib/format";
import { deleteCompany } from "./actions";
import type { DealCompany, PipelineStage } from "@/lib/types";

export const revalidate = 0;

const STAGE_LABELS: Record<PipelineStage, string> = {
  sourced: "Sourced",
  researching: "Researching",
  contacted: "Contacted",
  negotiating: "Negotiating",
  under_contract: "Under Contract",
  closed: "Closed",
  dead: "Dead",
};

const TABS: { value: PipelineStage | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sourced", label: "Sourced" },
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
];

function isOverdue(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr <= today;
}

const CATEGORY_TABS: { value: PropertyTypeCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
];

export default async function AdminDealsPage({
  searchParams,
}: PageProps<"/admin/deals">) {
  const params = await searchParams;
  const stageFilter =
    typeof params.stage === "string" ? (params.stage as PipelineStage) : undefined;
  const categoryFilter =
    typeof params.category === "string"
      ? (params.category as PropertyTypeCategory)
      : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("deal_companies")
    .select("*")
    .order("next_action_date", { ascending: true, nullsFirst: false });

  if (stageFilter) query = query.eq("pipeline_stage", stageFilter);

  const [{ data }, { data: propertyData }] = await Promise.all([
    query,
    supabase.from("deal_properties").select("company_id, property_type"),
  ]);

  let companies = (data as DealCompany[]) ?? [];

  // A company's category is the set of categories across its properties —
  // most have one property, so this is almost always a single value, but
  // it's computed as a set rather than assumed 1:1.
  const categoriesByCompany = new Map<string, Set<PropertyTypeCategory | "unspecified">>();
  for (const p of (propertyData as { company_id: string; property_type: string | null }[]) ?? []) {
    const set = categoriesByCompany.get(p.company_id) ?? new Set();
    set.add(propertyTypeCategory(p.property_type));
    categoriesByCompany.set(p.company_id, set);
  }

  if (categoryFilter) {
    companies = companies.filter((c) =>
      categoriesByCompany.get(c.id)?.has(categoryFilter)
    );
  }

  function hrefFor(stage: PipelineStage | "all") {
    const qs = new URLSearchParams();
    if (stage !== "all") qs.set("stage", stage);
    if (categoryFilter) qs.set("category", categoryFilter);
    const s = qs.toString();
    return s ? `/admin/deals?${s}` : "/admin/deals";
  }

  function hrefForCategory(category: PropertyTypeCategory | "all") {
    const qs = new URLSearchParams();
    if (stageFilter) qs.set("stage", stageFilter);
    if (category !== "all") qs.set("category", category);
    const s = qs.toString();
    return s ? `/admin/deals?${s}` : "/admin/deals";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Deals</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Acquisition Targets
          </h1>
        </div>
        <Link href="/admin/deals/new" className={btnPrimary}>
          + New Company
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((t) => (
          <Link
            key={t.value}
            href={hrefForCategory(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              (categoryFilter ?? "all") === t.value
                ? "border-gold bg-gold text-navy"
                : "border-navy/20 text-navy/70"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={hrefFor(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              (stageFilter ?? "all") === t.value
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
              <th className="eyebrow px-4 py-3 font-medium">Company</th>
              <th className="eyebrow px-4 py-3 font-medium">Type</th>
              <th className="eyebrow px-4 py-3 font-medium">Stage</th>
              <th className="eyebrow px-4 py-3 font-medium">Heat</th>
              <th className="eyebrow px-4 py-3 font-medium">Source</th>
              <th className="eyebrow px-4 py-3 font-medium">Next Action</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-sand/60 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">
                  <Link
                    href={`/admin/deals/${c.id}/edit`}
                    className="underline decoration-gold decoration-2 underline-offset-4"
                  >
                    {c.name}
                  </Link>
                  {c.website && (
                    <p className="mt-0.5 text-xs font-normal text-navy/50">
                      {c.website}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 capitalize text-navy/70">
                  {[...(categoriesByCompany.get(c.id) ?? [])]
                    .filter((cat) => cat !== "unspecified")
                    .join(" / ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`${tag} border-navy/20 text-navy/70`}>
                    {STAGE_LABELS[c.pipeline_stage]}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy/70">{c.heat_score ?? "—"}</td>
                <td className="px-4 py-3 text-navy/70">{c.source || "—"}</td>
                <td className="px-4 py-3">
                  {c.next_action_date ? (
                    <span
                      className={
                        isOverdue(c.next_action_date)
                          ? "font-semibold text-red-600"
                          : "text-navy/70"
                      }
                    >
                      {c.next_action_date}
                      {c.next_action_type ? ` · ${c.next_action_type}` : ""}
                    </span>
                  ) : (
                    <span className="text-navy/30">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/deals/${c.id}/edit`}
                      className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                    >
                      Edit
                    </Link>
                    <form action={deleteCompany}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy/50">
                  No companies yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
