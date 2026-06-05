"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X, Zap } from "lucide-react";
import Logo from "@/components/brand/Logo";
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
    <header className="sticky top-0 z-50 shadow-md">
      <div className="bg-primary">
        <div className="mx-auto flex max-w-[1280px] items-stretch px-0">
          <div className="flex shrink-0 items-center bg-white px-4 py-2 md:px-5">
            <Logo variant="header" priority />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 md:px-4">
            <nav className="hidden flex-1 items-center gap-0 lg:flex" aria-label="Kategoriler">
              {navItems.map((cat) => {
                const active = pathname === `/kategori/${cat.slug}`;
                return (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className={cn(
                      "font-headline px-2 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-colors xl:px-2.5 xl:text-[13px]",
                      active ? "text-yellow-300" : "text-white hover:text-white/80"
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
                className="hidden h-8 w-8 items-center justify-center text-white transition-colors hover:text-white/80 sm:flex lg:hidden"
                aria-label="Ara"
              >
                <Search className="h-4 w-4" />
              </Link>
              <div className="hidden w-40 xl:block [&_input]:border-white/30 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/60">
                <SearchBar compact />
              </div>
              <Link
                href="/#son-dakika"
                className="hidden items-center gap-1 rounded border border-white/40 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase text-white transition-colors hover:bg-white/20 sm:flex"
              >
                <Zap className="h-3 w-3" />
                Son Dakika
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-8 w-8 items-center justify-center text-white lg:hidden"
                aria-label="Menü"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="border-t border-white/10 bg-primary/95 lg:hidden" aria-label="Mobil kategoriler">
        <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-3 py-1.5 scrollbar-none">
          <Link
            href="/#son-dakika"
            className="shrink-0 rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
          >
            Son Dakika
          </Link>
          {navItems.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="font-headline shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase text-white/90 hover:text-white"
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
