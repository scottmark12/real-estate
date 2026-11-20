import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact Mark Scott",
  description:
    "Buying, selling or investing in San Diego? Call or text (850) 363-6057 or send Mark a note. He replies the same day.",
  alternates: { canonical: "/contact" },
};


export const revalidate = 0;

export default async function ContactPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 max-[600px]:px-6 max-[600px]:pt-10 max-[600px]:pb-12 lg:pb-24">
      {/* Header, form, and contact info are DOM-ordered for mobile (intro,
          then form, then contact info) via normal stacking. The lg: grid
          places the header and the form on the same row so "Contact" lines
          up with "I'm interested in", with contact info below the header
          and the form spanning both rows. */}
      <div className="lg:grid lg:grid-cols-[42fr_58fr] lg:gap-x-16 lg:gap-y-6">
        <div className="max-w-xl lg:col-start-1 lg:row-start-1">
          <p className="eyebrow text-gold">Contact</p>
          <h1 className="mt-2 font-display text-[56px] font-normal leading-[0.95] text-navy [font-size:clamp(56px,5vw,80px)] max-[600px]:[font-family:Georgia,'Times_New_Roman',serif] max-[600px]:text-[40px] max-[600px]:font-bold max-[600px]:leading-[0.98] max-[600px]:tracking-[-0.025em]">
            Let&apos;s talk.
          </h1>
          <p className="mt-6 max-w-md text-navy/70">
            Buying, selling, investing—or just have a question about the
            market? Send me a note. I read everything myself.
          </p>
        </div>

        <div className="mt-10 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mt-0">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>

        <div className="mt-10 lg:relative lg:col-start-1 lg:row-start-2 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:border-r lg:border-sand lg:pb-6 lg:pr-16">
          <div className="lg:relative lg:z-10">
            {contact.name && (
              <p className="eyebrow text-navy">{contact.name}</p>
            )}
            <p className="mt-2 text-navy/80">{contact.city_state}</p>
            {contact.phone && (
              <p className="text-navy/80">
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="hover:text-blue"
                >
                  {contact.phone}
                </a>
                <span className="mx-2 text-navy/30">&middot;</span>
                <a
                  href={`sms:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="underline decoration-gold underline-offset-4 hover:text-blue"
                >
                  Text me
                </a>
              </p>
            )}
            <a
              href={`mailto:${contact.email}`}
              className="block text-navy/80 hover:text-blue"
            >
              {contact.email}
            </a>
            {contact.dre_number && (
              <p className="mt-3 text-sm text-navy/40">
                {contact.dre_number}
              </p>
            )}
          </div>

          <div className="relative mt-8 lg:mt-10">
            <div className="relative aspect-square w-full max-w-[360px] overflow-hidden bg-cream-deep">
              <Image
                src="/images/mark-headshot.jpeg"
                alt="Mark Scott"
                fill
                sizes="(min-width: 1024px) 360px, 80vw"
                className="object-cover"
              />
              {contact.handwritten_note && (
                <p className="font-[family-name:var(--font-hand)] absolute left-0 top-[64%] max-w-[7rem] -translate-x-[40%] text-xl leading-snug text-navy/80">
                  {contact.handwritten_note}
                  <br />
                  &mdash;MS
                </p>
              )}
            </div>
          </div>
          {contact.photo_caption && (
            <p className="eyebrow mt-2 text-right text-navy/40">
              {contact.photo_caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
