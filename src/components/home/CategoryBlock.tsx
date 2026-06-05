import Link from "next/link";
import { PortalArticleGrid } from "@/components/news/PortalArticleCard";

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

export default function CategoryBlock({ name, slug, color, articles }: CategoryBlockProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between border-b-2 pb-2" style={{ borderColor: color }}>
        <h2 className="font-headline text-lg font-bold text-[var(--navy)]">{name}</h2>
        <Link href={`/kategori/${slug}`} className="text-xs font-bold uppercase hover:underline" style={{ color }}>
          Tümünü Gör →
        </Link>
      </div>
      <PortalArticleGrid articles={articles.slice(0, 8)} columns={4} variant="compact" priorityCount={4} />
    </section>
  );
}
