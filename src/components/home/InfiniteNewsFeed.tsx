"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";
import { PortalArticleGrid } from "@/components/news/PortalArticleCard";
import { Loader2 } from "lucide-react";

interface InfiniteNewsFeedProps {
  initialArticles: PortalArticleItem[];
  initialHasMore?: boolean;
  excludeIds?: string[];
  pageSize?: number;
}

export default function InfiniteNewsFeed({
  initialArticles,
  initialHasMore = true,
  excludeIds = [],
  pageSize = 12,
}: InfiniteNewsFeedProps) {
  const [articles, setArticles] = useState<PortalArticleItem[]>(initialArticles);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        exclude: excludeIds.join(","),
      });
      const res = await fetch(`/api/articles/feed?${params}`);
      const data = await res.json();
      if (data.articles?.length) {
        setArticles((prev) => {
          const seen = new Set(prev.map((a) => a.id));
          const next = data.articles.filter((a: PortalArticleItem) => !seen.has(a.id));
          return [...prev, ...next];
        });
      }
      setHasMore(Boolean(data.hasMore));
      setPage((p) => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize, excludeIds]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <section className="border-t border-border pt-4">
      <div className="portal-section-head mb-3 flex items-center justify-between">
        <h2 className="font-headline text-base font-bold text-[var(--navy)] md:text-lg">Haber Akışı</h2>
        <span className="text-xs text-muted-foreground">{articles.length} haber</span>
      </div>

      <PortalArticleGrid articles={articles} columns="auto" priorityCount={4} />

      <div ref={sentinelRef} className="flex items-center justify-center py-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yükleniyor...
          </div>
        )}
        {!hasMore && articles.length > 0 && (
          <p className="py-2 text-xs text-muted-foreground">Tüm haberler yüklendi</p>
        )}
      </div>
    </section>
  );
}
