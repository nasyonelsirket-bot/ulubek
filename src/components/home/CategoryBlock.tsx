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
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between border-b-2 pb-2" style={{ borderColor: color }}>
        <h2 className="text-xl font-black uppercase tracking-wide text-foreground md:text-2xl">{name}</h2>
        <Link
          href={`/kategori/${slug}`}
          className="text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color }}
        >
          Tümünü Gör →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PremiumArticleCard article={lead} variant="featured" priority />
        </div>
        <div className="flex flex-col gap-4">
          {rest.slice(0, 3).map((article) => (
            <PremiumArticleCard key={article.id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
}
