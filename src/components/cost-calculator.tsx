"use client";

import { useState } from "react";

type Field = {
  key: string;
  label: string;
  prefix?: string;
  suffix?: string;
  step: number;
  help?: string;
};

const FIELDS: Field[] = [
  { key: "price", label: "Home price", prefix: "$", step: 10000 },
  { key: "down", label: "Down payment", suffix: "%", step: 1 },
  { key: "rate", label: "Interest rate", suffix: "%", step: 0.125, help: "Use the rate from your lender's quote" },
  { key: "term", label: "Loan term", suffix: "years", step: 5 },
  { key: "tax", label: "Property tax rate", suffix: "%", step: 0.05, help: "Usually about 1.1% to 1.3% in San Diego County. Check the parcel's tax bill" },
  { key: "mello", label: "Mello Roos or special taxes", prefix: "$", suffix: "/yr", step: 100, help: "Common in newer communities. Zero for many older neighborhoods" },
  { key: "insurance", label: "Home insurance", prefix: "$", suffix: "/yr", step: 100, help: "Get a real quote early, especially near fire or flood zones" },
  { key: "hoa", label: "HOA dues", prefix: "$", suffix: "/mo", step: 25 },
  { key: "closing", label: "Closing costs", suffix: "% of price", step: 0.25, help: "A rough planning number for buyers" },
];

const DEFAULTS: Record<string, number> = {
  price: 1200000,
  down: 20,
  rate: 6.5,
  term: 30,
  tax: 1.2,
  mello: 0,
  insurance: 2400,
  hoa: 0,
  closing: 2,
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export default function CostCalculator() {
  const [v, setV] = useState<Record<string, number>>(DEFAULTS);
  const set = (k: string, val: string) =>
    setV({ ...v, [k]: Math.max(0, Number(val.replace(/[^0-9.]/g, "")) || 0) });

  const downAmt = (v.price * v.down) / 100;
  const loan = v.price - downAmt;
  const pi = monthlyPayment(loan, v.rate, v.term);
  const tax = (v.price * v.tax) / 100 / 12;
  const mello = v.mello / 12;
  const ins = v.insurance / 12;
  const hoa = v.hoa;
  const total = pi + tax + mello + ins + hoa;
  const cash = downAmt + (v.price * v.closing) / 100;

  const rows = [
    { label: "Mortgage (principal and interest)", value: pi },
    { label: "Property tax", value: tax },
    { label: "Mello Roos or special taxes", value: mello },
    { label: "Home insurance", value: ins },
    { label: "HOA dues", value: hoa },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block border-b border-sand pb-4">
            <span className="flex items-baseline justify-between gap-4">
              <span className="eyebrow text-navy/60">{f.label}</span>
              <span className="flex items-baseline gap-1 text-navy">
                {f.prefix && <span className="text-navy/50">{f.prefix}</span>}
                <input
                  inputMode="decimal"
                  value={f.key === "price" ? v[f.key].toLocaleString("en-US") : String(v[f.key])}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-32 border-0 bg-transparent text-right font-georgia text-[22px] text-navy focus:outline-none"
                />
                {f.suffix && <span className="text-sm text-navy/50">{f.suffix}</span>}
              </span>
            </span>
            {f.help && <span className="mt-1 block text-xs text-navy/50">{f.help}</span>}
          </label>
        ))}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="border-t-2 border-navy pt-5">
          <p className="eyebrow text-gold">Monthly cost to own</p>
          <p className="mt-2 font-georgia text-[52px] leading-none text-navy max-[600px]:text-[42px]">
            {usd(total)}
            <span className="ml-2 font-sans text-base text-navy/50">/mo</span>
          </p>
          <ul className="mt-6 flex flex-col divide-y divide-sand">
            {rows.map((r) => (
              <li key={r.label} className="flex justify-between py-3 text-sm">
                <span className="text-navy/80">{r.label}</span>
                <span className="text-navy">{usd(r.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 bg-cream-deep px-6 py-6">
          <p className="eyebrow text-gold">Cash to close</p>
          <p className="mt-2 font-georgia text-[32px] text-navy">{usd(cash)}</p>
          <p className="mt-1 text-sm text-navy/70">
            {usd(downAmt)} down plus about {usd(cash - downAmt)} in closing costs, on a{" "}
            {usd(loan)} loan.
          </p>
          {v.down < 20 && (
            <p className="mt-3 text-xs text-navy/60">
              With less than 20% down, most loans add mortgage insurance on top
              of this. Your lender can price it.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-navy/50">
          A planning estimate, not a loan quote. It leaves out maintenance,
          utilities and mortgage insurance. Your lender and title company will
          give you the real numbers.
        </p>
      </div>
    </div>
  );
}
