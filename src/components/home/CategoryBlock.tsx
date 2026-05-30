import Link from "next/link";
import PortalArticleCard, { PortalArticleGrid } from "@/components/news/PortalArticleCard";

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

  const [lead, ...rest] = articles;

  return (
    <section className="mb-8">
      <div className="portal-section-head mb-4 flex items-center justify-between" style={{ borderColor: color }}>
        <h2 className="font-headline text-lg font-bold text-[var(--navy)]">{name}</h2>
        <Link href={`/kategori/${slug}`} className="text-xs font-bold uppercase hover:underline" style={{ color }}>
          Tümü →
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PortalArticleCard article={lead} priority />
        </div>
        <div className="lg:col-span-7">
          <PortalArticleGrid articles={rest.slice(0, 4)} columns={2} variant="compact" />
        </div>
      </div>

      <PortalArticleGrid articles={rest.slice(4, 12)} columns="auto" />
    </section>
  );
}
