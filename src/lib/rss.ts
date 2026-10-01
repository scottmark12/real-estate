export type MarketReadTheme =
  | "opportunities"
  | "practices"
  | "systems_codes"
  | "vision"
  | "rates"
  | "san_diego"
  | "alt_construction";

// Built from the morning brief's source rules (brief_sources.md): only
// outlets Mark can actually open (he subscribes to Reuters and the NYT),
// Al Jazeera used heavily, and nothing paywalled. General-news feeds carry
// a `match` filter so only real estate / rates / economy items come
// through. Everything here was tested live on Sept 25, 2026; dead feeds
// fail silently in fetchMarketReads.
//
// On Oct 1, 2026 every feed from the old newsletter project
// (v4-Newsletter's working_feeds.json and google_news_feeds.json) was
// re-tested and the ones still live and useful were added back. About 50
// of its ~120 URLs were dead (403/404, empty, or years stale), and a
// headline review dropped the noisy ones (forum Q&A, software news,
// furniture design, firm job postings).
//
// Kept outside the brief's list on purpose, because they're free and cover
// Mark's #3 priority (mass timber, modular, alt construction) or proved
// useful: Yardi Matrix, Smart Cities Dive, WoodWorks, Think Wood, and the
// alt-construction Google News searches.
type FeedSource = { url: string; source: string; theme: MarketReadTheme; match?: RegExp };

// Kept narrow on purpose: words like "home" or "economy" alone pull in
// crime stories and foreign news that have nothing to do with the market.
const ECONOMY = /mortgage|interest rates?|federal reserve|\bthe fed\b|treasur|bond (market|yield)|\bUS (economy|inflation|jobs)|housing|home (prices?|sales|buyers?)|real estate|\brents?\b|construction/i;
const LOCAL_REAL_ESTATE = /housing|home (prices?|sales|values|buyers?)|homebuy|homeowner|\brents?\b|renters|apartment|developer|development|real estate|zoning|permit|construction|mortgage|affordab|tenant|landlord|property tax|land use|\bADUs?\b/i;

// Alt-construction stories: used to pull them out of the general feeds
// (Construction Dive, Bisnow, etc.) into their own section, and as the
// filter on the broad alt-construction searches, which otherwise drag in
// nuclear "small modular reactors" and unrelated design-site stories.
const ALT_CONSTRUCTION = /^(?![\s\S]*modular (nuclear )?reactor)[\s\S]*(mass timber|cross-laminated|\bCLT\b|glulam|modular (home|hous|construct|build|apartment|unit|townhome|communit)|prefab|off-?site construction|factory-built|panelized|volumetric|3d[- ]printed (home|house|housing|building|wall|concrete)|3d concrete print|light[- ]gauge steel|precast concrete)/i;

// Headlines that are never worth grading, whatever feed they come from:
// listicles and loan-shopping guides, market-size press releases, listing
// roundups, job postings, stock tips, event promos, obituaries and local
// crime.
const JUNK_TITLE = /\| 20\d\d$|^(the )?\d+ best\b|\bbest [\w ]*(loans?|lenders?|rates)\b|market (size|forecast|analysis|outlook) to 20\d\d|market to (reach|20\d\d)|forecast to 20\d\d|homes for sale in|\bintern\b|^(senior )?(manager|director|analyst|associate),|\bpast events\b|\bwebinar\b|events? guide|\bexpo\b|\bdies at\b|\bobituary\b|found dead|body found|\bhomicide\b|\bstabbing\b|\bshooting\b|\bSWAT\b|\bcramer\b|\b(NYSE|NASDAQ|TSX)\s*:|\bstocks?\b.*\b(buy|bet|picks?)\b|^q&a:|editor.s note/i;
const JUNK_SOURCE = /tradingview|indexbox|ein news|kalkine|marketbeat|tipranks|moomoo|u\.s\. census bureau|^google news$/i;

function isJunk(title: string, source: string): boolean {
  // Bare titles like "October 2026" or "Torben Dunkel" are index or bio pages.
  if (title.split(/\s+/).length < 4) return true;
  return JUNK_TITLE.test(title) || JUNK_SOURCE.test(source);
}

