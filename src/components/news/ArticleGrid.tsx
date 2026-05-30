import { PortalArticleGrid } from "@/components/news/PortalArticleCard";

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
  const colMap = { 2: 2 as const, 3: 3 as const, 4: 4 as const };
  return (
    <PortalArticleGrid
      articles={articles}
      columns={colMap[columns]}
      priorityCount={4}
    />
  );
}
