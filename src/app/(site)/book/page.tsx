import type { Metadata } from "next";
import Image from "next/image";
import BookingPicker from "@/components/booking-picker";

export const metadata: Metadata = {
  title: "Book a Call with Mark Scott",
  description:
    "Book a free 15 minute call with Mark Scott, an Encinitas real estate agent. Pick a time that works and he'll call you.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-14 sm:px-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-20">
      <div className="max-w-md">
        <p className="eyebrow text-gold">Book a call</p>
        <h1 className="mt-2 font-georgia text-[44px] leading-[1.02] text-navy sm:text-[56px]">
          15 minutes. No pressure.
        </h1>
        <p className="mt-5 text-navy/75">
          Tell me what you&apos;re thinking about, buying, selling, or just
          where the market&apos;s headed. I&apos;ll call you at the time you pick.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Image
            src="/images/mark-headshot.jpeg"
            alt="Mark Scott"
            width={128}
            height={128}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="text-sm text-navy/70">
            <p className="font-semibold text-navy">Mark Scott</p>
            <p>Premier Agency Real Estate · Encinitas</p>
          </div>
        </div>
        <p className="mt-8 text-sm text-navy/55">
          Weekdays 7am to 7pm and Saturdays 8am to noon, San Diego time. Rather
          just talk now? Call or text{" "}
          <a href="tel:+18503636057" className="underline decoration-gold underline-offset-4">
            (850) 363-6057
          </a>
          .
        </p>
      </div>
      <div className="mt-12 lg:mt-2">
        <BookingPicker />
      </div>
    </div>
  );
}
