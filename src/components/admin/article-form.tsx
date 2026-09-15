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
            defaultValue={article?.category ?? "residential"}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="residential">Residential</option>
            <option value="national">National</option>
            <option value="market-insights">Market Insights</option>
            <option value="feature">Feature</option>
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="is_feature_story"
            defaultChecked={article?.is_feature_story}
          />
          Feature Story (navy homepage block)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="is_market_report"
            defaultChecked={article?.is_market_report}
          />
          Market Report (&quot;Market, Right Now&quot;)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={article?.featured}
          />
          Featured
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
