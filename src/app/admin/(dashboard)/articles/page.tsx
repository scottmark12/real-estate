import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { deleteArticle, toggleArticleField } from "./actions";

export const revalidate = 0;

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  const articles = (data as Article[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Articles</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            All Articles
          </h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-dark"
        >
          + New Article
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-sand bg-white/70">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand text-navy/50">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Published Date</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-sand/60 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">
                  {article.title}
                </td>
                <td className="px-4 py-3 text-navy/70">{article.category}</td>
                <td className="px-4 py-3 text-navy/70">
                  {formatDate(article.published_at)}
                </td>
                <td className="px-4 py-3 text-xs text-navy/60">
                  {article.is_feature_story && <span className="mr-2 rounded-full bg-gold/30 px-2 py-0.5">Feature Story</span>}
                  {article.is_market_report && <span className="rounded-full bg-gold/30 px-2 py-0.5">Market Report</span>}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleArticleField}>
                    <input type="hidden" name="id" value={article.id} />
                    <input type="hidden" name="field" value="published" />
                    <input
                      type="hidden"
                      name="value"
                      value={(!article.published).toString()}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        article.published
                          ? "bg-navy text-cream"
                          : "bg-sand text-navy/60"
                      }`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-navy/70 hover:text-navy"
                    >
                      Edit
                    </Link>
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy/50">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
