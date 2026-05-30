"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryNavProps {
  categories: Category[];
}

const NAV_ORDER = ["gundem", "ekonomi", "dunya", "teknoloji", "saglik", "spor", "magazin"];

export default function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();

  const items = NAV_ORDER.map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean) as Category[];

  return (
    <nav
      className="border-t border-white/10 bg-[var(--navy)] text-white"
      aria-label="Kategori menüsü"
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-0 overflow-x-auto px-2 scrollbar-none">
        <Link
          href="/#son-dakika"
          className="shrink-0 border-r border-white/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-white/5 md:px-4 md:text-sm"
        >
          Son Dakika
        </Link>
        {items.map((cat) => {
          const active = pathname === `/kategori/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className={cn(
                "font-headline shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white/5 hover:text-primary md:px-4 md:text-sm",
                active ? "bg-white/10 text-primary" : "text-white/90"
              )}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
