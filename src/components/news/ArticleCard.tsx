import Link from "next/link";
import Image from "next/image";
import RelativeTime from "@/components/ui/RelativeTime";

interface CategoryInfo {
  name: string;
  slug: string;
  color: string;
}

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    image?: string | null;
    publishedAt: Date | string;
    readTime: number;
    category?: CategoryInfo;
  };
  variant?: "default" | "horizontal" | "compact";
}

function CategoryBadgeInline({ category }: { category: CategoryInfo }) {
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-80"
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </Link>
  );
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 border-b border-gray-100 py-4 last:border-0">
        <Link href={`/haber/${article.slug}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="128px"
            />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {article.category && <CategoryBadgeInline category={article.category} />}
          <Link href={`/haber/${article.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
              {article.title}
            </h3>
          </Link>
          <RelativeTime date={article.publishedAt} className="mt-1 text-xs text-gray-500" />
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group border-b border-gray-100 py-3 last:border-0">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
            {article.title}
          </h3>
        </Link>
        <RelativeTime date={article.publishedAt} className="mt-1 block text-xs text-gray-500" />
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {article.category && (
          <div className="absolute left-3 top-3">
            <CategoryBadgeInline category={article.category} />
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <RelativeTime date={article.publishedAt} />
          <span>{article.readTime} dk okuma</span>
        </div>
      </div>
    </article>
  );
}
