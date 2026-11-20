import type { Metadata } from "next";
import { Caveat, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
});

const libreCaslonDisplay = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-libre-caslon",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mark Scott | San Diego Real Estate Agent in Encinitas",
    template: "%s | Mark Scott Real Estate",
  },
  description:
    "Mark Scott helps people buy and sell homes across San Diego County, with a designer's eye and an investor's math. Based in Encinitas.",
  openGraph: {
    title: "Mark Scott Real Estate | San Diego",
    description: "Homes, market research, and real estate across San Diego.",
    siteName: "Mark Scott Real Estate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mark Scott Real Estate | San Diego",
    description: "Homes, market research, and real estate across San Diego.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${caveat.variable} ${libreCaslonDisplay.variable}`}
    >
      <body className="min-h-full flex flex-col bg-cream font-sans text-navy">
        {children}
      </body>
    </html>
  );
}
