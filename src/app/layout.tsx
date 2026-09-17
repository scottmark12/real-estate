import type { Metadata } from "next";
import { Caveat, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://markscott.co"),
  title: "Mark Scott Real Estate | San Diego",
  description:
    "Mark Scott Real Estate — residential, commercial, and investment property expertise across San Diego, California.",
  openGraph: {
    title: "Mark Scott Real Estate | San Diego",
    description:
      "Mark Scott Real Estate — residential, commercial, and investment property expertise across San Diego, California.",
    url: "https://markscott.co",
    siteName: "Mark Scott Real Estate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mark Scott Real Estate | San Diego",
    description:
      "Mark Scott Real Estate — residential, commercial, and investment property expertise across San Diego, California.",
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
