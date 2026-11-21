// The site's one official address. markscott.co redirects here (Vercel),
// so every link we hand Google, email clients or social cards uses it.
export const SITE_URL = "https://www.markscott.co";

export type Crumb = { name: string; path: string };

// BreadcrumbList structured data, Home first.
export function breadcrumbLd(crumbs: Crumb[]) {
  const all = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Trim text to a search snippet length, cutting at a word, no trailing comma. */
export function clip(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

/** Page title that fits Google's ~60 character limit, brand added only when it fits. */
export function seoTitle(title: string): string {
  if (title.length <= 36) return `${title} | Mark Scott Real Estate`;
  if (title.length <= 47) return `${title} | Mark Scott`;
  return title;
}
