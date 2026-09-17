import type { MarketChartSettings } from "@/lib/types";

const WIDTH = 480;
const HEIGHT = 340;
const PAD = 32;

function buildPath(values: number[], min: number, max: number) {
  const stepX = (WIDTH - PAD * 2) / (values.length - 1 || 1);
  return values
    .map((v, i) => {
      const x = PAD + i * stepX;
      const y =
        HEIGHT - PAD - ((v - min) / (max - min || 1)) * (HEIGHT - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function MarketChart({ data }: { data: MarketChartSettings }) {
  const { years, households, housing_units, source_note } = data;
  const all = [...households, ...housing_units];
  const min = Math.min(...all) * 0.97;
  const max = Math.max(...all) * 1.03;

  return (
    <div>
      <p className="eyebrow text-navy/50">
        Households vs. Housing Units
        <br />
        San Diego County
      </p>
      <div className="relative mt-4">
        <span
          className="font-[family-name:var(--font-hand)] absolute right-[8%] top-[18%] rotate-[-4deg] text-xl text-blue"
          aria-hidden
        >
          The gap is closing.
        </span>
        <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Chart comparing households and housing units over time"
      >
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={PAD}
            x2={WIDTH - PAD}
            y1={PAD + (i * (HEIGHT - PAD * 2)) / 3}
            y2={PAD + (i * (HEIGHT - PAD * 2)) / 3}
            stroke="currentColor"
            className="text-navy/10"
            strokeWidth={1}
          />
        ))}

        <path
          d={buildPath(households, min, max)}
          fill="none"
          className="text-navy"
          stroke="currentColor"
          strokeWidth={2.5}
        />
        <path
          d={buildPath(housing_units, min, max)}
          fill="none"
          className="text-gold"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeDasharray="6 4"
        />

        {years.map((year, i) => {
          const stepX = (WIDTH - PAD * 2) / (years.length - 1 || 1);
          const x = PAD + i * stepX;
          return (
            <text
              key={year}
              x={x}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-navy/50 text-[10px]"
            >
              {year}
            </text>
          );
        })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-navy" /> Households
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-0.5 w-5 bg-gold"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--gold) 0 6px, transparent 6px 10px)",
            }}
          />
          Housing Units
        </span>
      </div>
      {source_note && (
        <p className="mt-2 text-xs text-navy/50">{source_note}</p>
      )}
    </div>
  );
}
