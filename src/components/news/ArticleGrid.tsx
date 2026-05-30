import ArticleCard from "./ArticleCard";
import MobileArticleCard from "./MobileArticleCard";

interface ArticleGridProps {
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
  columns?: 2 | 3 | 4;
}

export default function ArticleGrid({ articles, columns = 3 }: ArticleGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <>
      <div className="flex flex-col md:hidden">
        {articles.map((article, i) => (
          <MobileArticleCard key={article.id} article={article} priority={i < 2} />
        ))}
      </div>
      <div className={`hidden gap-6 md:grid ${gridCols[columns]}`}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