// Google News search RSS, limited to the last 2 days and to allowed sites.
// Slow-publishing sources (firm research pages) get a wider window.
const gn = (query: string, window = "2d") =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:${window}`)}&hl=en-US&gl=US&ceid=US:en`;
const yt = (channelId: string) => `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

// For broad design/engineering feeds that mostly cover furniture, products
// or non-building engineering.
const BUILDING = /housing|homes?\b|apartment|residential|building|construction|architect|developer|development|urban|city|cities|zoning|timber|modular|prefab|retrofit|adaptive reuse|mixed-use|tower|infrastructure/i;
const NATIONAL_SITES = "(site:reuters.com OR site:nytimes.com OR site:apnews.com OR site:aljazeera.com OR site:cnbc.com OR site:axios.com OR site:thehill.com OR site:cnn.com OR site:npr.org)";
const SD_SITES = "(site:kpbs.org OR site:nbcsandiego.com OR site:fox5sandiego.com OR site:10news.com OR site:timesofsandiego.com OR site:voiceofsandiego.org OR site:calmatters.org OR site:laist.com OR site:sandiego.gov OR site:sandiegocounty.gov)";

export const FEED_SOURCES: FeedSource[] = [
  // Rates: mortgage and lending trade press, plus the Fed itself
  { url: "https://www.mortgagenewsdaily.com/rss/news", source: "Mortgage News Daily", theme: "rates" },
  { url: "https://themortgagereports.com/feed", source: "The Mortgage Reports", theme: "rates" },
  { url: "https://www.housingwire.com/feed/", source: "HousingWire", theme: "rates" },
  { url: "https://www.federalreserve.gov/feeds/press_all.xml", source: "Federal Reserve", theme: "rates", match: /monetary|rate|FOMC|policy|economic/i },
  { url: gn(`(mortgage rates OR "10-year Treasury" OR "Federal Reserve") ${NATIONAL_SITES}`), source: "Google News", theme: "rates" },
  { url: gn("mortgage rates (site:freddiemac.com OR site:fanniemae.com OR site:mba.org OR site:finance.yahoo.com)"), source: "Google News", theme: "rates" },

  // San Diego and SoCal: local newsrooms, filtered to real estate stories
  { url: "https://www.kpbs.org/index.rss", source: "KPBS", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://www.nbcsandiego.com/?rss=y", source: "NBC 7 San Diego", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://fox5sandiego.com/feed/", source: "Fox 5 San Diego", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://www.10news.com/news/local-news.rss", source: "10News", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://timesofsandiego.com/business/feed/", source: "Times of San Diego", theme: "san_diego" },
  { url: "https://voiceofsandiego.org/feed/", source: "Voice of San Diego", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://calmatters.org/feed/", source: "CalMatters", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: "https://laist.com/index.atom", source: "LAist", theme: "san_diego", match: LOCAL_REAL_ESTATE },
  { url: gn(`San Diego (housing OR "real estate" OR development OR apartments) ${SD_SITES}`), source: "Google News", theme: "san_diego" },
  { url: gn('San Diego (site:therealdeal.com OR site:bisnow.com OR site:commercialobserver.com)'), source: "Google News", theme: "san_diego" },

  // Housing data and national market
  { url: "https://www.redfin.com/news/feed/", source: "Redfin News", theme: "opportunities" },
  { url: "https://www.zillow.com/research/feed/", source: "Zillow Research", theme: "opportunities" },
  { url: "https://www.realtor.com/research/feed/", source: "Realtor.com", theme: "opportunities" },
  { url: "https://www.yardimatrix.com/blog/feed/", source: "Yardi Matrix", theme: "opportunities" },
  { url: "https://www.cnbc.com/id/10000115/device/rss/rss.html", source: "CNBC", theme: "opportunities" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/RealEstate.xml", source: "The New York Times", theme: "opportunities" },
  { url: gn("housing (site:census.gov OR site:nar.realtor OR site:hud.gov)"), source: "Google News", theme: "opportunities" },
  { url: gn(`("fix and flip" OR "home flipping" OR "real estate investors") ${NATIONAL_SITES}`), source: "Google News", theme: "opportunities" },

  { url: "https://www.realtor.com/news/real-estate-news/feed/", source: "Realtor.com", theme: "opportunities" },
  { url: "https://www.realtor.com/news/trends/feed/", source: "Realtor.com", theme: "opportunities" },

  // Deals and CRE
  { url: "https://commercialobserver.com/feed/", source: "Commercial Observer", theme: "opportunities" },
  { url: "https://www.bisnow.com/rss", source: "Bisnow", theme: "opportunities" },
  { url: "https://therealdeal.com/la/feed/", source: "The Real Deal", theme: "san_diego" },
  { url: gn("site:therealdeal.com (California OR Los Angeles OR San Diego OR national)"), source: "Google News", theme: "opportunities" },

  // Old newsletter's investing searches (its CBRE/JLL/Colliers/Brookfield/
  // Prologis site: searches were dropped: they return job postings and
  // staff bios, not research)
  { url: gn("site:nar.realtor market insights", "14d"), source: "Google News", theme: "opportunities" },
  { url: gn("multifamily investment ROI OR returns"), source: "Google News", theme: "opportunities" },
  { url: gn("\"adaptive reuse\" commercial real estate"), source: "Google News", theme: "opportunities" },

  // Al Jazeera, used heavily per the brief's rules: economy and U.S. stories only
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", theme: "vision", match: ECONOMY },
  { url: gn("site:aljazeera.com (economy OR inflation OR \"interest rates\" OR housing OR tariffs)"), source: "Google News", theme: "vision" },
  { url: "https://feeds.npr.org/1017/rss.xml", source: "NPR", theme: "vision", match: ECONOMY },

  // How we build: general construction, engineering and design news.
  // Alt-construction items in these get moved to their own section by
  // detectTheme.
  { url: "https://www.constructiondive.com/feeds/news/", source: "Construction Dive", theme: "practices" },
  { url: "https://www.constructionexec.com/feed/", source: "Construction Executive", theme: "practices" },
  { url: "https://www.construction.com/feed/", source: "Dodge Construction Network", theme: "practices" },
  { url: "https://builtworlds.com/news/feed/", source: "BuiltWorlds", theme: "practices" },
  { url: "https://www.archdaily.com/feed", source: "ArchDaily", theme: "vision", match: BUILDING },
  { url: "https://architecture2030.org/feed/", source: "Architecture 2030", theme: "systems_codes" },
  { url: "https://carbonleadershipforum.org/feed/", source: "Carbon Leadership Forum", theme: "systems_codes" },
  { url: gn("construction productivity study OR research"), source: "Google News", theme: "practices" },

  // Alternative construction (Mark's #3 priority, its own section on the
  // brief): mass timber, modular/prefab, 3D printing, panelized and other
  // factory-built methods. Dedicated feeds, so the theme is trusted as-is.
  { url: "https://www.woodworks.org/feed/", source: "WoodWorks", theme: "alt_construction" },
  { url: "https://www.thinkwood.com/feed/", source: "Think Wood", theme: "alt_construction" },
  { url: gn("mass timber OR \"cross-laminated timber\" OR CLT building"), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("modular construction OR \"modular housing\" OR \"modular apartments\""), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("prefab housing OR \"offsite construction\" OR \"factory-built housing\" OR \"volumetric modular\""), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("\"3D printed\" (homes OR houses OR housing OR building)"), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("panelized OR \"light gauge steel\" OR \"steel framing\" OR \"precast concrete\" housing"), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("California (\"mass timber\" OR modular OR prefab OR \"3D printed\") (housing OR ADU OR apartments)"), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },
  { url: gn("(site:constructiondive.com OR site:archdaily.com OR site:dezeen.com OR site:archpaper.com) (timber OR modular OR prefab OR \"3D print\")"), source: "Google News", theme: "alt_construction", match: ALT_CONSTRUCTION },

  // Cities and the big picture (old newsletter's vision searches + its
  // urbanism YouTube channels)
  { url: gn("\"future of cities\" OR \"future of real estate\""), source: "Google News", theme: "vision" },
  { url: gn("urban planning innovation OR placemaking"), source: "Google News", theme: "vision" },
  { url: yt("UCGc8ZVCsrR3dAuhvUbkbToQ"), source: "City Beautiful", theme: "vision" },
  { url: yt("UC0intLFzLaudFG-xAvUEO-A"), source: "Not Just Bikes", theme: "vision" },

  // Policy and codes
  { url: gn("zoning reform real estate"), source: "Google News", theme: "systems_codes" },
  { url: gn("\"building code\" timber OR update OR reform"), source: "Google News", theme: "systems_codes" },
  { url: gn("\"green building\" policy OR \"sustainable building code\""), source: "Google News", theme: "systems_codes" },
  { url: "https://www.smartcitiesdive.com/feeds/news/", source: "Smart Cities Dive", theme: "systems_codes", match: /housing|zoning|build|development|transit|land|permit|code/i },
  { url: gn(`California (zoning OR "housing bill" OR "building code" OR CEQA) (site:calmatters.org OR ${NATIONAL_SITES.slice(1)}`), source: "Google News", theme: "systems_codes" },
];

// The brief's "never link" list. Checked against the final (resolved) URL,
// so a paywalled story can't sneak in through a Google News redirect.
const PAYWALLED_DOMAINS = [
  "wsj.com",
  "bloomberg.com",
  "ft.com",
  "washingtonpost.com",
  "economist.com",
  "barrons.com",
  "businessinsider.com",
  "sdbj.com",
  "sandiegouniontribune.com",
  "costar.com",
  "theinformation.com",
];

// Same list by publisher name, for Google News items whose link couldn't be
// resolved (the publisher still comes through in the title).
const PAYWALLED_PUBLISHERS = /wall street journal|\bWSJ\b|bloomberg|financial times|washington post|the economist|barron'?s|business insider|san diego business journal|union-tribune|costar|the information/i;

function isPaywalled(url: string, source: string): boolean {
  if (PAYWALLED_PUBLISHERS.test(source)) return true;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PAYWALLED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

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
    .replace(/&apos;/g, "'")
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

// Keyword reclassification only applies within these 4 general topic
// themes. "rates", "san_diego" and "alt_construction" come from
// deliberately dedicated feeds (see FEED_SOURCES) and are trusted as-is —
// an SD housing story can
// easily contain "investment"/"growth" language and would otherwise get
// reclassified into "opportunities" and vanish from the SD-specific view.
type KeywordTheme = "opportunities" | "practices" | "systems_codes" | "vision";

const THEME_KEYWORDS: Record<KeywordTheme, string[]> = {
  opportunities: ["investment", "invest", "returns", "roi", "acquisition", "portfolio", "growth", "expand"],
  practices: ["construction", "productivity", "technology", "build", "design-build"],
  systems_codes: ["zoning", "code", "regulation", "policy", "incentive", "opportunity zone", "compliance", "sustainab", "green building"],
  vision: ["future", "smart city", "urban planning", "innovation", "placemaking", "architecture", "vision"],
};

const KEYWORD_THEMES = Object.keys(THEME_KEYWORDS) as KeywordTheme[];

function isKeywordTheme(theme: MarketReadTheme): theme is KeywordTheme {
  return (KEYWORD_THEMES as string[]).includes(theme);
}

export function detectTheme(title: string, summary: string, fallback: MarketReadTheme): MarketReadTheme {
  if (!isKeywordTheme(fallback)) return fallback;
  if (ALT_CONSTRUCTION.test(`${title} ${summary}`)) return "alt_construction";

  const text = `${title} ${summary}`.toLowerCase();
  let best: MarketReadTheme = fallback;
  let bestScore = 0;
  for (const theme of KEYWORD_THEMES) {
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

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Google News RSS links (news.google.com/rss/articles/<id>) are opaque
// redirects that return an empty shell to anything but a real browser, so
// the full-read step can never fetch them. Resolve them to the publisher's
// URL via the same batchexecute call the Google News web app makes: pull the
// signature + timestamp off the article page, then ask for the real URL.
// Returns null on any failure so callers can fall back to the original link.
export async function resolveGoogleNewsUrl(url: string): Promise<string | null> {
  try {
    const id = new URL(url).pathname.split("/").pop();
    if (!id) return null;
    const page = await fetch(`https://news.google.com/articles/${id}`, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(5000),
    }).then((res) => res.text());
    const signature = page.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const timestamp = page.match(/data-n-a-ts="([^"]+)"/)?.[1];
    if (!signature || !timestamp) return null;

    const payload = [[[
      "Fbv4je",
      JSON.stringify([
        "garturlreq",
        [["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
        id,
        Number(timestamp),
        signature,
      ]),
      null,
      "generic",
    ]]];
    const body = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": BROWSER_UA },
      body: `f.req=${encodeURIComponent(JSON.stringify(payload))}`,
      signal: AbortSignal.timeout(5000),
    }).then((res) => res.text());
    const envelope = JSON.parse(body.split("\n\n")[1]);
    const resolved = JSON.parse(envelope[0][2])[1];
    return typeof resolved === "string" && resolved.startsWith("http") ? resolved : null;
  } catch {
    return null;
  }
}

