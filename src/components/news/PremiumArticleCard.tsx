import Link from "next/link";
import Image from "next/image";
import RelativeTime from "@/components/ui/RelativeTime";

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
  variant?: "default" | "featured" | "horizontal";
  priority?: boolean;
}

export default function PremiumArticleCard({
  article,
  variant = "default",
  priority = false,
}: PremiumArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 rounded-xl bg-card p-2 ring-1 ring-border transition-shadow hover:shadow-md">
        <Link href={`/haber/${article.slug}`} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="112px"
            />
          )}
        </Link>
        <div className="min-w-0 flex-1 py-1">
          <Link href={`/haber/${article.slug}`}>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{article.excerpt}</p>
          )}
          <RelativeTime date={article.publishedAt} className="mt-1 block text-[11px] text-muted-foreground" />
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border">
        <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
          {article.image && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
          {article.category && (
            <span
              className="absolute left-4 top-4 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
        </Link>
        <div className="p-5 md:p-6">
          <Link href={`/haber/${article.slug}`}>
            <h3 className="text-xl font-black leading-tight text-foreground group-hover:text-primary md:text-2xl">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <RelativeTime date={article.publishedAt} />
            <span>·</span>
            <span>{article.readTime} dk okuma</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition-shadow hover:shadow-lg">
      <Link href={`/haber/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        {article.category && (
          <span
            className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <RelativeTime date={article.publishedAt} />
          <span>{article.readTime} dk</span>
        </div>
      </div>
    </article>
  );
}
