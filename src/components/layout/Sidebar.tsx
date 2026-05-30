import Link from "next/link";
import { getPopularArticles } from "@/lib/data/articles";
import { categories } from "@/lib/data/categories";
import ArticleCard from "@/components/news/ArticleCard";

export default function Sidebar() {
  const popularArticles = getPopularArticles(5);

  return (
    <aside className="space-y-8">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 border-b-2 border-red-600 pb-2 text-lg font-bold text-gray-900">
          Popüler Haberler
        </h2>
        <div>
          {popularArticles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 border-b-2 border-red-600 pb-2 text-lg font-bold text-gray-900">
          Kategoriler
        </h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/kategori/${category.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700">{category.name}</span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-white">
        <h2 className="text-lg font-bold">Bülten</h2>
        <p className="mt-2 text-sm text-red-100">
          Günün önemli haberlerini e-posta adresinize gönderelim.
        </p>
        <form className="mt-4">
          <input
            type="email"
            placeholder="E-posta adresiniz"
            className="w-full rounded-lg border-0 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Abone Ol
          </button>
        </form>
      </section>
    </aside>
  );
}
