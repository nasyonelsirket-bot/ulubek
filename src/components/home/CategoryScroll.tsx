"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryScrollProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryScroll({ categories, activeSlug }: CategoryScrollProps) {
  return (
    <div className="border-t border-border/60 bg-white lg:hidden">
      <div className="mobile-scroll-x flex snap-x snap-mandatory gap-2 py-2.5">
        <Link
          href="/"
          className={cn(
            "category-pill shrink-0 snap-start",
            !activeSlug || activeSlug === "" ? "category-pill-active" : ""
          )}
        >
          🔥 Gündem
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className={cn(
              "category-pill shrink-0 snap-start",
              activeSlug === cat.slug && "category-pill-active"
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
