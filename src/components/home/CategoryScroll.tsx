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
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
        <Link
          href="/"
          className={cn("category-pill shrink-0", !activeSlug || activeSlug === "" ? "category-pill-active" : "")}
        >
          🔥 Gündem
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className={cn("category-pill shrink-0", activeSlug === cat.slug && "category-pill-active")}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
