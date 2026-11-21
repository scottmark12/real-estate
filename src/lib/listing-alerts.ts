import { type FeedListing, formatFeedPrice, formatFeedStats } from "@/lib/premier-feed";
import { SITE_URL } from "@/lib/site";
import { BLUE, INK, MUTED, SANS, SERIF, esc } from "@/lib/email-layout";

// A saved search: the Buy filters someone wants to hear about.
export type AlertParams = {
  q?: string;
  city?: string;
  zip?: string;
  area?: string;
  min_price?: string;
  max_price?: string;
  min_beds?: string;
  property_type?: string;
};

const KEYS: (keyof AlertParams)[] = [
  "q",
  "city",
  "zip",
  "area",
  "min_price",
  "max_price",
  "min_beds",
  "property_type",
];

export function cleanParams(raw: unknown): AlertParams {
  const out: AlertParams = {};
  if (!raw || typeof raw !== "object") return out;
  for (const k of KEYS) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 80);
  }
  return out;
}

function money(v?: string) {
  const n = Number(v);
  if (!n) return null;
  return n >= 1_000_000 ? `$${+(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`;
}

// "Homes in Leucadia, 3+ beds, up to $2M"
export function describeParams(p: AlertParams) {
  const where = p.area || p.q || p.city || (p.zip ? `ZIP ${p.zip}` : "San Diego County");
  const bits: string[] = [];
  if (p.property_type === "condo") bits.push("condos and townhomes");
  if (p.property_type === "single-family") bits.push("houses");
  if (p.min_beds) bits.push(`${p.min_beds}+ beds`);
  const lo = money(p.min_price);
  const hi = money(p.max_price);
  if (lo && hi) bits.push(`${lo} to ${hi}`);
  else if (lo) bits.push(`${lo} and up`);
  else if (hi) bits.push(`up to ${hi}`);
  return [`Homes in ${where}`, ...bits].join(", ");
}

export function buyUrl(p: AlertParams, base = SITE_URL) {
  const qs = new URLSearchParams();
  if (p.q) qs.set("q", p.q);
  if (p.city) qs.set("city", p.city);
  if (p.zip) qs.set("zip", p.zip);
  if (p.area) qs.set("area", p.area);
  if (p.min_price) qs.set("min_price", p.min_price);
  if (p.max_price) qs.set("max_price", p.max_price);
  if (p.min_beds) qs.set("min_beds", p.min_beds);
  if (p.property_type) qs.set("type", p.property_type);
  const s = qs.toString();
  return `${base}/buy${s ? `?${s}` : ""}`;
}

/** "New in Encinitas: 110 Turner Avenue and 4 more" */
export function alertSubject(listings: FeedListing[]) {
  const [first] = listings;
  if (!first) return "New homes for your search";
  const cities = new Set(listings.map((l) => l.city));
  const where = cities.size === 1 ? first.city : "your search";
  const more = listings.length - 1;
  return `New in ${where}: ${first.address}${more ? ` and ${more} more` : ""}`;
}

// Short facts line from real listing data: "3 bd · 2 ba · 1,327 sqft · $1,300/sqft · Built 1976"
function factsLine(l: FeedListing) {
  const bits = [formatFeedStats(l)];
  const price = Number(l.price);
  if (price && l.sqft) bits.push(`$${Math.round(price / l.sqft).toLocaleString("en-US")}/sqft`);
  const year = new Date().getFullYear();
  if (l.year_built && l.year_built >= year - 1) bits.push("New construction");
  else if (l.year_built) bits.push(`Built ${l.year_built}`);
  return bits.filter(Boolean).join(" · ");
}

// Reads like a quick personal note from Mark, not a portal alert: a couple of
// lines, up to three small home cards, an invitation to reply.
export function alertEmailHtml(opts: {
  name?: string | null;
  label: string;
  listings: FeedListing[];
  seeAllUrl: string;
  unsubscribeUrl: string;
}) {
  const base = SITE_URL;
  const shown = opts.listings.slice(0, 3);
  const extra = opts.listings.length - shown.length;
  const first = opts.name?.trim().split(/\s+/)[0];
  const text = `font:16px/1.6 ${SANS};color:${INK}`;
  const count = opts.listings.length;
  const lead =
    count === 1
      ? `A new one just came up for your search (${esc(opts.label.replace(/^Homes in /, ""))}):`
      : `${count <= 9 ? ["", "", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][count] : count} new ones just came up for your search (${esc(opts.label.replace(/^Homes in /, ""))}):`;

  const cards = shown
    .map((l) => {
      const url = `${base}/buy/${l.id}`;
      const img = l.primary_image_url
        ? `<a href="${url}"><img src="${esc(l.primary_image_url)}" width="132" height="99" alt="${esc(l.address)}" style="display:block;width:132px;height:99px;object-fit:cover;border:0;border-radius:6px;background:#eee"></a>`
        : "";
      return `<tr><td style="padding:0 0 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e4e4e4;border-radius:8px"><tr>
<td width="132" valign="top" style="padding:10px">${img}</td>
<td valign="middle" style="padding:10px 14px 10px 4px">
<p style="margin:0 0 2px;font:19px ${SERIF};color:${INK}"><a href="${url}" style="color:${INK};text-decoration:none">${formatFeedPrice(l.price)}</a></p>
<p style="margin:0 0 3px;font:14px/1.4 ${SANS};color:${INK}"><a href="${url}" style="color:${INK};text-decoration:none">${esc(l.address)}, ${esc(l.city)}</a></p>
<p style="margin:0;font:12px/1.5 ${SANS};color:${MUTED}">${esc(factsLine(l))}</p>
</td></tr></table>
</td></tr>`;
    })
    .join("");

  const body = `
<p style="margin:0 0 16px;${text}">${first ? `Hi ${esc(first)},` : "Hi,"}</p>
<p style="margin:0 0 18px;${text}">${lead}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cards}</table>
<p style="margin:4px 0 18px;${text}">${extra > 0 ? `Plus ${extra} more. <a href="${esc(opts.seeAllUrl)}" style="color:${BLUE}">See all of them</a>.` : `<a href="${esc(opts.seeAllUrl)}" style="color:${BLUE}">See everything for this search</a>.`}</p>
<p style="margin:0 0 18px;${text}">Want my take on any of these, or to go see one this week? Just reply.</p>
<p style="margin:0;${text}">Mark</p>
<p style="margin:4px 0 0;font:13px/1.55 ${SANS};color:${MUTED}">Mark Scott &middot; Premier Agency Real Estate<br>(850) 363-6057 &middot; <a href="${base}" style="color:${MUTED}">markscott.co</a></p>`;

  const footer = `DRE# 02449646 &middot; Brokered by Premier Agency Real Estate, CalDRE# 02240990 &middot; 900 Lane Ave, Chula Vista, CA 91914.
Listing data from the MLS via Premier Agency. Deemed reliable but not guaranteed.
You're getting this because you asked for new homes matching this search on markscott.co. <a href="${esc(opts.unsubscribeUrl)}" style="color:#9a9a9a">Stop these emails</a>.`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>New homes</title></head>
<body style="margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fff">${esc(alertSubject(opts.listings))}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:24px 18px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px"><tr><td>
${body}
<p style="margin:34px 0 0;padding-top:14px;border-top:1px solid #eee;font:11px/1.6 ${SANS};color:#9a9a9a">${footer}</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
}
