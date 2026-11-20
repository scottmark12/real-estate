import type { Metadata } from "next";
import NeighborhoodQuiz from "@/components/neighborhood-quiz";

export const metadata: Metadata = {
  title: "Where Should I Live in San Diego?",
  description:
    "Answer a few quick questions about how you want to live and get your top three San Diego neighborhoods, free.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-12 pt-16 pb-24 max-[600px]:px-6 max-[600px]:pt-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-gold">The Neighborhood Quiz</p>
        <h1 className="mt-3 font-georgia text-[42px] font-normal leading-[1.1] text-navy max-[600px]:text-[34px] sm:text-[48px]">
          Where should I live in San Diego?
        </h1>
        <p className="mt-4 text-navy/70">A few questions about how you want to live, and the three neighborhoods that fit you best. About two minutes.</p>
      </div>
      <div className="mt-12">
        <NeighborhoodQuiz />
      </div>
    </div>
  );
}
