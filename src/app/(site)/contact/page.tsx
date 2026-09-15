import ContactForm from "@/components/contact-form";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const revalidate = 0;

export default async function ContactPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Let&apos;s Talk Real Estate
      </h1>
      <p className="mt-3 max-w-xl text-navy/70">
        Whether you&apos;re buying, selling, or investing in{" "}
        {contact.city_state}, reach out and I&apos;ll get back to you
        personally.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="h-fit rounded-2xl border border-sand bg-white/70 p-6">
          <p className="eyebrow text-navy/50">Direct</p>
          <ul className="mt-4 space-y-2 text-navy/80">
            <li>{contact.city_state}</li>
            {contact.phone && <li>{contact.phone}</li>}
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-navy">
                {contact.email}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm text-navy/50">{contact.dre_number}</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
