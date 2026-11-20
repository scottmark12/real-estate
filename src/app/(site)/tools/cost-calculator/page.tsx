import type { Metadata } from "next";
import Link from "next/link";
import CostCalculator from "@/components/cost-calculator";

export const metadata: Metadata = {
  title: "True Cost of Owning Calculator",
  description:
    "What a San Diego home really costs each month: mortgage, property tax, Mello Roos, insurance and HOA, plus cash to close.",
};

export default function CostCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-12 pb-20 max-[600px]:px-6 max-[600px]:pt-8">
      <p className="text-sm text-navy/60">
        <Link href="/tools" className="hover:text-navy">
          Tools
        </Link>{" "}
        / Cost of Owning
      </p>
      <div className="mt-8 max-w-2xl">
        <p className="eyebrow text-gold">True Cost of Owning</p>
        <h1 className="mt-3 font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[34px] sm:text-[48px]">
          What a home really costs each month.
        </h1>
        <p className="mt-4 text-navy/80">
          The list price is only part of it. In San Diego, property tax, Mello
          Roos, insurance and HOA dues can add a lot to the monthly number.
          Change anything below to see how it moves.
        </p>
      </div>
      <div className="mt-12 border-t border-sand pt-10">
        <CostCalculator />
      </div>
    </div>
  );
}
