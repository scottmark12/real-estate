import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MarketResearchExplorer from "@/components/market-research-explorer";
import type { Article } from "@/lib/types";
import MarketLetterBand from "@/components/market-letter-band";
import ResearchHero from "@/components/research-hero";

export const metadata: Metadata = {
  title: "San Diego Market Research",
  description:
    "Data driven reporting on San Diego real estate: households vs housing, rates, ADU costs, condos and development.",
  alternates: { canonical: "/insights" },
};


export const revalidate = 0;

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  // San Diego stories lead; wider California and national pieces follow.
  const local = (a: Article) =>
    /san diego|la jolla|encinitas|carlsbad|north county/i.test(`${a.title} ${a.excerpt ?? ""}`) ||
    a.category === "rates";
  const articles = [...((data as Article[]) ?? [])].sort(
    (a, b) => Number(local(b)) - Number(local(a))
  );

  return (
    <>
      <ResearchHero />
      <MarketResearchExplorer articles={articles} />
      <div className="mx-auto max-w-[1500px] lg:px-12">
        <MarketLetterBand className="mb-16" />
      </div>
    </>
  );
}
