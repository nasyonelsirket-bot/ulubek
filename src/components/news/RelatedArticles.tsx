import MobileArticleCard from "./MobileArticleCard";

interface RelatedArticlesProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    image?: string | null;
    publishedAt: Date | string;
    readTime: number;
    category?: { name: string; slug: string; color: string };
  }>;
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-headline mb-4 text-xl font-black text-[var(--navy)] md:mb-6 md:text-2xl">İlgili Haberler</h2>
      <div className="flex flex-col gap-0 md:grid md:grid-cols-2 md:gap-4">
        {articles.map((article, i) => (
          <MobileArticleCard key={article.id} article={article} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
