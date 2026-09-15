import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Mark Scott Real Estate | San Diego",
  description:
    "Mark Scott Real Estate — residential, commercial, and investment property expertise across San Diego, California.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${caveat.variable}`}>
      <body className="min-h-full flex flex-col bg-cream font-sans text-navy">
        {children}
      </body>
    </html>
  );
}
