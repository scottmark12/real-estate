import type { Metadata } from "next";
import "./globals.css";

// Note: this build environment cannot reach fonts.googleapis.com (network
// policy blocks it), so next/font/google is not used here. The CSS below
// falls back to Georgia/system-ui stacks per the brief's fallback guidance.
// On a network-unrestricted host, swap these for next/font/google Playfair
// Display + Inter and add the returned className variables here.

export const metadata: Metadata = {
  title: "Mark Scott Real Estate | San Diego",
  description:
    "Mark Scott Real Estate — residential, commercial, and investment property expertise across San Diego, California.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream font-sans text-navy">
        {children}
      </body>
    </html>
  );
}
