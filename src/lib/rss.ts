export type MarketReadTheme =
  | "opportunities"
  | "practices"
  | "systems_codes"
  | "vision";

// Hand-tested RSS feeds (no CBRE/JLL/CoStar — those return empty/403 with
// no auth), ported from an earlier newsletter project's working_feeds.json.
// The Real Deal feeds have since gone 403 and were dropped from this list.
export const FEED_SOURCES: { url: string; source: string; theme: MarketReadTheme }[] = [
  { url: "https://commercialobserver.com/feed/", source: "Commercial Observer", theme: "opportunities" },
  { url: "https://www.constructiondive.com/feeds/news/", source: "Construction Dive", theme: "practices" },
  { url: "https://www.dezeen.com/feed/", source: "Dezeen", theme: "vision" },
  { url: "https://www.smartcitiesdive.com/feeds/news/", source: "Smart Cities Dive", theme: "vision" },
  { url: "https://aecmag.com/feed/", source: "AEC Magazine", theme: "practices" },
  { url: "https://www.archdaily.com/feed", source: "ArchDaily", theme: "vision" },
  { url: "https://builtworlds.com/news/feed/", source: "BuiltWorlds", theme: "practices" },
  { url: "https://www.greenbuildingadvisor.com/feed/", source: "Green Building Advisor", theme: "systems_codes" },
  { url: "https://rmi.org/feed/", source: "RMI", theme: "systems_codes" },
  { url: "https://www.redfin.com/news/feed/", source: "Redfin News", theme: "opportunities" },
];

type RawFeedItem = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
};

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : null;
}

function extractLink(block: string): string | null {
  // RSS: <link>https://...</link>. Atom: <link href="https://..."/>.
  const plain = block.match(/<link>([\s\S]*?)<\/link>/i);
  if (plain && plain[1].trim()) return decodeEntities(plain[1]);
  const atom = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return atom ? atom[1] : null;
}

export function parseFeed(xml: string): RawFeedItem[] {
  const items: RawFeedItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) ?? [];

  for (const block of blocks) {
    const title = extractTag(block, "title");
    const url = extractLink(block);
    if (!title || !url) continue;

    const rawSummary =
      extractTag(block, "description") ?? extractTag(block, "summary") ?? "";
    const summary = stripTags(rawSummary).slice(0, 280);

    const publishedAt =
      extractTag(block, "pubDate") ?? extractTag(block, "published") ?? null;

    items.push({ title, url, summary, publishedAt });
  }

  return items;
}

const THEME_KEYWORDS: Record<MarketReadTheme, string[]> = {
  opportunities: ["investment", "invest", "returns", "roi", "acquisition", "portfolio", "growth", "expand"],
  practices: ["construction", "modular", "prefab", "timber", "productivity", "technology", "build", "design-build"],
  systems_codes: ["zoning", "code", "regulation", "policy", "incentive", "opportunity zone", "compliance", "sustainab", "green building"],
  vision: ["future", "smart city", "urban planning", "innovation", "placemaking", "architecture", "vision"],
};

export function detectTheme(title: string, summary: string, fallback: MarketReadTheme): MarketReadTheme {
  const text = `${title} ${summary}`.toLowerCase();
  let best: MarketReadTheme = fallback;
  let bestScore = 0;
  for (const theme of Object.keys(THEME_KEYWORDS) as MarketReadTheme[]) {
    const score = THEME_KEYWORDS[theme].filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = theme;
    }
  }
  return best;
}

function parseFeedDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export type FetchedMarketRead = {
  title: string;
  url: string;
  source: string;
  summary: string | null;
  theme: MarketReadTheme;
  published_at: string | null;
};

export async function fetchMarketReads(): Promise<FetchedMarketRead[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async ({ url, source, theme }) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MarkScottRE/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${source}: ${res.status}`);
      const xml = await res.text();
      return parseFeed(xml)
        .slice(0, 8)
        .map((item) => ({
          title: item.title,
          url: item.url,
          source,
          summary: item.summary || null,
          theme: detectTheme(item.title, item.summary, theme),
          published_at: parseFeedDate(item.publishedAt),
        }));
    })
  );

  const reads: FetchedMarketRead[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") reads.push(...result.value);
  }
  return reads;
}
