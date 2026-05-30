import Link from "next/link";
import PremiumArticleCard from "@/components/news/PremiumArticleCard";
import MobileArticleCard from "@/components/news/MobileArticleCard";

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
    <section className="mb-2 md:mb-8">
      <div
        className="mb-0 flex items-center justify-between border-b-2 px-4 pb-3 pt-4 md:mb-4 md:px-0 md:pb-2 md:pt-0"
        style={{ borderColor: color }}
      >
        <h2 className="news-section-title text-lg text-foreground md:text-2xl">{name}</h2>
        <Link
          href={`/kategori/${slug}`}
          className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-80 md:text-sm"
          style={{ color }}
        >
          Tümü →
        </Link>
      </div>

      <div className="flex flex-col md:hidden">
        {articles.slice(0, 6).map((article, i) => (
          <MobileArticleCard key={article.id} article={article} priority={i === 0} />
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-4 lg:grid-cols-12">
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
