"use client";

import Link from "next/link";
import RelativeTime from "@/components/ui/RelativeTime";
import ArticleImage from "@/components/news/ArticleImage";
import { formatViewCount, estimateViewCount } from "@/lib/utils/view-count";
import { cn } from "@/lib/utils";

interface CategoryInfo {
  name: string;
  slug: string;
  color: string;
}

export interface MobileArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string | Date;
  readTime: number;
  category?: CategoryInfo;
  viewCount?: number;
}

interface MobileArticleCardProps {
  article: MobileArticleItem;
  priority?: boolean;
  aspect?: "16/9" | "4/3";
  overlayTitle?: boolean;
  className?: string;
}

export default function MobileArticleCard({
  article,
  priority = false,
  aspect = "16/9",
  overlayTitle = false,
  className,
}: MobileArticleCardProps) {
  const categorySlug = article.category?.slug ?? "gundem";
  const views = article.viewCount ?? estimateViewCount(article.id, article.publishedAt);
  const aspectClass = aspect === "4/3" ? "aspect-[4/3]" : "aspect-video";

  if (overlayTitle) {
    return (
      <article className={cn("group relative overflow-hidden rounded-none md:rounded-xl", className)}>
        <Link href={`/haber/${article.slug}`} className={cn("relative block w-full", aspectClass, "min-h-[220px] sm:min-h-[280px]")}>
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            priority={priority}
            sizes="100vw"
            className="group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {article.category && (
              <span
                className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <h3 className="font-headline line-clamp-3 text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
              {article.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/75">
              <RelativeTime date={article.publishedAt} />
              <span>·</span>
              <span>{formatViewCount(views)} okunma</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-none border-b border-border bg-white md:rounded-xl md:border md:shadow-sm md:transition-shadow md:hover:shadow-lg",
        className
      )}
    >
      <Link href={`/haber/${article.slug}`} className={cn("relative block w-full overflow-hidden", aspectClass)}>
        <ArticleImage
          src={article.image}
          alt={article.title}
          categorySlug={categorySlug}
          priority={priority}
          sizes="100vw"
          className="group-hover:scale-[1.03]"
        />
        {article.category && (
          <span
            className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
      </Link>
      <div className="px-4 py-3 md:p-4">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="font-headline line-clamp-3 text-lg font-black leading-snug text-[var(--navy)] group-hover:text-primary sm:text-xl">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <RelativeTime date={article.publishedAt} />
          <span aria-hidden>·</span>
          <span>{formatViewCount(views)} okunma</span>
          <span aria-hidden>·</span>
          <span>{article.readTime} dk</span>
        </div>
      </div>
    </article>
  );
}
