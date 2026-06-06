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
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
        <h2 className="font-headline text-lg font-extrabold text-[var(--navy)]">Trend</h2>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
          Popüler
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {articles.slice(0, 8).map((article, i) => (
          <Link
            key={article.id}
            href={`/haber/${article.slug}`}
            className="news-card w-[140px] shrink-0 sm:w-[160px]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <ArticleImage
                src={article.image}
                alt={article.title}
                categorySlug={article.category?.slug ?? "gundem"}
                priority={i < 2}
                sizes="160px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-black text-[var(--navy)]">
                {i + 1}
              </span>
              {article.category && (
                <span
                  className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                  style={{ backgroundColor: article.category.color }}
                >
                  {article.category.name}
                </span>
              )}
            </div>
            <p className="line-clamp-2 p-2.5 text-xs font-bold leading-snug text-[var(--navy)]">
              {article.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
