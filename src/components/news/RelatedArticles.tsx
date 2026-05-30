import ArticleCard from "./ArticleCard";

interface RelatedArticlesProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    image?: string | null;
    publishedAt: Date | string;
    readTime: number;
    category?: { name: string; slug: string; color: string };
  }>;
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">İlgili Haberler</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </section>
  );
}
