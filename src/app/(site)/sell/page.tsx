import type { Metadata } from "next";
import SellPageBody from "@/components/sell-page-body";
import { DEFAULT_CONTACT, getSetting } from "@/lib/settings";
import type { ContactSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sell Your San Diego Home",
  description:
    "Selling a home in San Diego? Get a real value from recent sales and a simple four step plan: evaluate, prepare, market, close.",
};


export const revalidate = 0;

export default async function SellPage({ searchParams }: PageProps<"/sell">) {
  const sp = await searchParams;
  const openValuation = sp.value === "1";
  const contact = await getSetting<ContactSettings>(
    "contact",
    DEFAULT_CONTACT
  );

  return <SellPageBody contact={contact} openValuation={openValuation} />;
}
