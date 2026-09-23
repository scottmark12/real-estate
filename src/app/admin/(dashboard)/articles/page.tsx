import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { btnPrimary, btnSecondary, tag } from "@/components/admin/ui";
import { deleteArticle, toggleArticleField } from "./actions";
import { DeleteButton } from "@/components/admin/delete-button";

export const revalidate = 0;

// `,` `(` `)` are syntactically significant in a PostgREST .or() filter
// string — strip them so a search term can't break out of the filter.
function sanitizeSearch(q: string) {
  return q.replace(/[,()]/g, " ").trim();
}

export default async function AdminArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const supabase = await createClient();
  let query = supabase.from("articles").select("*").order("published_at", { ascending: false });
  const cleanQ = sanitizeSearch(q);
  if (cleanQ) query = query.ilike("title", `%${cleanQ}%`);
  const { data } = await query;

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
        <Link href="/admin/articles/new" className={btnPrimary}>
          + New Article
        </Link>
      </div>

      <form method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by title…"
          className="w-full max-w-xs border border-navy/15 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/30 focus:border-navy focus:outline-none"
        />
        <button type="submit" className={btnSecondary}>
          Search
        </button>
        {q && (
          <Link href="/admin/articles" className="self-center text-xs text-navy/40 underline decoration-gold decoration-2 underline-offset-4">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto border-t border-sand">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand text-navy/40">
            <tr>
              <th className="eyebrow px-4 py-3 font-medium">Title</th>
              <th className="eyebrow px-4 py-3 font-medium">Category</th>
              <th className="eyebrow px-4 py-3 font-medium">Published Date</th>
              <th className="eyebrow px-4 py-3 font-medium">Flags</th>
              <th className="eyebrow px-4 py-3 font-medium">Published</th>
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
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-navy/60">
                    {article.is_feature_story && (
                      <span className={`${tag} border-gold/50 text-gold`}>
                        Feature Story
                      </span>
                    )}
                    {article.is_market_report && (
                      <span className={`${tag} border-gold/50 text-gold`}>
                        Market Report
                      </span>
                    )}
                  </div>
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
                      className={`${tag} ${
                        article.published
                          ? "border-navy bg-navy text-cream"
                          : "border-navy/20 text-navy/50"
                      }`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-navy/70 underline decoration-gold decoration-2 underline-offset-4 hover:text-navy"
                    >
                      Edit
                    </Link>
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <DeleteButton
                        confirmMessage={`Delete "${article.title}"? This can't be undone.`}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </DeleteButton>
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
