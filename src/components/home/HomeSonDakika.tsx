"use client";

import MobileArticleCard, { type MobileArticleItem } from "@/components/news/MobileArticleCard";

interface HomeSonDakikaProps {
  items: MobileArticleItem[];
}

export default function HomeSonDakika({ items }: HomeSonDakikaProps) {
  if (items.length === 0) return null;

  return (
    <section id="son-dakika" className="mb-2 md:mb-6">
      <div className="flex items-center gap-2 bg-primary px-4 py-2.5 md:rounded-lg">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse-live" />
        </span>
        <h2 className="font-headline text-sm font-black uppercase tracking-widest text-white">Son Dakika</h2>
      </div>
      <div className="flex flex-col">
        {items.slice(0, 4).map((article, i) => (
          <MobileArticleCard key={article.id} article={article} priority={i === 0} aspect="16/9" />
        ))}
      </div>
    </section>
  );
}
