"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X, Zap } from "lucide-react";
import Logo from "@/components/brand/Logo";
import TopMarketsBar from "@/components/layout/TopMarketsBar";
import SearchBar from "@/components/ui/SearchBar";
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
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <TopMarketsBar />

      <div className="mx-auto max-w-[1400px] px-3">
        <div className="flex h-[72px] items-center gap-4 md:h-[76px] lg:gap-6">
          <Logo variant="header" priority />

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Kategoriler">
            {navItems.map((cat) => {
              const active = pathname === `/kategori/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className={cn(
                    "font-headline px-2.5 py-1.5 text-[13px] font-bold uppercase tracking-wide transition-colors xl:px-3 xl:text-sm",
                    active ? "text-primary" : "text-[var(--navy)] hover:text-primary"
                  )}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/arama"
              className="hidden h-9 w-9 items-center justify-center rounded-md border border-border text-[var(--navy)] transition-colors hover:border-primary hover:text-primary sm:flex lg:hidden"
              aria-label="Ara"
            >
              <Search className="h-4 w-4" />
            </Link>
            <div className="hidden w-44 xl:block">
              <SearchBar compact />
            </div>
            <Link
              href="/#son-dakika"
              className="hidden items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90 sm:flex"
            >
              <Zap className="h-3.5 w-3.5" />
              Son Dakika
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <nav className="border-t border-border bg-secondary/60 lg:hidden" aria-label="Mobil kategoriler">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-3 py-1.5 scrollbar-none">
          <Link
            href="/#son-dakika"
            className="shrink-0 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase text-white"
          >
            Son Dakika
          </Link>
          {navItems.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="font-headline shrink-0 rounded px-2.5 py-1 text-[11px] font-bold uppercase text-[var(--navy)] hover:bg-white"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-white px-3 py-3 lg:hidden">
          <SearchBar />
          <div className="mt-2 grid grid-cols-2 gap-1">
            {navItems.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="font-headline rounded border border-border px-3 py-2 text-sm font-bold text-[var(--navy)]"
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
