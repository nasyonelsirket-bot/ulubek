import Link from "next/link";
import PremiumArticleCard from "@/components/news/PremiumArticleCard";

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
      <div className="mb-4 flex items-center justify-between border-b-2 pb-2" style={{ borderColor: color }}>
        <h2 className="news-section-title text-xl text-foreground md:text-2xl">{name}</h2>
        <Link
          href={`/kategori/${slug}`}
          className="text-sm font-bold uppercase tracking-wide transition-colors hover:opacity-80"
          style={{ color }}
        >
          Tümü →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PremiumArticleCard article={lead} variant="featured" priority />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
          {rest.slice(0, 7).map((article) => (
            <PremiumArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
