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
      className={`border-b border-border bg-white ${newBreakingId ? "ring-2 ring-primary ring-inset" : ""}`}
    >
      <div className="mx-auto flex max-w-[1280px] items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-primary px-3 py-2 md:px-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse-live" />
          </span>
          <span className="font-headline text-[11px] font-black uppercase tracking-widest text-white md:text-xs">
            Son Dakika
          </span>
          <LiveConnectedBadge variant="ticker" />
        </div>

        <div className="relative flex flex-1 items-center overflow-hidden py-2 pl-3 md:pl-4">
          <div className="pointer-events-none absolute left-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 z-10 h-full w-6 bg-gradient-to-l from-white to-transparent" />
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/haber/${article.slug}`}
                className={`mx-6 inline-flex items-center gap-2 text-[13px] transition-colors hover:text-primary ${
                  article.id === newBreakingId ? "font-bold text-primary" : "font-medium text-[var(--navy)]"
                }`}
              >
                <span className="text-primary">•</span>
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
