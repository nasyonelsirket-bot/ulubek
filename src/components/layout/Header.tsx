"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X, Zap } from "lucide-react";
import Logo from "@/components/brand/Logo";
import SearchBar from "@/components/ui/SearchBar";
import CategoryScroll from "@/components/home/CategoryScroll";
import { PRIMARY_NAV_SLUGS } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = PRIMARY_NAV_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    Boolean
  ) as Category[];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <Logo variant="header" priority />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Kategoriler">
          {navItems.map((cat) => {
            const active = pathname === `/kategori/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  active ? "bg-[var(--navy)] text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/#son-dakika"
            className="hidden items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-primary sm:flex"
          >
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
            Canlı
          </Link>
          <Link
            href="/arama"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Ara"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground lg:hidden"
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <CategoryScroll categories={navItems} activeSlug={pathname.replace("/kategori/", "")} />

      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <SearchBar />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {navItems.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
