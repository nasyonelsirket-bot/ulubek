import { PortalArticleGrid } from "@/components/news/PortalArticleCard";
import NewsSectionHead from "@/components/home/NewsSectionHead";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string | Date;
  readTime: number;
  category?: { name: string; slug: string; color: string };
}

interface CategoryBlockProps {
  name: string;
  slug: string;
  color: string;
  articles: ArticleItem[];
}

export default function CategoryBlock({ name, slug, articles }: Omit<CategoryBlockProps, "color"> & { color?: string }) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-10">
      <NewsSectionHead title={name} href={`/kategori/${slug}`} />
      <PortalArticleGrid articles={articles.slice(0, 8)} columns={4} variant="compact" priorityCount={4} />
    </section>
  );
}
