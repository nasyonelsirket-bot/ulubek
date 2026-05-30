import Link from "next/link";
import RelativeTime from "@/components/ui/RelativeTime";
import ArticleImage from "@/components/news/ArticleImage";

interface CategoryInfo {
  name: string;
  slug: string;
  color: string;
}

interface PremiumArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    image?: string | null;
    publishedAt: string | Date;
    readTime: number;
    category?: CategoryInfo;
  };
  variant?: "default" | "featured" | "horizontal" | "compact";
  priority?: boolean;
}

export default function PremiumArticleCard({
  article,
  variant = "default",
  priority = false,
}: PremiumArticleCardProps) {
  const categorySlug = article.category?.slug ?? "gundem";

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-3 rounded-lg border border-border bg-card p-2 transition-shadow hover:shadow-md">
        <Link href={`/haber/${article.slug}`} className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            sizes="144px"
          />
        </Link>
        <div className="min-w-0 flex-1 py-0.5">
          <Link href={`/haber/${article.slug}`}>
            <h3 className="font-headline line-clamp-3 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </h3>
          </Link>
          <RelativeTime date={article.publishedAt} className="mt-1.5 block text-[11px] text-muted-foreground" />
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
          <ArticleImage src={article.image} alt={article.title} categorySlug={categorySlug} sizes="25vw" />
        </Link>
        <div className="p-3">
          <Link href={`/haber/${article.slug}`}>
            <h3 className="font-headline line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </h3>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-md">
        <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden">
          <ArticleImage
            src={article.image}
            alt={article.title}
            categorySlug={categorySlug}
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          {article.category && (
            <span
              className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
        </Link>
        <div className="p-4 md:p-5">
          <Link href={`/haber/${article.slug}`}>
            <h3 className="font-headline text-xl font-black leading-tight text-foreground group-hover:text-primary md:text-2xl lg:text-3xl">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <RelativeTime date={article.publishedAt} />
            <span>·</span>
            <span>{article.readTime} dk</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <ArticleImage
          src={article.image}
          alt={article.title}
          categorySlug={categorySlug}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {article.category && (
          <span
            className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
      </Link>
      <div className="p-3.5">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="font-headline line-clamp-3 text-base font-bold leading-snug text-foreground group-hover:text-primary md:text-lg">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <RelativeTime date={article.publishedAt} />
          <span>{article.readTime} dk</span>
        </div>
      </div>
    </article>
  );
}
