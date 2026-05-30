"use client";

import { useEffect } from "react";
import ArticleCard from "@/components/news/ArticleCard";
import { useLiveNews } from "./LiveNewsProvider";
import type { LiveArticle } from "@/lib/live/types";
import { Wifi, WifiOff } from "lucide-react";

interface LiveHomeFeedProps {
  initialLatest: LiveArticle[];
  initialRest: LiveArticle[];
}

export default function LiveHomeFeed({ initialLatest, initialRest }: LiveHomeFeedProps) {
  const { latestNews, connected, wsEnabled, setInitialLatest } = useLiveNews();

  useEffect(() => {
    setInitialLatest([...initialLatest, ...initialRest]);
  }, [initialLatest, initialRest, setInitialLatest]);

  const displayLatest = latestNews.length > 0 ? latestNews : [...initialLatest, ...initialRest];
  const gridArticles = displayLatest.slice(0, 6);
  const listArticles = displayLatest.slice(6);

  const newIds = new Set(
    latestNews
      .filter((a) => !initialLatest.some((i) => i.id === a.id) && !initialRest.some((i) => i.id === a.id))
      .map((a) => a.id)
  );

  return (
    <>
      <section>
        <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Son Haberler</h2>
            {wsEnabled && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                connected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {connected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Canlı
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Bağlanıyor...
                </>
              )}
            </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {gridArticles.map((article) => (
            <div
              key={article.id}
              className={newIds.has(article.id) ? "animate-fade-in rounded-xl ring-2 ring-red-300" : ""}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-6 border-b-2 border-gray-200 pb-2 text-xl font-bold text-gray-900">
          Daha Fazla Haber
        </h2>
        <div>
          {listArticles.map((article) => (
            <div
              key={article.id}
              className={newIds.has(article.id) ? "animate-fade-in rounded-lg ring-2 ring-red-100" : ""}
            >
              <ArticleCard article={article} variant="horizontal" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
