import NewsletterCta from "@/components/newsletter-cta";

// The San Diego Market Letter signup band. Used on the homepage, Market
// Research and article pages.
export default function MarketLetterBand({ className = "" }: { className?: string }) {
  return <NewsletterCta className={className} />;
}
