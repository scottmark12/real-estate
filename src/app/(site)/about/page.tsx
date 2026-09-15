import Image from "next/image";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { AboutSettings, ContactSettings } from "@/lib/types";

export const revalidate = 0;

export default async function AboutPage() {
  const [about, contact] = await Promise.all([
    getSetting<AboutSettings>("about", DEFAULT_ABOUT),
    getSetting<ContactSettings>("contact", DEFAULT_CONTACT),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10">
      <p className="eyebrow text-gold">About</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        {about.name}
      </h1>

      <div className="mt-10 grid gap-10 sm:grid-cols-[220px_1fr] sm:items-start">
        {about.headshot_url && (
          <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-sand">
            <Image
              src={about.headshot_url}
              alt={about.name}
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <blockquote className="font-display text-2xl leading-snug text-navy">
            &ldquo;{about.quote}&rdquo;
          </blockquote>
          <p className="mt-6 text-navy/75">
            {about.name} is a real estate professional based in{" "}
            {contact.city_state}, working with buyers, sellers, and
            investors across residential and commercial property. {about.name}{" "}
            combines deep local market data with hands-on experience to help
            clients make confident, well-informed decisions.
          </p>
          <p className="mt-4 text-sm text-navy/50">{contact.dre_number}</p>
        </div>
      </div>
    </div>
  );
}
