import { createClient } from "@supabase/supabase-js";
import { alertEmailHtml, alertSubject, buyUrl, cleanParams, describeParams } from "@/lib/listing-alerts";
import { type FeedListing, searchListings } from "@/lib/premier-feed";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Zapier's email step allows about 10 sends an hour, so each run sends at
// most this many; anyone left over is picked up on the next run.
const MAX_SENDS = 10;
const SEEN_CAP = 500;

type Row = {
  id: string;
  email: string;
  name: string | null;
  label: string | null;
  params: unknown;
  seen_ids: string[];
  unsubscribe_token: string;
  sent_count: number | null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const hook = process.env.ALERT_WEBHOOK_URL;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dry") === "1";

  // Anon key on purpose: the alerts_* functions check the secret themselves.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase.rpc("alerts_due", { p_secret: secret });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = (data as Row[]) ?? [];
  let sent = 0;
  const report: { id: string; fresh: number; sent: boolean }[] = [];

  for (const row of rows) {
    const params = cleanParams(row.params);
    const result = await searchListings({ ...params, sort: "recent", limit: 48 });
    if (!result) continue; // feed down; try again tomorrow
    const seen = new Set(row.seen_ids ?? []);
    const fresh: FeedListing[] = result.listings.filter((l) => !seen.has(l.id));
    const nextSeen = [...result.listings.map((l) => l.id), ...(row.seen_ids ?? [])];
    const capped = [...new Set(nextSeen)].slice(0, SEEN_CAP);

    if (fresh.length === 0) {
      if (!dryRun) {
        await supabase.rpc("alerts_mark", { p_secret: secret, p_id: row.id, p_seen: capped, p_sent: false });
      }
      report.push({ id: row.id, fresh: 0, sent: false });
      continue;
    }
    if (sent >= MAX_SENDS || !hook) {
      report.push({ id: row.id, fresh: fresh.length, sent: false });
      continue; // leave it unmarked so it goes out next run
    }

    const label = row.label || describeParams(params);
    const html = alertEmailHtml({
      name: row.name,
      label,
      listings: fresh,
      seeAllUrl: buyUrl(params),
      unsubscribeUrl: `${SITE_URL}/alerts/unsubscribe?token=${row.unsubscribe_token}`,
      rotation: { key: row.email, sent: row.sent_count ?? 0 },
    });
    const subject = alertSubject(fresh);

    if (dryRun) {
      report.push({ id: row.id, fresh: fresh.length, sent: false });
      continue;
    }
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: row.email, subject, html }),
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);
    if (res?.ok) {
      sent += 1;
      await supabase.rpc("alerts_mark", { p_secret: secret, p_id: row.id, p_seen: capped, p_sent: true });
      report.push({ id: row.id, fresh: fresh.length, sent: true });
    } else {
      report.push({ id: row.id, fresh: fresh.length, sent: false });
    }
  }

  return Response.json({ searches: rows.length, sent, report });
}
