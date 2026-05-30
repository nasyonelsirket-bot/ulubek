"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RelativeTime from "@/components/ui/RelativeTime";
import ArticleImage from "@/components/news/ArticleImage";

export interface HeroSlide {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string | Date;
  category?: { name: string; slug: string; color: string };
  breaking?: boolean;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  compact?: boolean;
}

export default function HeroSlider({ slides, compact = false }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const len = slides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len]);

  useEffect(() => {
    if (len <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [len, next]);

  if (len === 0) return null;

  const slide = slides[current];
  const categorySlug = slide.category?.slug ?? "gundem";

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-black shadow-sm">
      <Link
        href={`/haber/${slide.slug}`}
        className="relative block aspect-video w-full max-h-[420px]"
      >
        <ArticleImage
          src={slide.image}
          alt={slide.title}
          categorySlug={categorySlug}
          priority
          sizes="(max-width:1024px) 100vw, 900px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className={compact ? "absolute bottom-0 left-0 right-0 p-4" : "absolute bottom-0 left-0 right-0 p-4 md:p-6"}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {slide.breaking && (
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Son Dakika
              </span>
            )}
            {slide.category && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                style={{ backgroundColor: slide.category.color }}
              >
                {slide.category.name}
              </span>
            )}
            <RelativeTime date={slide.publishedAt} className="text-[11px] text-white/70" />
          </div>
          <h2 className="font-headline line-clamp-3 text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
            {slide.title}
          </h2>
          {!compact && slide.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-white/85">{slide.excerpt}</p>
          )}
        </div>
      </Link>

      {len > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1 bg-white/40"}`}
                aria-label={`Slayt ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
