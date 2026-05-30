"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import CategoryNav from "@/components/layout/CategoryNav";
import SearchBar from "@/components/ui/SearchBar";
import ClientToday from "@/components/ui/ClientToday";
import { Menu, X } from "lucide-react";
import { PRIMARY_NAV_SLUGS } from "@/config/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navCategories = PRIMARY_NAV_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    Boolean
  ) as Category[];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 py-1 text-xs text-muted-foreground">
          <ClientToday />
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/hakkimizda" className="font-medium hover:text-primary">Hakkımızda</Link>
            <Link href="/iletisim" className="font-medium hover:text-primary">İletişim</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-2">
        <div className="flex items-center gap-3">
          <Logo variant="header" priority />
          <div className="ml-auto hidden w-52 xl:block">
            <SearchBar compact />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded border border-border lg:hidden"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <CategoryNav categories={categories} />

      {mobileMenuOpen && (
        <nav className="border-t border-border bg-white lg:hidden">
          <div className="space-y-0.5 px-3 py-2">
            <SearchBar />
            <Link href="/#son-dakika" className="block rounded bg-primary px-3 py-2 text-sm font-bold text-white">
              Son Dakika
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="font-headline block rounded px-3 py-2 font-bold uppercase text-[var(--navy)] hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
