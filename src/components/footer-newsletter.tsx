"use client";

import { usePathname } from "next/navigation";
import NewsletterCta from "@/components/newsletter-cta";

// Pages that already show the full Market Letter band skip this one.
const HAS_BAND = (path: string) =>
  path === "/" || path === "/discover" || path.startsWith("/insights");

export default function FooterNewsletter() {
  const path = usePathname() ?? "";
  if (HAS_BAND(path)) return null;
  return <NewsletterCta className="border-b border-sand" />;
}
