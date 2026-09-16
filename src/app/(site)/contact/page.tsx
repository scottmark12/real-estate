import Image from "next/image";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";
import ImagePlaceholder from "@/components/image-placeholder";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const revalidate = 0;

export default async function ContactPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-20 lg:pb-24">
      <div className="grid gap-16 lg:grid-cols-[42fr_58fr]">
        <div className="lg:flex lg:h-full lg:flex-col lg:border-r lg:border-sand lg:pb-6 lg:pr-16">
          <div>
            <p className="eyebrow text-gold">Contact</p>
            <h1 className="mt-2 font-display text-[56px] font-normal leading-[0.95] text-navy [font-size:clamp(56px,5vw,80px)]">
              Let&apos;s talk.
            </h1>
            <p className="mt-6 max-w-md text-navy/70">
              Buying, selling, investing—or just have a question about the
              market? Send me a note. I read everything myself.
            </p>

            <div className="mt-4">
              {contact.name && (
                <p className="eyebrow text-navy">{contact.name}</p>
              )}
              <p className="mt-2 text-navy/80">{contact.city_state}</p>
              {contact.phone && (
                <p className="text-navy/80">{contact.phone}</p>
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
          </div>

          <div className="mt-16 flex items-end justify-end gap-4 lg:mt-auto">
            {contact.handwritten_note && (
              <p className="font-[family-name:var(--font-hand)] mb-3 max-w-[9rem] shrink-0 text-right text-[22px] leading-snug text-navy/70">
                {contact.handwritten_note}
                <br />
                &mdash;MS
              </p>
            )}
            {contact.photo_url ? (
              <div className="relative h-[185px] w-[160px] shrink-0 sm:h-[215px] sm:w-[185px]">
                <Image
                  src={contact.photo_url}
                  alt={contact.photo_caption || "Mark Scott"}
                  fill
                  sizes="200px"
                  className="object-contain object-bottom"
                />
              </div>
            ) : (
              <ImagePlaceholder
                label="Contact — Editorial Photograph"
                className="h-[185px] w-[160px] shrink-0 sm:h-[215px] sm:w-[185px]"
              />
            )}
          </div>
          {contact.photo_caption && (
            <p className="eyebrow -mt-1 text-right text-navy/40">
              {contact.photo_caption}
            </p>
          )}
        </div>

        <div>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
