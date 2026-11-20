import { after } from "next/server";

export type LeadAlert = {
  source: "contact" | "valuation" | "quiz" | "newsletter";
  name?: string | null;
  email: string;
  phone?: string | null;
  intent?: string | null;
  context?: string | null;
  message?: string | null;
  timeline?: string | null;
};

// Sends a new lead to Mark's alert workflow (email + text) after the response
// goes out, so a slow or failed alert never blocks or breaks the form.
// Set LEAD_WEBHOOK_URL in Vercel; without it this does nothing.
export function notifyLead(lead: LeadAlert) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  after(async () => {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, site: "markscott.co", received_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // The lead is already saved in the database; the alert is best effort.
    }
  });
}
