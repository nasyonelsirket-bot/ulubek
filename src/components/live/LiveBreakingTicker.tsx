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
      className={`bg-red-600 text-white transition-all duration-500 ${
        newBreakingId ? "ring-2 ring-yellow-400 ring-offset-1" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-600">
            Son Dakika
          </span>
          <LiveConnectedBadge variant="ticker" />
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
