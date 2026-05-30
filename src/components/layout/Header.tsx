"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import SearchBar from "@/components/ui/SearchBar";
import ClientToday from "@/components/ui/ClientToday";
import LiveConnectedBadge from "@/components/live/LiveConnectedBadge";
import { useLiveNews } from "@/components/live/LiveNewsProvider";
import { Menu, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  categories: Category[];
}

const PRIMARY_NAV = ["gundem", "ekonomi", "dunya", "teknoloji", "saglik", "spor"];

export default function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { breakingNews } = useLiveNews();

  const navCategories = PRIMARY_NAV.map((slug) => categories.find((c) => c.slug === slug)).filter(
    Boolean
  ) as Category[];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary/20 bg-white shadow-sm">
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 py-1 text-xs text-muted-foreground">
          <ClientToday />
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/hakkimizda" className="font-medium transition-colors hover:text-primary">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="font-medium transition-colors hover:text-primary">
              İletişim
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-1 md:py-2">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative shrink-0">
            <Logo variant="header" priority />
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-0 lg:flex" aria-label="Ana menü">
            <Link
              href="/"
              className="font-headline shrink-0 rounded px-2.5 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:text-primary"
            >
              Ana Sayfa
            </Link>
            {navCategories.map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="font-headline shrink-0 rounded px-2.5 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/#son-dakika"
              className="hidden items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90 md:flex"
            >
              <LiveConnectedBadge variant="header" />
              Son Dakika
              {breakingNews.length > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px]">{breakingNews.length}</span>
              )}
            </Link>

            <div className="hidden w-40 xl:block xl:w-48">
              <SearchBar compact />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded border border-border lg:hidden"
              aria-label="Menü"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="mt-1.5 hidden md:block xl:hidden">
          <SearchBar />
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-border bg-white lg:hidden" aria-label="Mobil menü">
          <div className="mx-auto max-w-[1400px] space-y-0.5 px-3 py-2">
            <div className="mb-2 md:hidden">
              <SearchBar />
            </div>
            <Link
              href="/#son-dakika"
              className="mb-1 flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm font-bold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Son Dakika
              {breakingNews.length > 0 && ` (${breakingNews.length})`}
            </Link>
            <Link
              href="/"
              className="font-headline block rounded px-3 py-2 font-bold uppercase hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            {navCategories.map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="font-headline block rounded px-3 py-2 font-bold uppercase text-muted-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
