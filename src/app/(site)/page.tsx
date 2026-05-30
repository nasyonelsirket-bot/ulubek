import type { Metadata } from "next";
import FeaturedArticle from "@/components/news/FeaturedArticle";
import Sidebar from "@/components/layout/Sidebar";
import LiveHomeFeed from "@/components/live/LiveHomeFeed";
import {
  getFeaturedArticles,
  getPublishedArticles,
  getAllCategories,
} from "@/lib/services/articles";
import { serializeLiveArticle } from "@/lib/live/serialize";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/config";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "Son Dakika Haberleri",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedArticles(),
    getPublishedArticles(12),
    getAllCategories(),
  ]);

  const mainFeatured = featured[0];
  const secondaryFeatured = featured.slice(1, 3);
  const featuredIds = new Set(featured.slice(0, 3).map((f) => f.id));
  const restArticles = latest.filter((a) => !featuredIds.has(a.id));

  const mapArticle = (a: (typeof latest)[0]) => serializeLiveArticle(a);

  const initialLatest = restArticles.slice(0, 6).map(mapArticle);
  const initialRest = restArticles.slice(6).map(mapArticle);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {mainFeatured && (
        <section className="mb-8">
          <FeaturedArticle article={mapArticle(mainFeatured)} size="large" />
        </section>
      )}

      {secondaryFeatured.length > 0 && (
        <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {secondaryFeatured.map((article) => (
            <FeaturedArticle key={article.id} article={mapArticle(article)} size="medium" />
          ))}
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Kategoriler</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group flex flex-col items-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-red-200"
            >
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: category.color }}
              >
                <span className="text-lg font-bold">{category.name[0]}</span>
              </div>
              <span className="text-center text-sm font-semibold text-gray-800 group-hover:text-red-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveHomeFeed initialLatest={initialLatest} initialRest={initialRest} />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
