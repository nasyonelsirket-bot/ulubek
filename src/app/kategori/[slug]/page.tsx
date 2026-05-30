import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleGrid from "@/components/news/ArticleGrid";
import Sidebar from "@/components/layout/Sidebar";
import { getCategoryBySlug, categories } from "@/lib/data/categories";
import { getArticlesByCategory } from "@/lib/data/articles";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Kategori Bulunamadı" };

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const articles = getArticlesByCategory(category.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="mt-1 text-gray-600">{category.description}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">{articles.length} haber bulundu</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {articles.length > 0 ? (
            <ArticleGrid articles={articles} columns={2} />
          ) : (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
              <p className="text-gray-500">Bu kategoride henüz haber bulunmuyor.</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
