import type { MarketChartSettings } from "@/lib/types";

// Editorial style chart: two big numbers up top, thin lines with labels
// right on the lines, the gap between them softly shaded. Values are in
// thousands, as stored in the market_chart setting.

const W = 640;
const H = 300;
const PAD_L = 8;
const PAD_R = 120; // room for the end labels
const PAD_T = 20;
const PAD_B = 34;

function fmtK(thousands: number) {
  return thousands >= 1000
    ? `${(thousands / 1000).toFixed(2).replace(/0$/, "")}M`
    : `${Math.round(thousands)}K`;
}

export default function MarketChart({ data }: { data: MarketChartSettings }) {
  const { years, households, housing_units, source_note } = data;
  const n = years.length;
  const all = [...households, ...housing_units];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;
  const min = lo - span * 0.15;
  const max = hi + span * 0.15;

  const x = (i: number) => PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1 || 1);
  const y = (v: number) => PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B);
  const line = (vals: number[]) =>
    vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const gap =
    housing_units.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ") +
    households
      .map((_, k) => {
        const i = n - 1 - k;
        return `L${x(i).toFixed(1)},${y(households[i]).toFixed(1)}`;
      })
      .join(" ") +
    "Z";

  const hhAdded = households[n - 1] - households[0];
  const unitsAdded = housing_units[n - 1] - housing_units[0];
  const last = n - 1;

  return (
    <figure>
      <figcaption className="eyebrow text-navy/50">
        San Diego County, {years[0]} to {years[last]}
      </figcaption>

      <div className="mt-5 grid grid-cols-2 gap-6 border-b border-navy/10 pb-6">
        <div>
          <p className="font-georgia text-[44px] leading-none text-navy sm:text-[56px]">
            +{fmtK(hhAdded)}
          </p>
          <p className="mt-2 text-sm text-navy/60">new households</p>
        </div>
        <div>
          <p className="font-georgia text-[44px] leading-none text-blue sm:text-[56px]">
            +{fmtK(unitsAdded)}
          </p>
          <p className="mt-2 text-sm text-navy/60">new homes</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-6 w-full"
        role="img"
        aria-label={`Households grew by ${fmtK(hhAdded)} while housing units grew by ${fmtK(unitsAdded)} from ${years[0]} to ${years[last]}`}
      >
        <path d={gap} className="fill-blue/[0.07]" />
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={H - PAD_B}
          y2={H - PAD_B}
          className="stroke-navy/15"
          strokeWidth={1}
        />
        <path d={line(housing_units)} fill="none" className="stroke-blue" strokeWidth={1.75} />
        <path d={line(households)} fill="none" className="stroke-navy" strokeWidth={1.75} />

        <circle cx={x(last)} cy={y(housing_units[last])} r={3.5} className="fill-blue" />
        <circle cx={x(last)} cy={y(households[last])} r={3.5} className="fill-navy" />
        <text
          x={x(last) + 12}
          y={y(housing_units[last]) - 2}
          className="fill-blue text-[13px]"
        >
          Homes
        </text>
        <text
          x={x(last) + 12}
          y={y(housing_units[last]) + 14}
          className="fill-navy/50 text-[11px]"
        >
          {fmtK(housing_units[last])}
        </text>
        <text
          x={x(last) + 12}
          y={y(households[last]) - 2}
          className="fill-navy text-[13px]"
        >
          Households
        </text>
        <text
          x={x(last) + 12}
          y={y(households[last]) + 14}
          className="fill-navy/50 text-[11px]"
        >
          {fmtK(households[last])}
        </text>

        {years.map((yr, i) => (
          <text
            key={yr}
            x={x(i)}
            y={H - 10}
            textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
            className="fill-navy/40 text-[11px] tracking-[0.08em]"
          >
            {yr}
          </text>
        ))}
      </svg>

      {source_note && <p className="mt-3 text-xs text-navy/45">{source_note}</p>}
    </figure>
  );
}
