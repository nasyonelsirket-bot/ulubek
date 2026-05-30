"use client";

import { useState } from "react";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";
import { PortalArticleGrid } from "@/components/news/PortalArticleCard";
import { cn } from "@/lib/utils";

interface TrendBlockProps {
  articles24h: PortalArticleItem[];
  articles7d: PortalArticleItem[];
}

type Period = "24h" | "7d";

export default function TrendBlock({ articles24h, articles7d }: TrendBlockProps) {
  const [period, setPeriod] = useState<Period>("24h");
  const articles = period === "24h" ? articles24h : articles7d;

  if (articles24h.length === 0 && articles7d.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="portal-section-head mb-4 flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-[var(--navy)]">En Çok Okunanlar</h2>
        <div className="flex rounded-md border border-border p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPeriod("24h")}
            className={cn("rounded px-3 py-1", period === "24h" ? "bg-primary text-white" : "text-muted-foreground")}
          >
            24 Saat
          </button>
          <button
            type="button"
            onClick={() => setPeriod("7d")}
            className={cn("rounded px-3 py-1", period === "7d" ? "bg-primary text-white" : "text-muted-foreground")}
          >
            7 Gün
          </button>
        </div>
      </div>
      <PortalArticleGrid articles={articles.slice(0, 8)} columns="auto" priorityCount={2} />
    </section>
  );
}
