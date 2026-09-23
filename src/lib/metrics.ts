import type { MetricKey } from "@/lib/types";

export const METRIC_LABELS: Record<MetricKey, string> = {
  dials: "Dial",
  conversations: "Conversation",
  offers: "Offer",
  listing_agent_calls: "Listing Agent Call",
  appointments: "Appointment",
  open_houses: "Open House",
  sphere_touches: "Sphere Touch",
  reels: "Reel",
  shop_pitches: "Shop Pitch",
  workouts: "Workout",
  protein_day: "Protein Day",
  hats_sold: "Hat Sold",
  weight_lbs: "Weight",
  pushups_max: "Max Pushups",
  pullups_max: "Max Pull-ups",
  run_5k_seconds: "5K Time",
  dollars_under_contract: "$ Under Contract",
  dollars_closed: "$ Closed",
};

// Metrics that accumulate via taps through the day/week and are what the
// scorecard's execution % is measured against (weekly_targets_numeric has
// a row per week for each of these). Checkpoint/dollar metrics below are
// point-in-time measurements, not weekly counts, so they're logged
// separately (the "Log Results" drawer) and shown as a lag panel instead.
export const TAP_METRICS: MetricKey[] = [
  "dials",
  "conversations",
  "offers",
  "listing_agent_calls",
  "appointments",
  "open_houses",
  "sphere_touches",
  "reels",
  "shop_pitches",
  "workouts",
  "hats_sold",
];

export const CHECKPOINT_METRICS: MetricKey[] = ["weight_lbs", "pushups_max", "pullups_max", "run_5k_seconds"];
export const DOLLAR_METRICS: MetricKey[] = ["dollars_under_contract", "dollars_closed"];

export function formatMetricValue(metric: MetricKey, value: number): string {
  if (metric === "run_5k_seconds") {
    const m = Math.floor(value / 60);
    const s = Math.round(value % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  if (metric === "dollars_under_contract" || metric === "dollars_closed") {
    return `$${value.toLocaleString()}`;
  }
  if (metric === "weight_lbs") return `${value} lbs`;
  return String(value);
}

function blockShortName(label: string) {
  return label.split(":")[0].trim().toLowerCase();
}

// Which tap counters show up under a given schedule block, inferred from
// its label — schedule_blocks has no block-type column (and we're not
// adding one without asking), so this matches on keywords in the name
// against the real block labels already in the table.
export function metricsForBlock(label: string): MetricKey[] {
  const name = blockShortName(label);
  if (name.includes("build the pipeline")) return ["dials", "conversations", "appointments"];
  if (name.includes("mls scan")) return ["offers", "listing_agent_calls"];
  if (name.includes("work the pipeline")) return ["sphere_touches"];
  if (name.includes("awl")) return ["reels", "shop_pitches", "hats_sold"];
  if (["upper body", "lower body", "interval run", "easy 5k", "dawn patrol surf"].some((k) => name.includes(k)))
    return ["workouts"];
  return [];
}
