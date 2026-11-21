import { preconnect } from "react-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MobileActionBar from "@/components/mobile-action-bar";
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
      {/* Tells Google the site's name for search results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Mark Scott Real Estate",
            alternateName: "Mark Scott",
            url: SITE_URL,
            publisher: { "@id": `${SITE_URL}/#agent` },
          }),
        }}
      />
      <Header contact={contact} />
      <main className="flex-1">{children}</main>
      {/* Room under the footer so the phone action bar never covers it. */}
      <div className="bg-ink pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
        <Footer contact={contact} />
      </div>
      <MobileActionBar phone={contact.phone} />
    </>
  );
}
