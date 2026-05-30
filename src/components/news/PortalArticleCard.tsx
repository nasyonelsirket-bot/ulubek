import Link from "next/link";
import RelativeTime from "@/components/ui/RelativeTime";
import ArticleImage from "@/components/news/ArticleImage";
import { cn } from "@/lib/utils";

export interface PortalArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string | Date;
  category?: { name: string; slug: string; color: string };
}

interface PortalArticleCardProps {
  article: PortalArticleItem;
  variant?: "default" | "compact" | "horizontal";
  priority?: boolean;
  className?: string;
}

export default function PortalArticleCard({
  article,
  variant = "default",
  priority = false,
  className,
}: PortalArticleCardProps) {
  const categorySlug = article.category?.slug ?? "gundem";
  const aspect = variant === "compact" ? "aspect-[4/3]" : "aspect-video";

  if (variant === "horizontal") {
    return (
      <article
        className={cn(
          "group flex gap-3 border-b border-border py-3 transition-colors hover:bg-secondary/40",
          className
        )}
      >
        <Link href={`/haber/${article.slug}`} className={cn("relative w-28 shrink-0 overflow-hidden rounded-md", aspect)}>
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            priority={priority}
            sizes="112px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          {article.category && (
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: article.category.color }}>
              {article.category.name}
            </span>
          )}
          <Link href={`/haber/${article.slug}`}>
            <h3 className="font-headline line-clamp-3 text-sm font-bold leading-snug text-[var(--navy)] group-hover:text-primary">
              {article.title}
            </h3>
          </Link>
          <RelativeTime date={article.publishedAt} className="mt-1 text-[11px] text-muted-foreground" />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "portal-card group overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md",
        className
      )}
    >
      <Link href={`/haber/${article.slug}`} className={cn("relative block w-full overflow-hidden", aspect)}>
        <ArticleImage
          src={article.image}
          alt={article.title}
          categorySlug={categorySlug}
          priority={priority}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
      </Link>
      <div className="p-3">
        {article.category && (
          <span
            className="mb-1.5 inline-block text-[10px] font-bold uppercase tracking-wider"
            style={{ color: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
        <Link href={`/haber/${article.slug}`}>
          <h3 className="font-headline line-clamp-3 text-[15px] font-bold leading-snug text-[var(--navy)] group-hover:text-primary md:text-base">
            {article.title}
          </h3>
        </Link>
        {variant === "default" && article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {article.excerpt}
          </p>
        )}
        <RelativeTime date={article.publishedAt} className="mt-2 block text-[11px] text-muted-foreground" />
      </div>
    </article>
  );
}

interface PortalArticleGridProps {
  articles: PortalArticleItem[];
  columns?: "auto" | 2 | 3 | 4;
  variant?: "default" | "compact";
  priorityCount?: number;
}

export function PortalArticleGrid({
  articles,
  columns = "auto",
  variant = "default",
  priorityCount = 2,
}: PortalArticleGridProps) {
  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === 4
          ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={cn("grid gap-3 md:gap-4", gridClass)}>
      {articles.map((article, i) => (
        <PortalArticleCard
          key={article.id}
          article={article}
          variant={variant}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
