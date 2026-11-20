import type { Metadata } from "next";
import SellPageBody from "@/components/sell-page-body";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sell Your San Diego Home",
  description:
    "Selling a home in San Diego? Get a free home value from recent sales and a simple four step plan: evaluate, prepare, market, close.",
  alternates: { canonical: "/sell" },
};


export const revalidate = 300;

// Static page. The ?value=1 deep link that opens the home value form is
// read in the browser (SellPageBody) so this page can be cached.
export default async function SellPage() {
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return <SellPageBody contact={contact} />;
}
