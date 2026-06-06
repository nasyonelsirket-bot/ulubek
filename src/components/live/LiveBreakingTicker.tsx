"use client";

import Link from "next/link";
import { useLiveNews } from "./LiveNewsProvider";
import LiveConnectedBadge from "./LiveConnectedBadge";

export default function LiveBreakingTicker() {
  const { breakingNews, newBreakingId } = useLiveNews();

  if (breakingNews.length === 0) return null;

  const items = [...breakingNews, ...breakingNews];

  return (
    <div
      id="son-dakika"
      className={`border-b border-red-100 bg-red-50 ${newBreakingId ? "ring-2 ring-primary/30 ring-inset" : ""}`}
    >
      <div className="mx-auto flex max-w-6xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-primary px-4 py-2.5">
          <span className="news-badge news-badge-live bg-white/20 text-white before:bg-white">
            Canlı
          </span>
          <LiveConnectedBadge variant="ticker" />
        </div>

        <div className="relative flex flex-1 items-center overflow-hidden py-2 pl-3">
          <div className="pointer-events-none absolute left-0 z-10 h-full w-6 bg-gradient-to-r from-red-50 to-transparent" />
          <div className="pointer-events-none absolute right-0 z-10 h-full w-6 bg-gradient-to-l from-red-50 to-transparent" />
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/haber/${article.slug}`}
                className={`mx-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-primary ${
                  article.id === newBreakingId ? "font-bold text-primary" : "font-semibold text-[var(--navy)]"
                }`}
              >
                <span className="text-primary">●</span>
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
