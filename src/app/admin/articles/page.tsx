import { getAllArticlesForAdmin } from "@/lib/services/articles";
import ArticlesTable from "@/components/admin/ArticlesTable";

export default async function AdminArticlesPage() {
  const articles = await getAllArticlesForAdmin();

  const serialized = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    featured: a.featured,
    breaking: a.breaking,
    publishedAt: a.publishedAt.toISOString(),
    aiProcessed: a.aiProcessed,
    aiProcessingError: a.aiProcessingError,
    category: { name: a.category.name, color: a.category.color },
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Haber Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Haberleri düzenleyin, gizleyin veya silin (mock veri)
        </p>
      </div>
      <ArticlesTable initialArticles={serialized} />
    </div>
  );
}
