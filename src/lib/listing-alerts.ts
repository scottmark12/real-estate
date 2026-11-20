import { type FeedListing, formatFeedPrice, formatFeedStats } from "@/lib/premier-feed";
import { SITE_URL } from "@/lib/site";

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

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Plain table HTML so it renders in every inbox.
export function alertEmailHtml(opts: {
  name?: string | null;
  label: string;
  listings: FeedListing[];
  seeAllUrl: string;
  unsubscribeUrl: string;
}) {
  const base = SITE_URL;
  const shown = opts.listings.slice(0, 8);
  const rows = shown
    .map((l) => {
      const url = `${base}/buy/${l.id}`;
      const img = l.primary_image_url
        ? `<a href="${url}"><img src="${esc(l.primary_image_url)}" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0"></a>`
        : "";
      return `<tr><td style="padding:0 0 28px 0">
        ${img}
        <p style="margin:12px 0 2px;font:20px Georgia,serif;color:#141414"><a href="${url}" style="color:#141414;text-decoration:none">${esc(l.address)}</a></p>
        <p style="margin:0;font:12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#888">${esc(l.city)}, ${esc(l.state)} ${esc(l.zip)}</p>
        <p style="margin:6px 0 0;font:15px Arial,sans-serif;color:#141414"><strong>${formatFeedPrice(l.price)}</strong> &nbsp;·&nbsp; ${esc(formatFeedStats(l))}</p>
      </td></tr>`;
    })
    .join("");
  const more = opts.listings.length > shown.length ? ` (and ${opts.listings.length - shown.length} more)` : "";
  const hi = opts.name ? `Hi ${esc(opts.name.split(" ")[0])},` : "Hi,";
  return `<!doctype html><html><body style="margin:0;background:#f3f3f3">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="padding:28px 20px 8px;font:13px Arial,sans-serif;letter-spacing:2px;color:#3262a6;text-transform:uppercase">New listings &middot; markscott.co</td></tr>
<tr><td style="padding:0 20px 20px;font:15px/1.5 Arial,sans-serif;color:#333">
<p style="margin:0 0 6px;font:26px Georgia,serif;color:#141414">${opts.listings.length} new ${opts.listings.length === 1 ? "home" : "homes"} for your search</p>
<p style="margin:0">${hi} here's what just hit the market for <em>${esc(opts.label)}</em>${more}. Want my honest take on any of them? Just reply.</p>
</td></tr>
<tr><td style="padding:0 20px">${`<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`}</td></tr>
<tr><td style="padding:0 20px 28px"><a href="${esc(opts.seeAllUrl)}" style="display:inline-block;background:#141414;color:#fff;font:600 14px Arial,sans-serif;padding:14px 22px;text-decoration:none">See every match</a></td></tr>
<tr><td style="padding:20px;border-top:1px solid #eee;font:12px/1.6 Arial,sans-serif;color:#888">
Mark Scott &middot; (850) 363-6057 &middot; mark@markscott.co<br>
DRE# 02449646 &middot; Brokered by Premier Agency Real Estate, CalDRE# 02240990<br>
Premier Agency Real Estate, 900 Lane Ave, Chula Vista, CA 91914<br>
Listing data from the MLS via Premier Agency. Deemed reliable but not guaranteed.<br>
You're getting this because you asked for new homes matching this search on markscott.co.
<a href="${esc(opts.unsubscribeUrl)}" style="color:#888">Stop these emails</a>.
</td></tr>
</table></td></tr></table></body></html>`;
}
