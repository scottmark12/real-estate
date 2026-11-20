import type { Metadata } from "next";
import SavedHomesView from "./saved-homes-view";

export const metadata: Metadata = {
  title: "Saved Homes",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 lg:px-12">
      <p className="eyebrow text-gold">Saved homes</p>
      <h1 className="mt-3 font-georgia text-[44px] leading-none text-navy sm:text-[56px]">Your shortlist</h1>
      <p className="mt-4 max-w-xl text-navy/60">
        Saved on this device. Send the list to me any time and I&apos;ll dig into them.
      </p>
      <SavedHomesView />
    </div>
  );
}
