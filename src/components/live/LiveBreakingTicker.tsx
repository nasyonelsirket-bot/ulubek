"use client";

import Link from "next/link";
import { useLiveNews } from "./LiveNewsProvider";
import { Radio } from "lucide-react";

export default function LiveBreakingTicker() {
  const { breakingNews, connected, newBreakingId } = useLiveNews();

  if (breakingNews.length === 0) return null;

  const items = [...breakingNews, ...breakingNews];

  return (
    <div
      className={`bg-red-600 text-white transition-all duration-500 ${
        newBreakingId ? "ring-2 ring-yellow-400 ring-offset-1" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-600">
            Son Dakika
          </span>
          {connected && (
            <span className="flex items-center gap-1 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-medium uppercase">
              <Radio className="h-3 w-3 animate-pulse" />
              Canlı
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/haber/${article.slug}`}
                className={`mx-6 inline-block text-sm hover:underline ${
                  article.id === newBreakingId ? "font-bold text-yellow-200" : ""
                }`}
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
