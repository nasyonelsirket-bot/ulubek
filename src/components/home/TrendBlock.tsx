"use client";

import { useState } from "react";
import MobileArticleCard, { type MobileArticleItem } from "@/components/news/MobileArticleCard";
import { cn } from "@/lib/utils";

interface TrendBlockProps {
  articles24h: MobileArticleItem[];
  articles7d: MobileArticleItem[];
}

type Period = "24h" | "7d";

export default function TrendBlock({ articles24h, articles7d }: TrendBlockProps) {
  const [period, setPeriod] = useState<Period>("24h");
  const articles = period === "24h" ? articles24h : articles7d;

  if (articles24h.length === 0 && articles7d.length === 0) return null;

  return (
    <section className="mb-2 md:mb-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--navy)] px-4 pb-3 pt-5 md:px-0">
        <h2 className="news-section-title text-lg md:text-2xl">En Çok Okunanlar</h2>
        <div className="flex rounded-lg border border-border bg-secondary p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPeriod("24h")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              period === "24h" ? "bg-primary text-white" : "text-muted-foreground"
            )}
          >
            24 Saat
          </button>
          <button
            type="button"
            onClick={() => setPeriod("7d")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              period === "7d" ? "bg-primary text-white" : "text-muted-foreground"
            )}
          >
            7 Gün
          </button>
        </div>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-4 md:px-0 lg:grid-cols-3">
        {articles.slice(0, 6).map((article, i) => (
          <MobileArticleCard key={article.id} article={article} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
