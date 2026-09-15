import Header from "@/components/header";
import Footer from "@/components/footer";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const revalidate = 0;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contact = await getSetting<ContactSettings>("contact", DEFAULT_CONTACT);

  return (
    <>
      <Header contact={contact} />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} />
    </>
  );
}
