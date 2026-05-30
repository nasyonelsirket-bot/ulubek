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
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const len = slides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len]);

  useEffect(() => {
    if (len <= 1) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [len, next]);

  if (len === 0) return null;

  const slide = slides[current];
  const categorySlug = slide.category?.slug ?? "gundem";

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      <Link href={`/haber/${slide.slug}`} className="relative block aspect-[21/9] min-h-[240px] sm:min-h-[320px] lg:min-h-[400px]">
        <ArticleImage
          src={slide.image}
          alt={slide.title}
          categorySlug={categorySlug}
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {slide.breaking && (
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Son Dakika
              </span>
            )}
            {slide.category && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: slide.category.color }}
              >
                {slide.category.name}
              </span>
            )}
            <RelativeTime date={slide.publishedAt} className="text-xs text-white/70" />
          </div>
          <h2 className="font-headline max-w-4xl text-2xl font-black leading-tight text-white md:text-4xl lg:text-5xl">
            {slide.title}
          </h2>
          {slide.excerpt && (
            <p className="mt-2 line-clamp-3 max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">{slide.excerpt}</p>
          )}
        </div>
      </Link>

      {len > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-black/70"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-black/70"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-5 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-7 bg-white" : "w-1.5 bg-white/40"}`}
                aria-label={`Slayt ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
