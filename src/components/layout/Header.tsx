"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import SearchBar from "@/components/ui/SearchBar";
import ClientToday from "@/components/ui/ClientToday";
import ThemeToggle from "@/components/theme/ThemeToggle";
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

const PRIMARY_NAV = ["gundem", "ekonomi", "teknoloji", "dunya", "spor", "saglik"];

export default function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { breakingNews } = useLiveNews();

  const navCategories = PRIMARY_NAV.map((slug) => categories.find((c) => c.slug === slug)).filter(
    Boolean
  ) as Category[];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      {/* Üst şerit */}
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
          <ClientToday />
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/hakkimizda" className="transition-colors hover:text-primary">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="transition-colors hover:text-primary">
              İletişim
            </Link>
          </div>
        </div>
      </div>

      {/* Ana header — logo sol, menü orta, ara/son dakika sağ */}
      <div className="mx-auto max-w-7xl px-4 py-2 md:py-2.5">
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Logo — büyük, şeffaf zemin */}
          <div className="relative shrink-0 py-0.5">
            <Logo variant="header" priority />
          </div>

          {/* Masaüstü navigasyon — ortada */}
          <nav
            className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
            aria-label="Ana menü"
          >
            <Link
              href="/"
              className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              Ana Sayfa
            </Link>
            {navCategories.map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Sağ aksiyonlar */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            <Link
              href="/#son-dakika"
              className="hidden items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 md:flex"
            >
              <LiveConnectedBadge variant="header" />
              Son Dakika
              {breakingNews.length > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {breakingNews.length}
                </span>
              )}
            </Link>

            <div className="hidden w-44 xl:block xl:w-52">
              <SearchBar compact />
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              aria-label="Menü"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Tablet arama */}
        <div className="mt-2 hidden md:block xl:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Mobil menü */}
      {mobileMenuOpen && (
        <nav className="border-t border-border bg-card lg:hidden" aria-label="Mobil menü">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <div className="mb-3 md:hidden">
              <SearchBar />
            </div>
            <Link
              href="/#son-dakika"
              className="mb-2 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-bold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Son Dakika
              {breakingNews.length > 0 && ` (${breakingNews.length})`}
            </Link>
            <Link
              href="/"
              className="block rounded-lg px-3 py-2.5 font-bold hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            {navCategories.map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="block rounded-lg px-3 py-2.5 font-medium text-muted-foreground hover:bg-accent"
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
