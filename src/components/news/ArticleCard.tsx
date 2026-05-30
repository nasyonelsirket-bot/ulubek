import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { getCategoryById } from "@/lib/data/categories";
import { getRelativeTime } from "@/lib/utils/date";
import CategoryBadge from "./CategoryBadge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "horizontal" | "compact";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const category = getCategoryById(article.categoryId);

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 border-b border-gray-100 py-4 last:border-0">
        <Link href={`/haber/${article.slug}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="128px"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {category && <CategoryBadge category={category} />}
          <Link href={`/haber/${article.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
              {article.title}
            </h3>
          </Link>
          <time className="mt-1 text-xs text-gray-500">{getRelativeTime(article.publishedAt)}</time>
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
        <time className="mt-1 block text-xs text-gray-500">{getRelativeTime(article.publishedAt)}</time>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {category && (
          <div className="absolute left-3 top-3">
            <CategoryBadge category={category} />
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{article.excerpt}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <time>{getRelativeTime(article.publishedAt)}</time>
          <span>{article.readTime} dk okuma</span>
        </div>
      </div>
    </article>
  );
}
