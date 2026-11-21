import { SITE_URL } from "@/lib/site";

// Shared look for every designed email (listing alerts, the Market Letter):
// white page, a thin black frame, serif headlines, the site's blue for small
// labels. Table layout with inline styles so it holds up in Gmail, Outlook
// and Apple Mail.

export const INK = "#141414";
export const BLUE = "#3262a6";
export const MUTED = "#6b6b6b";
export const SERIF = "Georgia,'Times New Roman',serif";
// Emails use one traditional serif throughout so they read like a letter,
// not an app notification.
export const SANS = "Georgia,'Times New Roman',serif";

export const esc = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function button(href: string, label: string, dark = true) {
  const bg = dark ? INK : "#ffffff";
  const fg = dark ? "#ffffff" : INK;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${bg};border:1px solid ${INK}">
<a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font:600 14px ${SANS};color:${fg};text-decoration:none;letter-spacing:.3px">${esc(label)}</a>
</td></tr></table>`;
}

export function eyebrow(text: string, color = BLUE) {
  return `<p style="margin:0;font:600 11px ${SANS};letter-spacing:2.5px;text-transform:uppercase;color:${color}">${esc(text)}</p>`;
}

/** Mark's face and a line inviting a reply. */
export function signOff(text: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
<td width="64" valign="top" style="padding-right:16px"><img src="${SITE_URL}/email/mark-192.jpg" width="64" height="64" alt="Mark Scott" style="display:block;width:64px;height:64px;border-radius:32px;border:0"></td>
<td valign="middle" style="font:15px/1.55 ${SANS};color:${INK}">${text}<br><span style="font:13px ${SANS};color:${MUTED}">Mark Scott &middot; (850) 363-6057</span></td>
</tr></table>`;
}

export function emailShell(opts: {
  preheader: string;
  body: string;
  footer: string;
}) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>markscott.co</title>
<style>
  @media (max-width:620px){
    .wrap{padding:0 !important}
    .frame{border-left:0 !important;border-right:0 !important}
    .pad{padding-left:22px !important;padding-right:22px !important}
    .col{display:block !important;width:100% !important;padding:0 0 26px 0 !important}
    .h1{font-size:30px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fff">${esc(opts.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff"><tr><td align="center" class="wrap" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="frame" style="width:100%;max-width:600px;border:1px solid ${INK};background:#ffffff">
<tr><td class="pad" style="padding:26px 36px 22px;border-bottom:1px solid #e6e6e6">
<a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/email/logo-96.png" width="124" height="48" alt="Mark Scott Real Estate" style="display:block;width:124px;height:48px;border:0"></a>
</td></tr>
${opts.body}
<tr><td class="pad" style="padding:22px 36px 26px;border-top:1px solid #e6e6e6;font:12px/1.65 ${SANS};color:${MUTED}">${opts.footer}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export const COMPLIANCE = `Mark Scott &middot; DRE# 02449646 &middot; (850) 363-6057 &middot; <a href="mailto:mark@markscott.co" style="color:${MUTED}">mark@markscott.co</a><br>
Brokered by Premier Agency Real Estate, CalDRE# 02240990 &middot; 900 Lane Ave, Chula Vista, CA 91914`;

/** Mark's email signature, identical to the one in his Outlook. */
export const SIGNATURE_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
<tr><td style="padding:0 0 2px;font:20px Georgia,'Times New Roman',serif;color:#141414">Mark Scott</td></tr>
<tr><td style="padding:0 0 10px;font:13px Georgia,'Times New Roman',serif;color:#6b6b6b">Real Estate Agent&nbsp;&middot;&nbsp;Premier Agency Real Estate</td></tr>
<tr><td style="padding:0 0 10px"><div style="width:36px;border-top:2px solid #3262a6;font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:0 0 2px;font:13px Georgia,'Times New Roman',serif;color:#141414"><a href="tel:+18503636057" style="color:#141414;text-decoration:none">(850) 363-6057</a>&nbsp;&middot;&nbsp;<a href="https://www.markscott.co" style="color:#3262a6;text-decoration:none">markscott.co</a></td></tr>
<tr><td style="padding:0;font:11px Georgia,'Times New Roman',serif;color:#9a9a9a">Encinitas, CA&nbsp;&middot;&nbsp;DRE# 02449646</td></tr>
</table>`;
