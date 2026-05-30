"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import SearchBar from "@/components/ui/SearchBar";

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

  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-gray-500">
          <time>{today}</time>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/hakkimizda" className="hover:text-red-600">Hakkımızda</Link>
            <Link href="/iletisim" className="hover:text-red-600">İletişim</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Logo variant="header" priority />
          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 md:hidden"
            aria-label="Menüyü aç"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div className="mt-4 md:hidden">
          <SearchBar />
        </div>
      </div>

      <nav className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <ul className={`flex flex-col gap-1 py-2 md:flex-row md:items-center md:gap-0 md:overflow-x-auto md:py-0 ${mobileMenuOpen ? "block" : "hidden md:flex"}`}>
            <li>
              <Link href="/" className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-red-50 hover:text-red-600 md:rounded-none md:border-b-2 md:border-transparent md:hover:border-red-600 md:hover:bg-transparent">
                Ana Sayfa
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 md:rounded-none md:border-b-2 md:border-transparent md:hover:border-red-600 md:hover:bg-transparent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
