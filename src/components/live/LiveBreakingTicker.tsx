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
      className={`border-b border-red-800 bg-primary text-white ${newBreakingId ? "ring-2 ring-yellow-400 ring-inset" : ""}`}
    >
      <div className="mx-auto flex max-w-[1400px] items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-red-900 px-4 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse-live" />
          </span>
          <span className="font-headline text-xs font-black uppercase tracking-widest text-white">
            Son Dakika
          </span>
          <LiveConnectedBadge variant="ticker" />
        </div>

        <div className="relative flex flex-1 items-center overflow-hidden py-2.5 pl-4">
          <div className="pointer-events-none absolute left-0 z-10 h-full w-8 bg-gradient-to-r from-primary to-transparent" />
          <div className="pointer-events-none absolute right-0 z-10 h-full w-8 bg-gradient-to-l from-primary to-transparent" />
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/haber/${article.slug}`}
                className={`mx-8 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${
                  article.id === newBreakingId ? "font-bold text-yellow-200" : "font-medium"
                }`}
              >
                <span className="text-white/50">•</span>
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
