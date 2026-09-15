import ArticleForm from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <p className="eyebrow text-gold">Articles</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
        New Article
      </h1>
      <div className="mt-8">
        <ArticleForm />
      </div>
    </div>
  );
}
