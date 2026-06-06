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
    <aside className="lux-card flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-[var(--gold)]/30 bg-[#0a0d12] px-4 py-2.5">
        <h2 className="font-editorial text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a962]">
          {title}
        </h2>
      </div>
      <div className="flex flex-1 flex-col bg-[var(--card)]">
        {items.slice(0, 4).map((article, i) => {
          const categorySlug = article.category?.slug ?? "gundem";
          return (
            <article
              key={article.id}
              className="group flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
            >
              <Link
                href={`/haber/${article.slug}`}
                className="relative h-[68px] w-[88px] shrink-0 overflow-hidden"
              >
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  categorySlug={categorySlug}
                  priority={i === 0}
                  sizes="88px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                {article.category && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {article.category.name}
                  </span>
                )}
                <Link href={`/haber/${article.slug}`}>
                  <h3 className="font-headline line-clamp-3 text-[13px] font-semibold leading-snug text-[var(--navy)] group-hover:text-primary">
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
