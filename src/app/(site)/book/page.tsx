import type { Metadata } from "next";
import BookingPicker from "@/components/booking-picker";

export const metadata: Metadata = {
  title: "Book a Call with Mark Scott",
  description:
    "Book a free 15 minute call with Mark Scott, an Encinitas real estate agent. Pick a time that works and he'll call you.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="full-bleed bg-[#f6f6f4] px-4 pb-20 pt-10 sm:px-8 lg:pt-16">
      <div className="mx-auto max-w-[1060px]">
        <BookingPicker />
        <p className="mt-6 text-center text-[13px] text-navy/50">
          Weekdays 7am to 7pm, Saturdays 8am to noon. Rather talk now? Call or
          text{" "}
          <a href="tel:+18503636057" className="underline underline-offset-4">
            (850) 363-6057
          </a>
          .
        </p>
      </div>
    </div>
  );
}
