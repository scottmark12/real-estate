import { SingleImageUploader } from "@/components/admin/image-uploader";
import { upsertArticle } from "@/app/admin/(dashboard)/articles/actions";
import type { Article } from "@/lib/types";

export default function ArticleForm({ article }: { article?: Article }) {
  const publishedAtValue = article?.published_at
    ? new Date(article.published_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <form action={upsertArticle} className="flex flex-col gap-6">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">Title</label>
          <input
            name="title"
            defaultValue={article?.title}
            required
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">
            Slug (auto-generated if left blank)
          </label>
          <input
            name="slug"
            defaultValue={article?.slug}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">Category</label>
          <select
            name="category"
            defaultValue={article?.category ?? "southern-california"}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
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
          <label className="text-sm font-medium text-navy">
            Published Date
          </label>
          <input
            type="date"
            name="published_at"
            defaultValue={publishedAtValue}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">
            Tags (comma-separated)
          </label>
          <input
            name="tags"
            defaultValue={article?.tags?.join(", ") ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Read Time</label>
          <input
            name="read_time"
            placeholder="e.g. 4 min read"
            defaultValue={article?.read_time ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-navy">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={article?.excerpt ?? ""}
          rows={2}
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-navy">
          Body (Markdown)
        </label>
        <textarea
          name="body"
          defaultValue={article?.body ?? ""}
          rows={14}
          className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 font-mono text-sm"
        />
      </div>

      <SingleImageUploader
        name="image_url"
        label="Article Image"
        initialUrl={article?.image_url}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-navy">
            Image Caption
          </label>
          <input
            name="image_caption"
            defaultValue={article?.image_caption ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">
            Image Position (CSS object-position, e.g. &quot;50% 30%&quot;)
          </label>
          <input
            name="image_position"
            placeholder="50% 50%"
            defaultValue={article?.image_position ?? ""}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border border-sand bg-cream-deep/50 p-4">
        <p className="text-sm font-semibold text-navy">
          Market Research — Editorial Details
        </p>
        <p className="mt-1 text-xs text-navy/60">
          Optional. Only shown on the Market Research page when filled in —
          leave blank rather than inventing a number or fact.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-navy">
              Eyebrow (overrides category label)
            </label>
            <input
              name="eyebrow"
              defaultValue={article?.eyebrow ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">
              CTA Label
            </label>
            <input
              name="cta_label"
              placeholder="e.g. See the Numbers →"
              defaultValue={article?.cta_label ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">
              Stat (large number)
            </label>
            <input
              name="stat"
              placeholder="e.g. +24,000"
              defaultValue={article?.stat ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">
              Secondary Stat
            </label>
            <input
              name="secondary_stat"
              defaultValue={article?.secondary_stat ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">
              Metadata line
            </label>
            <input
              name="metadata"
              placeholder="e.g. Encinitas · 1974 · 2,140 SF"
              defaultValue={article?.metadata ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">
              Handwritten Annotation
            </label>
            <input
              name="annotation"
              placeholder="e.g. Rotates 18° to face the ocean."
              defaultValue={article?.annotation ?? ""}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={article?.featured}
          />
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

      <button
        type="submit"
        className="self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-dark"
      >
        {article ? "Save Changes" : "Create Article"}
      </button>
    </form>
  );
}
