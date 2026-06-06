"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import ArticleImage from "@/components/news/ArticleImage";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";

interface TrendStripProps {
  articles: PortalArticleItem[];
}

export default function TrendStrip({ articles }: TrendStripProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-6 md:mb-8">
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
        <h2 className="font-headline text-lg font-extrabold text-[var(--navy)]">Trend</h2>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
          Popüler
        </span>
      </div>

      <div className="mobile-scroll-x flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none sm:gap-4">
        {articles.slice(0, 8).map((article, i) => (
          <Link
            key={article.id}
            href={`/haber/${article.slug}`}
            className="news-card group w-[min(calc(100vw-2.5rem),260px)] shrink-0 snap-start sm:w-[280px]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <ArticleImage
                src={article.image}
                alt={article.title}
                categorySlug={article.category?.slug ?? "gundem"}
                priority={i < 2}
                sizes="280px"
                className="object-cover object-center group-hover:scale-105"
              />
              <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-white shadow-md">
                {i + 1}
              </span>
            </div>

            <div className="p-3">
              {article.category && (
                <span className="mb-1.5 inline-block text-[10px] font-bold uppercase tracking-wide text-primary">
                  {article.category.name}
                </span>
              )}
              <p className="font-headline line-clamp-3 text-sm font-bold leading-snug text-[var(--navy)] group-hover:text-primary">
                {article.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