// Resolve every Google News link in place, a few at a time so ~100 links
// don't hammer Google all at once. Google throttles bursts, so anything that
// fails gets one more try after a short pause; unresolvable links keep their
// original URL.
async function resolveGoogleNewsLinks(reads: FetchedMarketRead[]): Promise<void> {
  const resolveBatch = async (batch: FetchedMarketRead[]) => {
    const concurrency = 5;
    for (let i = 0; i < batch.length; i += concurrency) {
      await Promise.all(
        batch.slice(i, i + concurrency).map(async (r) => {
          const resolved = await resolveGoogleNewsUrl(r.url);
          if (resolved) r.url = resolved;
        })
      );
    }
  };
  const isGoogleNews = (r: FetchedMarketRead) => r.url.startsWith("https://news.google.com/");

  await resolveBatch(reads.filter(isGoogleNews));
  const retry = reads.filter(isGoogleNews);
  if (retry.length === 0) return;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await resolveBatch(retry);
}

export async function fetchMarketReads(): Promise<FetchedMarketRead[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async ({ url, source, theme, match }) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MarkScottRE/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${source}: ${res.status}`);
      const xml = await res.text();
      const isGoogleNews = url.startsWith("https://news.google.com/");
      return parseFeed(xml)
        .filter((item) => !match || match.test(`${item.title} ${item.summary}`))
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

  // Cheap, deterministic pre-filter so the (expensive) grading step only
  // ever sees a reasonably-sized, already-deduped candidate list: drop
  // items older than a week (the sweep runs daily, so anything older was
  // already seen), junk headlines (see isJunk), and collapse near-identical
  // titles that multiple feeds picked up (wire stories, syndication).
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const seenTitles = new Set<string>();
  const filtered: FetchedMarketRead[] = [];
  for (const r of reads) {
    if (r.published_at && new Date(r.published_at).getTime() < cutoff) continue;
    if (isJunk(r.title, r.source)) continue;
    const normalizedTitle = r.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seenTitles.has(normalizedTitle)) continue;
    seenTitles.add(normalizedTitle);
    filtered.push(r);
  }

  // Resolve after filtering so only surviving candidates cost a lookup, then
  // drop paywalled links and any that now point at the same article as
  // another feed's item.
  await resolveGoogleNewsLinks(filtered);
  const seenUrls = new Set<string>();
  return filtered.filter((r) => {
    if (isPaywalled(r.url, r.source) || seenUrls.has(r.url)) return false;
    seenUrls.add(r.url);
    return true;
  });
}
