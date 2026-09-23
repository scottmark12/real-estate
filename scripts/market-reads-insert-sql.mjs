// Fetches today's candidate articles and prints a ready-to-run SQL
// statement that inserts them all as kept=false (the default "seen but
// not yet graded" state) and RETURNS the ones that were genuinely new
// (ON CONFLICT (url) DO NOTHING means already-seen rows are silently
// skipped and never appear in the RETURNING set).
//
// This exists so the scheduled market-reads-sweep task doesn't have to
// hand-compose SQL for ~200 rows itself: run this script, take its
// stdout as-is into one execute_sql call, and the result of that call
// IS the exact candidate list to grade — no separate "check what's
// already in the table" step needed.
//
// Usage: node scripts/market-reads-insert-sql.mjs

import { fetchMarketReads } from "../src/lib/rss.ts";

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const reads = await fetchMarketReads();

if (reads.length === 0) {
  console.log("-- no candidates fetched");
  process.exit(0);
}

const values = reads
  .map(
    (r) =>
      `(${sqlString(r.title)}, ${sqlString(r.url)}, ${sqlString(r.source)}, ${sqlString(r.summary)}, ${sqlString(r.theme)}, ${sqlString(r.published_at)}, false)`
  )
  .join(",\n  ");

console.log(
  `insert into market_reads (title, url, source, summary, theme, published_at, kept)\nvalues\n  ${values}\non conflict (url) do nothing\nreturning url, title, source, summary, theme;`
);
