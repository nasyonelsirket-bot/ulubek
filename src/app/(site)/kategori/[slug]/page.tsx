import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleGrid from "@/components/news/ArticleGrid";
import Sidebar from "@/components/layout/Sidebar";
import {
  getCategoryBySlug,
  getArticlesByCategorySlug,
} from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori Bulunamadı" };

  return buildPageMetadata({
    title: `${category.name} Haberleri`,
    description: category.description || `${category.name} kategorisindeki son haberler ve güncel gelişmeler.`,
    path: `/kategori/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const articles = await getArticlesByCategorySlug(slug);

  const mapped = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    image: a.image,
    publishedAt: a.publishedAt,
    readTime: a.readTime,
    category: a.category,
  }));

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
            {category.description && (
              <p className="mt-1 text-gray-600">{category.description}</p>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">{articles.length} haber bulundu</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {articles.length > 0 ? (
            <ArticleGrid articles={mapped} columns={2} />
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
