"use client";

import { useMemo, useState } from "react";
import { btnPrimary, input, label } from "@/components/admin/ui";
import {
  type LetterStat,
  type LetterStory,
  marketLetterHtml,
} from "@/lib/market-letter-email";

const thisMonth = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

/**
 * Fill in the month's letter, see it exactly as subscribers will, then copy
 * the HTML into the sending tool (Beehiiv, Outlook, etc.).
 */
export default function MarketLetterBuilder({ stories }: { stories: LetterStory[] }) {
  const [issue, setIssue] = useState(thisMonth);
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [stats, setStats] = useState<LetterStat[]>([
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ]);
  const [statsSource, setStatsSource] = useState("");
  const [picked, setPicked] = useState<string[]>(stories.slice(0, 3).map((s) => s.url));
  const [note, setNote] = useState(
    "Thinking about a move, or just curious what your place is worth now? Reply to this email. It comes straight to me.",
  );
  const [copied, setCopied] = useState(false);

  const html = useMemo(
    () =>
      marketLetterHtml({
        issue,
        headline: headline || "Your headline goes here",
        intro: intro || "Write two or three short paragraphs on what moved the San Diego market this month and what it means for buyers and sellers.",
        stats: stats.filter((s) => s.value.trim() && s.label.trim()),
        statsSource: statsSource.trim() || undefined,
        stories: picked
          .map((u) => stories.find((s) => s.url === u))
          .filter((s): s is LetterStory => Boolean(s)),
        note,
      }),
    [issue, headline, intro, stats, statsSource, picked, note, stories],
  );

  const toggle = (url: string) =>
    setPicked((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]));

  async function copy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `market-letter-${issue.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_640px]">
      <div className="space-y-6">
        <div>
          <label className={label}>Issue</label>
          <input className={input} value={issue} onChange={(e) => setIssue(e.target.value)} />
        </div>
        <div>
          <label className={label}>Headline</label>
          <input
            className={input}
            value={headline}
            placeholder="Rates dipped. Inventory didn't."
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Your intro (blank line = new paragraph)</label>
          <textarea className={`${input} min-h-[180px]`} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </div>

        <div>
          <p className={label}>Numbers of the month (optional, real figures only)</p>
          <div className="mt-2 space-y-2">
            {stats.map((s, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                <input
                  className={input}
                  placeholder="6.1%"
                  value={s.value}
                  onChange={(e) =>
                    setStats((all) => all.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                  }
                />
                <input
                  className={input}
                  placeholder="30 year mortgage rate"
                  value={s.label}
                  onChange={(e) =>
                    setStats((all) => all.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                />
              </div>
            ))}
            <input
              className={input}
              placeholder="Source: Freddie Mac, SDAR (shown under the numbers)"
              value={statsSource}
              onChange={(e) => setStatsSource(e.target.value)}
            />
          </div>
        </div>

        <div>
          <p className={label}>Research to feature (first checked is the big one)</p>
          <div className="mt-2 space-y-1">
            {stories.map((s) => (
              <label key={s.url} className="flex items-start gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={picked.includes(s.url)}
                  onChange={() => toggle(s.url)}
                />
                <span>
                  {picked.includes(s.url) && (
                    <span className="mr-1 text-xs text-navy/50">#{picked.indexOf(s.url) + 1}</span>
                  )}
                  {s.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Closing note from you</label>
          <textarea className={`${input} min-h-[90px]`} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copy} className={btnPrimary}>
            {copied ? "Copied" : "Copy email HTML"}
          </button>
          <button
            type="button"
            onClick={download}
            className="border border-navy/30 px-4 py-2 text-sm font-semibold text-navy"
          >
            Download .html
          </button>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <p className={label}>Preview</p>
        <iframe
          title="Market Letter preview"
          srcDoc={html}
          className="mt-2 h-[80vh] w-full border border-navy/15 bg-white"
        />
      </div>
    </div>
  );
}
