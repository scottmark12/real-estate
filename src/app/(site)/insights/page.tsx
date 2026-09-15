import { createClient } from "@/lib/supabase/server";
import MarketResearchExplorer from "@/components/market-research-explorer";
import type { Article } from "@/lib/types";

export const revalidate = 0;

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const articles = (data as Article[]) ?? [];

  return <MarketResearchExplorer articles={articles} />;
}
