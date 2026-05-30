"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ArticleGrid from "@/components/news/ArticleGrid";

interface ArticleResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: string;
  readTime: number;
  category?: { name: string; slug: string; color: string };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [results, setResults] = useState<ArticleResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(`/api/articles/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Arama Sonuçları</h1>
        {query ? (
          <p className="mt-2 text-gray-600">
            &quot;{query}&quot; için {loading ? "..." : results.length} sonuç bulundu
          </p>
        ) : (
          <p className="mt-2 text-gray-600">Arama yapmak için bir kelime girin.</p>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Aranıyor...</p>
      ) : query && results.length > 0 ? (
        <ArticleGrid articles={results} columns={2} />
      ) : query ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-lg font-medium text-gray-900">Sonuç bulunamadı</p>
          <p className="mt-1 text-gray-500">Farklı anahtar kelimeler deneyebilirsiniz.</p>
        </div>
      ) : null}
    </>
  );
}

export default function SearchContent() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Yükleniyor...</div>}>
      <SearchResults />
    </Suspense>
  );
}
