import Link from "next/link";
import { getPublishedArticles, getAllCategories } from "@/lib/services/articles";
import ArticleCard from "@/components/news/ArticleCard";

export default async function Sidebar() {
  const [popularArticles, categories] = await Promise.all([
    getPublishedArticles(5),
    getAllCategories(),
  ]);

  return (
    <aside className="space-y-8">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 border-b-2 border-red-600 pb-2 text-lg font-bold text-gray-900">
          Popüler Haberler
        </h2>
        <div>
          {popularArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                ...article,
                category: article.category,
              }}
              variant="compact"
            />
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
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
