"use client";

import { usePathname } from "next/navigation";
import NewsletterForm from "@/components/newsletter-form";

// Pages that already show the full Market Letter band skip this one.
const HAS_BAND = (path: string) => path === "/" || path.startsWith("/insights");

export default function FooterNewsletter() {
  const path = usePathname() ?? "";
  if (HAS_BAND(path)) return null;
  return (
    <div className="border-t border-ink-cream/10 px-[4vw] py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow text-ink-muted">The San Diego Market Letter</p>
          <p className="mt-1 text-sm text-ink-cream/80">
            One email a month. What&apos;s selling and what it means.
          </p>
        </div>
        <div className="w-full max-w-lg">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
