// The daily market-reads sweep's two-step helper.
//
// Step 1, `node scripts/market-reads-insert-sql.mjs`, fetches today's
// candidates, leaves out any it has shown before, and prints a short
// numbered list to grade on headline and source alone:
//   12 | alt_construction | KSBY News | 86 modular townhomes under construction in Lompoc
//
// Step 2, `node scripts/market-reads-insert-sql.mjs --keep 3,7,12:alt_construction`,
// prints one INSERT adding just those candidates as kept rows (a
// `:theme` suffix overrides the candidate's theme). Rejected candidates
// never go into the table; nothing on the brief needs them.
//
// "Shown before" is tracked in scripts/.market-reads-seen.json (URLs and
// normalized headlines, kept 14 days), because the script can't query the
// table itself: row-level security blocks the anon key. The headline check
// matters because a story can arrive as an unresolved news.google.com
// link one day and under its real URL the next. Pass --all to step 1 to
// ignore the list for one run. Step 1 saves its numbered list to
// scripts/.market-reads-candidates.json for step 2 to read.

import fs from "node:fs";
import { fetchMarketReads } from "../src/lib/rss.ts";

const SEEN_PATH = new URL("./.market-reads-seen.json", import.meta.url);
const CANDIDATES_PATH = new URL("./.market-reads-candidates.json", import.meta.url);
const SEEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function loadSeen() {
  try {
    const seen = JSON.parse(fs.readFileSync(SEEN_PATH, "utf8"));
    const cutoff = Date.now() - SEEN_TTL_MS;
    return Object.fromEntries(Object.entries(seen).filter(([, at]) => new Date(at).getTime() > cutoff));
  } catch {
    return {};
  }
}

const normalizeTitle = (title) => title.toLowerCase().replace(/[^a-z0-9]/g, "");

const keepIndex = process.argv.indexOf("--keep");

if (keepIndex === -1) {
  const seen = loadSeen();
  const useSeen = !process.argv.includes("--all");
  const reads = (await fetchMarketReads()).filter(
    (r) => !useSeen || !(seen[`url:${r.url}`] || seen[`title:${normalizeTitle(r.title)}`])
  );

  const now = new Date().toISOString();
  for (const r of reads) {
    seen[`url:${r.url}`] = now;
    seen[`title:${normalizeTitle(r.title)}`] = now;
  }
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen));
  fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(reads));

  if (reads.length === 0) {
    console.log("-- no new candidates");
  } else {
    reads.forEach((r, i) => console.log(`${i + 1} | ${r.theme} | ${r.source} | ${r.title}`));
  }
} else {
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf8"));
  const picks = (process.argv[keepIndex + 1] ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [n, theme] = p.split(":");
      const read = candidates[Number(n) - 1];
      if (!read) throw new Error(`No candidate #${n}`);
      return { ...read, theme: theme || read.theme };
    });

  if (picks.length === 0) {
    console.log("-- nothing to keep");
    process.exit(0);
  }

  const values = picks
    .map((r) => `(${sqlString(r.title)},${sqlString(r.url)},${sqlString(r.source)},${sqlString(r.theme)},${sqlString(r.published_at)})`)
    .join(",\n");
  const normalize = (col) => `regexp_replace(lower(${col}), '[^a-z0-9]', '', 'g')`;

  // Promote a row that's already there (e.g. from the site's Refresh
  // button) rather than skipping it.
  console.log(
    `insert into market_reads (title, url, source, theme, published_at, kept)
select t, u, s, th, p::timestamptz, true from (values
${values}
) v(t, u, s, th, p)
where not exists (select 1 from market_reads m where m.kept and ${normalize("m.title")} = ${normalize("v.t")})
on conflict (url) do update set kept = true, theme = excluded.theme
returning title, theme;`
  );
}
