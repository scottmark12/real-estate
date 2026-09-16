import { SingleImageUploader } from "@/components/admin/image-uploader";
import BlockEditor from "@/components/admin/block-editor";
import { btnPrimary, input, label, select, textarea } from "@/components/admin/ui";
import { upsertArticle } from "@/app/admin/(dashboard)/articles/actions";
import type { Article } from "@/lib/types";

export default function ArticleForm({ article }: { article?: Article }) {
  const publishedAtValue = article?.published_at
    ? new Date(article.published_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <form action={upsertArticle} className="flex flex-col gap-8">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Title</label>
          <input name="title" defaultValue={article?.title} required className={input} />
        </div>
        <div>
          <label className={label}>Slug (auto-generated if left blank)</label>
          <input name="slug" defaultValue={article?.slug} className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Category</label>
          <select
            name="category"
            defaultValue={article?.category ?? "southern-california"}
            className={select}
          >
            <option value="southern-california">Southern California</option>
            <option value="national">National</option>
            <option value="rates">Rates</option>
            <option value="development">Development</option>
            <option value="alternative-construction">
              Alternative Construction
            </option>
            <option value="architectural-spotlight">
              Architectural Spotlight
            </option>
          </select>
        </div>
        <div>
          <label className={label}>Published Date</label>
          <input
            type="date"
            name="published_at"
            defaultValue={publishedAtValue}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Tags (comma-separated)</label>
          <input name="tags" defaultValue={article?.tags?.join(", ") ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Read Time</label>
          <input
            name="read_time"
            placeholder="e.g. 4 min read"
            defaultValue={article?.read_time ?? ""}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Excerpt</label>
        <textarea name="excerpt" defaultValue={article?.excerpt ?? ""} rows={2} className={textarea} />
      </div>

      <div>
        <label className={label}>Content Blocks</label>
        <p className="mt-1 text-xs text-navy/50">
          Build the article out of these composable blocks. If any blocks
          are added, they replace the plain-text body below when the
          article is published.
        </p>
        <div className="mt-3">
          <BlockEditor name="blocks" initialBlocks={article?.blocks} />
        </div>
      </div>

      <div>
        <label className={label}>Body (Markdown)</label>
        <p className="mt-1 text-xs text-navy/50">
          Only used when no Content Blocks are added above.
        </p>
        <textarea
          name="body"
          defaultValue={article?.body ?? ""}
          rows={10}
          className={`${textarea} font-mono`}
        />
      </div>

      <SingleImageUploader
        name="image_url"
        label="Article Image"
        initialUrl={article?.image_url}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Image Caption</label>
          <input
            name="image_caption"
            defaultValue={article?.image_caption ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>
            Image Position (CSS object-position, e.g. &quot;50% 30%&quot;)
          </label>
          <input
            name="image_position"
            placeholder="50% 50%"
            defaultValue={article?.image_position ?? ""}
            className={input}
          />
        </div>
      </div>

      <div className="border-t border-sand pt-8">
        <p className="eyebrow text-gold">Market Research — Editorial Details</p>
        <p className="mt-2 text-xs text-navy/50">
          Optional. Only shown on the Market Research page when filled in —
          leave blank rather than inventing a number or fact.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Eyebrow (overrides category label)</label>
            <input name="eyebrow" defaultValue={article?.eyebrow ?? ""} className={input} />
          </div>
          <div>
            <label className={label}>CTA Label</label>
            <input
              name="cta_label"
              placeholder="e.g. See the Numbers →"
              defaultValue={article?.cta_label ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Stat (large number)</label>
            <input
              name="stat"
              placeholder="e.g. +24,000"
              defaultValue={article?.stat ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Secondary Stat</label>
            <input
              name="secondary_stat"
              defaultValue={article?.secondary_stat ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Metadata line</label>
            <input
              name="metadata"
              placeholder="e.g. Encinitas · 1974 · 2,140 SF"
              defaultValue={article?.metadata ?? ""}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Handwritten Annotation</label>
            <input
              name="annotation"
              placeholder="e.g. Rotates 18° to face the ocean."
              defaultValue={article?.annotation ?? ""}
              className={input}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-sand pt-8 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="featured" defaultChecked={article?.featured} />
          Featured (Market Research lead story)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="architectural_feature"
            defaultChecked={article?.architectural_feature}
          />
          Architectural Spotlight banner
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="is_market_report"
            defaultChecked={article?.is_market_report}
          />
          Market Report (homepage &quot;Market, Right Now&quot;)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article ? article.published : true}
          />
          Published
        </label>
      </div>

      <div className="border-t border-sand pt-8">
        <p className="eyebrow text-gold">Homepage (/) — Curation</p>
        <p className="mt-2 text-xs text-navy/50">
          Only one article should be marked &quot;On My Radar&quot; at a
          time — if more than one is checked, the homepage shows whichever
          comes back first.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="on_my_radar" defaultChecked={article?.on_my_radar} />
            On My Radar (homepage feature)
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              name="homepage_elsewhere"
              defaultChecked={article?.homepage_elsewhere}
            />
            Elsewhere (homepage cover line)
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            Order
            <input
              type="number"
              name="homepage_elsewhere_order"
              defaultValue={article?.homepage_elsewhere_order ?? 0}
              className="w-16 border border-navy/15 bg-white px-2 py-1 text-sm"
            />
          </label>
        </div>
      </div>

      <button type="submit" className={`self-start ${btnPrimary}`}>
        {article ? "Save Changes" : "Create Article"}
      </button>
    </form>
  );
}
