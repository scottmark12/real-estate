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
