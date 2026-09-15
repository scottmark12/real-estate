import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/article-form";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const revalidate = 0;

export default async function EditArticlePage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const article = data as Article | null;
  if (!article) notFound();

  return (
    <div>
      <p className="eyebrow text-gold">Articles</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        Edit Article
      </h1>
      <div className="mt-8">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
