import Link from "next/link";
import Image from "next/image";

interface FeaturedArticleProps {
  article: {
    title: string;
    slug: string;
    excerpt?: string | null;
    image?: string | null;
    publishedAt: Date | string;
    category?: { name: string; slug: string; color: string };
  };
  size?: "large" | "medium";
}

function getRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} saat önce`;
  return date.toLocaleDateString("tr-TR");
}

export default function FeaturedArticle({ article, size = "large" }: FeaturedArticleProps) {
  if (size === "medium") {
    return (
      <article className="group relative overflow-hidden rounded-xl">
        <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10]">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {article.category && (
              <span
                className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-white md:text-2xl">
              {article.title}
            </h2>
            <time className="mt-2 block text-sm text-gray-300">{getRelativeTime(article.publishedAt)}</time>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-xl">
      <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/9] md:aspect-[21/9]">
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {article.category && (
            <span
              className="inline-block rounded-md px-3 py-1 text-sm font-semibold uppercase text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
          <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-base text-gray-200 md:text-lg">{article.excerpt}</p>
          )}
          <time className="mt-3 block text-sm text-gray-400">{getRelativeTime(article.publishedAt)}</time>
        </div>
      </Link>
    </article>
  );
}
