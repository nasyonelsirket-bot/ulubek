import Link from "next/link";
import ArticleImage from "@/components/news/ArticleImage";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface HeroSidebarListProps {
  items: PortalArticleItem[];
  title?: string;
}

export default function HeroSidebarList({ items, title = "Gündem" }: HeroSidebarListProps) {
  if (items.length === 0) return null;

  return (
    <aside className="flex h-full flex-col border border-border bg-white">
      <div className="border-b-2 border-primary bg-white px-3 py-2">
        <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-[var(--navy)]">{title}</h2>
      </div>
      <div className="flex flex-1 flex-col">
        {items.slice(0, 4).map((article, i) => {
          const categorySlug = article.category?.slug ?? "gundem";
          return (
            <article
              key={article.id}
              className="group flex gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0"
            >
              <Link
                href={`/haber/${article.slug}`}
                className="relative h-[72px] w-[96px] shrink-0 overflow-hidden bg-muted"
              >
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  categorySlug={categorySlug}
                  priority={i === 0}
                  sizes="96px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                {article.category && (
                  <span className="text-[9px] font-bold uppercase text-primary">{article.category.name}</span>
                )}
                <Link href={`/haber/${article.slug}`}>
                  <h3 className="font-headline line-clamp-3 text-[13px] font-bold leading-snug text-[var(--navy)] group-hover:text-primary">
                    {article.title}
                  </h3>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
