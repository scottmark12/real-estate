import {
  BLUE,
  COMPLIANCE,
  INK,
  MUTED,
  SANS,
  SERIF,
  button,
  emailShell,
  esc,
  eyebrow,
  signOff,
} from "@/lib/email-layout";
import { SITE_URL } from "@/lib/site";

export type LetterStat = { value: string; label: string };
export type LetterStory = {
  title: string;
  excerpt: string;
  url: string;
  image?: string | null;
  category?: string | null;
};

export type MarketLetter = {
  issue: string; // "December 2026"
  headline: string;
  intro: string; // plain text, blank lines become paragraphs
  stats: LetterStat[]; // optional, real numbers only
  statsSource?: string;
  stories: LetterStory[];
  note: string; // Mark's closing note
  unsubscribeUrl?: string;
};

const paras = (text: string, style: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${style}">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

/** The monthly San Diego Market Letter, styled like markscott.co. */
export function marketLetterHtml(l: MarketLetter) {
  const [lead, ...more] = l.stories;

  const statsHtml = l.stats.length
    ? `<tr><td class="pad" style="padding:6px 36px 30px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK};border-bottom:1px solid ${INK}"><tr>
${l.stats
  .slice(0, 3)
  .map(
    (s, i) => `<td class="col" valign="top" width="${Math.floor(100 / Math.min(3, l.stats.length))}%" style="padding:18px ${i < l.stats.length - 1 ? "14px" : "0"} 18px 0">
<p style="margin:0;font:30px/1 ${SERIF};color:${INK}">${esc(s.value)}</p>
<p style="margin:8px 0 0;font:12px/1.4 ${SANS};color:${MUTED}">${esc(s.label)}</p></td>`,
  )
  .join("")}
</tr></table>
${l.statsSource ? `<p style="margin:8px 0 0;font:11px ${SANS};color:${MUTED}">${esc(l.statsSource)}</p>` : ""}
</td></tr>`
    : "";

  const leadHtml = lead
    ? `<tr><td class="pad" style="padding:30px 36px 0;border-top:1px solid #e6e6e6">${eyebrow("This month's research")}</td></tr>
${lead.image ? `<tr><td class="pad" style="padding:16px 36px 0"><a href="${esc(lead.url)}"><img src="${esc(lead.image)}" width="528" alt="" style="display:block;width:100%;max-width:528px;height:auto;border:0"></a></td></tr>` : ""}
<tr><td class="pad" style="padding:18px 36px 30px">
${lead.category ? `<p style="margin:0 0 8px;font:600 11px ${SANS};letter-spacing:2px;text-transform:uppercase;color:${MUTED}">${esc(lead.category)}</p>` : ""}
<p style="margin:0 0 10px;font:26px/1.2 ${SERIF};color:${INK}"><a href="${esc(lead.url)}" style="color:${INK};text-decoration:none">${esc(lead.title)}</a></p>
<p style="margin:0 0 18px;font:15px/1.6 ${SANS};color:#3a3a3a">${esc(lead.excerpt)}</p>
${button(lead.url, "Read it")}
</td></tr>`
    : "";

  const moreHtml = more.length
    ? `<tr><td class="pad" style="padding:0 36px 14px">${eyebrow("Also worth reading", MUTED)}</td></tr>
${more
  .slice(0, 3)
  .map(
    (s) => `<tr><td class="pad" style="padding:0 36px 22px">
<p style="margin:0 0 4px;font:19px/1.3 ${SERIF};color:${INK}"><a href="${esc(s.url)}" style="color:${INK};text-decoration:none">${esc(s.title)}</a></p>
<p style="margin:0;font:14px/1.55 ${SANS};color:#3a3a3a">${esc(s.excerpt)} <a href="${esc(s.url)}" style="color:${BLUE};text-decoration:underline">Read</a></p>
</td></tr>`,
  )
  .join("")}`
    : "";

  const body = `<tr><td class="pad" style="padding:30px 36px 24px">
${eyebrow(`The San Diego Market Letter · ${l.issue}`)}
<p class="h1" style="margin:12px 0 16px;font:34px/1.12 ${SERIF};color:${INK}">${esc(l.headline)}</p>
${paras(l.intro, `margin:0 0 14px;font:16px/1.65 ${SANS};color:#2a2a2a`)}
</td></tr>
${statsHtml}
${leadHtml}
${moreHtml}
<tr><td class="pad" style="padding:26px 36px;background:#f6f6f4">${signOff(esc(l.note))}</td></tr>
<tr><td class="pad" style="padding:26px 36px 30px">
<p style="margin:0 0 14px;font:20px/1.3 ${SERIF};color:${INK}">Wondering what your home would sell for today?</p>
${button(`${SITE_URL}/sell?value=1`, "Get my home value")}
</td></tr>`;

  const footer = `${COMPLIANCE}<br>
You're getting this because you signed up for the San Diego Market Letter on markscott.co.${
    l.unsubscribeUrl
      ? ` <a href="${esc(l.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a>.`
      : ""
  }`;

  return emailShell({ preheader: l.headline, body, footer });
}
