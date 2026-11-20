import NewsletterForm from "@/components/newsletter-form";

// The San Diego Market Letter signup, as a dark band. Used on the
// homepage, Market Research and article pages.
export default function MarketLetterBand({ className = "" }: { className?: string }) {
  return (
    <section className={`bg-ink px-12 py-14 text-ink-cream max-[600px]:px-6 ${className}`}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow text-ink-muted">The San Diego Market Letter</p>
          <h2 className="mt-3 font-georgia text-[34px] leading-[1.15] text-ink-cream max-[600px]:text-[28px]">
            One email a month. What&apos;s selling, what it means, and one
            neighborhood worth a look.
          </h2>
        </div>
        <div className="w-full max-w-lg">
          <NewsletterForm />
          <p className="mt-3 text-xs text-ink-muted">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
