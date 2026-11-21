import { type FeedListing, formatFeedPrice, formatFeedStats } from "@/lib/premier-feed";
import { SITE_URL } from "@/lib/site";
import { COMPLIANCE, INK, MUTED, SANS, SERIF, button, emailShell, esc, eyebrow, signOff } from "@/lib/email-layout";

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

// Designed to match the site: one big lead home, the rest two across
// (stacked on phones), then a note from Mark.
export function alertEmailHtml(opts: {
  name?: string | null;
  label: string;
  listings: FeedListing[];
  seeAllUrl: string;
  unsubscribeUrl: string;
}) {
  const base = SITE_URL;
  const shown = opts.listings.slice(0, 7);
  const [lead, ...rest] = shown;
  const count = opts.listings.length;
  const first = opts.name?.trim().split(/\s+/)[0];

  const photo = (l: FeedListing, w: number, h: number) =>
    l.primary_image_url
      ? `<a href="${base}/buy/${l.id}"><img src="${esc(l.primary_image_url)}" width="${w}" alt="${esc(`${l.address}, ${l.city}`)}" style="display:block;width:100%;max-width:${w}px;height:auto;max-height:${h}px;object-fit:cover;border:0;background:#eee"></a>`
      : "";

  const leadHtml = lead
    ? `<tr><td style="padding:0">${photo(lead, 600, 400)}</td></tr>
<tr><td class="pad" style="padding:22px 36px 30px">
${eyebrow(`${esc(lead.city)} &middot; New`)}
<p style="margin:10px 0 4px;font:30px/1.15 ${SERIF};color:${INK}">${formatFeedPrice(lead.price)}</p>
<p style="margin:0 0 4px;font:17px/1.4 ${SERIF};color:${INK}"><a href="${base}/buy/${lead.id}" style="color:${INK};text-decoration:none">${esc(lead.address)}</a></p>
<p style="margin:0 0 20px;font:14px ${SANS};color:${MUTED}">${esc(formatFeedStats(lead))} &middot; ${esc(lead.city)}, ${esc(lead.state)} ${esc(lead.zip)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:10px">${button(`${base}/buy/${lead.id}`, "See this home")}</td>
<td>${button(`${base}/buy/${lead.id}#tour`, "Request a tour", false)}</td>
</tr></table>
</td></tr>`
    : "";

  const card = (l: FeedListing) => `<a href="${base}/buy/${l.id}" style="text-decoration:none;color:${INK}">${photo(l, 252, 190)}
<p style="margin:12px 0 2px;font:20px ${SERIF};color:${INK}">${formatFeedPrice(l.price)}</p>
<p style="margin:0 0 2px;font:14px/1.4 ${SANS};color:${INK}">${esc(l.address)}</p>
<p style="margin:0;font:13px ${SANS};color:${MUTED}">${esc(formatFeedStats(l))} &middot; ${esc(l.city)}</p></a>`;

  const pairs: string[] = [];
  for (let i = 0; i < rest.length; i += 2) {
    const a = rest[i];
    const b = rest[i + 1];
    pairs.push(`<tr>
<td class="col" width="50%" valign="top" style="padding:0 12px 30px 0">${card(a)}</td>
<td class="col" width="50%" valign="top" style="padding:0 0 30px 12px">${b ? card(b) : ""}</td>
</tr>`);
  }
  const grid = pairs.length
    ? `<tr><td class="pad" style="padding:30px 36px 0;border-top:1px solid #e6e6e6">
${eyebrow("Also new")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px">${pairs.join("")}</table>
</td></tr>`
    : "";

  const more = count > shown.length ? `See all ${count} matches` : "See every match";

  const body = `<tr><td class="pad" style="padding:30px 36px 26px">
${eyebrow("New listings for your search")}
<p class="h1" style="margin:12px 0 10px;font:34px/1.12 ${SERIF};color:${INK}">${count} new ${count === 1 ? "home" : "homes"} just hit the market</p>
<p style="margin:0;font:15px/1.55 ${SANS};color:#3a3a3a">${first ? `${esc(first)}, here's` : "Here's"} what's new for <em>${esc(opts.label)}</em>.</p>
</td></tr>
${leadHtml}
${grid}
<tr><td class="pad" style="padding:6px 36px 32px">${button(opts.seeAllUrl, more)}</td></tr>
<tr><td class="pad" style="padding:26px 36px;background:#f6f6f4">${signOff("Want my honest take on any of these, or the price I'd actually offer? Just reply.")}</td></tr>`;

  const footer = `${COMPLIANCE}<br>
Listing data from the MLS via Premier Agency. Deemed reliable but not guaranteed.<br>
You're getting this because you asked for new homes matching this search on markscott.co. <a href="${esc(opts.unsubscribeUrl)}" style="color:${MUTED}">Stop these emails</a>.`;

  return emailShell({
    preheader: lead
      ? `${formatFeedPrice(lead.price)} in ${lead.city}${count > 1 ? ` and ${count - 1} more` : ""}`
      : "New homes for your search",
    body,
    footer,
  });
}
