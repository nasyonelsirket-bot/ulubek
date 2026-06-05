import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleGrid from "@/components/news/ArticleGrid";
import Sidebar from "@/components/layout/Sidebar";
import { getCategoryBySlug, getArticlesByCategorySlug } from "@/lib/services/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

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
    <div className="mx-auto max-w-[1400px] px-3 py-5">
      <div className="portal-section-head mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white"
          style={{ backgroundColor: category.color }}
        >
          {category.name[0]}
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold text-[var(--navy)] md:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">{articles.length} haber</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {articles.length > 0 ? (
            <ArticleGrid articles={mapped} columns={3} />
          ) : (
            <div className="rounded-lg border border-border bg-white p-12 text-center">
              <p className="text-muted-foreground">Bu kategoride henüz haber bulunmuyor.</p>
            </div>
          )}
        </div>
        <div className="hidden lg:col-span-3 lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
