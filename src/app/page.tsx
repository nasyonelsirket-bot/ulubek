import FeaturedArticle from "@/components/news/FeaturedArticle";
import ArticleGrid from "@/components/news/ArticleGrid";
import ArticleCard from "@/components/news/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";
import { getFeaturedArticles, getLatestArticles } from "@/lib/data/articles";
import { categories } from "@/lib/data/categories";
import Link from "next/link";

export default function HomePage() {
  const featured = getFeaturedArticles();
  const latest = getLatestArticles(12);
  const mainFeatured = featured[0];
  const secondaryFeatured = featured.slice(1, 3);
  const restArticles = latest.filter((a) => !featured.slice(0, 3).some((f) => f.id === a.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {mainFeatured && (
        <section className="mb-8">
          <FeaturedArticle article={mainFeatured} size="large" />
        </section>
      )}

      {secondaryFeatured.length > 0 && (
        <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {secondaryFeatured.map((article) => (
            <FeaturedArticle key={article.id} article={article} size="medium" />
          ))}
        </section>
      )}

      <section className="mb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kategoriler</h2>
        </div>
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
          <section>
            <div className="mb-6 flex items-center justify-between border-b-2 border-red-600 pb-2">
              <h2 className="text-2xl font-bold text-gray-900">Son Haberler</h2>
            </div>
            <ArticleGrid articles={restArticles.slice(0, 6)} columns={2} />
          </section>

          <section className="mt-10">
            <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-2">
              <h2 className="text-xl font-bold text-gray-900">Daha Fazla Haber</h2>
            </div>
            <div className="space-y-0">
              {restArticles.slice(6).map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
