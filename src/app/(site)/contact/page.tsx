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
        <div className="lg:relative lg:flex lg:h-full lg:flex-col lg:overflow-hidden lg:border-r lg:border-sand lg:pb-6 lg:pr-16">
          <div className="lg:relative lg:z-10 lg:mt-2">
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

          <div className="relative mt-10 lg:absolute lg:inset-x-0 lg:bottom-0">
            <div className="relative ml-[8%] w-[101%] max-w-[546px]">
              {contact.photo_url ? (
                <Image
                  src={contact.photo_url}
                  alt={contact.photo_caption || "Mark Scott"}
                  width={993}
                  height={866}
                  sizes="(min-width: 1024px) 22vw, 78vw"
                  className="h-auto w-full"
                />
              ) : (
                <ImagePlaceholder
                  label="Contact — Editorial Photograph"
                  className="aspect-[993/866] w-full"
                />
              )}
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

        <div>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
