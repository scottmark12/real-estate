export type MarketReadTheme =
  | "opportunities"
  | "practices"
  | "systems_codes"
  | "vision";

// Ported from an earlier newsletter project's two-layer feed schema:
// working_feeds.json (hand-tested direct RSS) + google_news_feeds.json
// (theme-grouped Google News search-RSS, including site:-restricted
// queries against CBRE/JLL/Colliers/Brookfield/Prologis/NAR — the old
// project's actual mechanism for "big firm insights," since none of
// those firms expose a real public RSS/API feed). The Real Deal's own
// feeds have since gone 403 and were dropped; everything else is kept
// even where untested here — dead feeds fail silently in fetchMarketReads.
export const FEED_SOURCES: { url: string; source: string; theme: MarketReadTheme }[] = [
  // Direct RSS — tier 1 / real estate
  { url: "https://commercialobserver.com/feed/", source: "Commercial Observer", theme: "opportunities" },
  { url: "https://www.redfin.com/news/feed/", source: "Redfin News", theme: "opportunities" },
  { url: "https://www.zillow.com/research/feed/", source: "Zillow Research", theme: "opportunities" },
  { url: "https://www.yardimatrix.com/blog/feed/", source: "Yardi Matrix", theme: "opportunities" },
  // Direct RSS — construction / engineering / practices
  { url: "https://www.constructiondive.com/feeds/news/", source: "Construction Dive", theme: "practices" },
  { url: "https://aecmag.com/feed/", source: "AEC Magazine", theme: "practices" },
  { url: "https://builtworlds.com/news/feed/", source: "BuiltWorlds", theme: "practices" },
  { url: "https://www.engineering.com/feed/", source: "Engineering.com", theme: "practices" },
  { url: "https://www.construction.com/feed/", source: "Construction.com", theme: "practices" },
  // Direct RSS — design / architecture / vision
  { url: "https://www.dezeen.com/feed/", source: "Dezeen", theme: "vision" },
  { url: "https://www.dezeen.com/technology/feed/", source: "Dezeen Technology", theme: "vision" },
  { url: "https://www.archdaily.com/feed", source: "ArchDaily", theme: "vision" },
  { url: "https://www.smartcitiesdive.com/feeds/news/", source: "Smart Cities Dive", theme: "vision" },
  // Direct RSS — sustainability / systems & codes
  { url: "https://www.greenbuildingadvisor.com/feed/", source: "Green Building Advisor", theme: "systems_codes" },
  { url: "https://www.buildinggreen.com/feed/", source: "BuildingGreen", theme: "systems_codes" },
  { url: "https://rmi.org/feed/", source: "RMI", theme: "systems_codes" },
  { url: "https://architecture2030.org/feed/", source: "Architecture 2030", theme: "systems_codes" },
  { url: "https://carbonleadershipforum.org/feed/", source: "Carbon Leadership Forum", theme: "systems_codes" },
  { url: "https://www.woodworks.org/feed/", source: "WoodWorks", theme: "systems_codes" },
  { url: "https://www.thinkwood.com/feed/", source: "Think Wood", theme: "systems_codes" },
  // Google News search-RSS, theme-grouped (your original google_news_feeds.json)
  { url: "https://news.google.com/rss/search?q=real+estate+development+case+study+OR+success+story", source: "Google News", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=multifamily+investment+ROI+OR+returns", source: "Google News", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=adaptive+reuse+commercial+real+estate", source: "Google News", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=modular+construction+OR+prefab+construction", source: "Google News", theme: "practices" },
  { url: "https://news.google.com/rss/search?q=mass+timber+construction", source: "Google News", theme: "practices" },
  { url: "https://news.google.com/rss/search?q=construction+productivity+study+OR+research", source: "Google News", theme: "practices" },
  { url: "https://news.google.com/rss/search?q=zoning+reform+real+estate", source: "Google News", theme: "systems_codes" },
  { url: "https://news.google.com/rss/search?q=opportunity+zone+OR+development+incentives", source: "Google News", theme: "systems_codes" },
  { url: "https://news.google.com/rss/search?q=green+building+policy+OR+sustainable+building+code", source: "Google News", theme: "systems_codes" },
  { url: "https://news.google.com/rss/search?q=future+of+real+estate+OR+future+of+cities", source: "Google News", theme: "vision" },
  { url: "https://news.google.com/rss/search?q=urban+planning+insights+OR+innovation", source: "Google News", theme: "vision" },
  // Google News, site-restricted — your "big firm insights" workaround (no firm exposes real public RSS)
  { url: "https://news.google.com/rss/search?q=CBRE+insights+site:cbre.com", source: "CBRE (via Google News)", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=JLL+research+site:jll.com", source: "JLL (via Google News)", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=Colliers+research+OR+insights+site:colliers.com", source: "Colliers (via Google News)", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=Brookfield+insights+site:brookfield.com", source: "Brookfield (via Google News)", theme: "opportunities" },
  { url: "https://news.google.com/rss/search?q=market+insights+site:nar.realtor", source: "NAR (via Google News)", theme: "opportunities" },
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

// Google News RSS titles are formatted "Headline - Publisher"; split that
// out so the reading list shows the real publisher instead of "Google News".
function splitGoogleNewsTitle(title: string): { title: string; publisher: string | null } {
  const match = title.match(/^(.*)\s-\s([^-]+)$/);
  if (!match) return { title, publisher: null };
  return { title: match[1].trim(), publisher: match[2].trim() };
}

export async function fetchMarketReads(): Promise<FetchedMarketRead[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async ({ url, source, theme }) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MarkScottRE/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${source}: ${res.status}`);
      const xml = await res.text();
      const isGoogleNews = url.startsWith("https://news.google.com/");
      return parseFeed(xml)
        .slice(0, 8)
        .map((item) => {
          const split = isGoogleNews ? splitGoogleNewsTitle(item.title) : null;
          const title = split?.title ?? item.title;
          const resolvedSource = source === "Google News" && split?.publisher ? split.publisher : source;
          return {
            title,
            url: item.url,
            source: resolvedSource,
            summary: item.summary || null,
            theme: detectTheme(title, item.summary, theme),
            published_at: parseFeedDate(item.publishedAt),
          };
        });
    })
  );

  const reads: FetchedMarketRead[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") reads.push(...result.value);
  }
  return reads;
}
