import { preconnect } from "react-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Listing photos come straight from the MLS image host; open that
  // connection early so the first photos don't wait on DNS and TLS.
  preconnect("https://myoffice.premieragencyagents.com");
  const contact = await getSetting<ContactSettings>("contact", DEFAULT_CONTACT);

  // Local business info for Google ("Encinitas realtor" and similar).
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Mark Scott Real Estate",
    "@id": `${SITE_URL}/#agent`,
    url: SITE_URL,
    image: `${SITE_URL}/images/mark-headshot.jpeg`,
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Encinitas",
      addressRegion: "CA",
      addressCountry: "US",
    },
    areaServed: { "@type": "AdministrativeArea", name: "San Diego County, CA" },
    parentOrganization: {
      "@type": "RealEstateAgent",
      name: "Premier Agency Real Estate",
      url: "https://www.premieragencyre.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <Header contact={contact} />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} />
    </>
  );
}
