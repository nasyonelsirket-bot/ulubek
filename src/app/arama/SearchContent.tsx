"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ArticleGrid from "@/components/news/ArticleGrid";
import Sidebar from "@/components/layout/Sidebar";
import { searchArticles } from "@/lib/data/articles";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const results = query ? searchArticles(query) : [];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Arama Sonuçları</h1>
        {query ? (
          <p className="mt-2 text-gray-600">
            &quot;{query}&quot; için {results.length} sonuç bulundu
          </p>
        ) : (
          <p className="mt-2 text-gray-600">Arama yapmak için bir kelime girin.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {query && results.length > 0 ? (
            <ArticleGrid articles={results} columns={2} />
          ) : query ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900">Sonuç bulunamadı</p>
              <p className="mt-1 text-gray-500">Farklı anahtar kelimeler deneyebilirsiniz.</p>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default function SearchContent() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-gray-500">Arama sonuçları yükleniyor...</div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
