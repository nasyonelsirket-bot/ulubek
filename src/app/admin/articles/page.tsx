import { prisma } from "@/lib/prisma";
import ArticlesTable from "@/components/admin/ArticlesTable";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      category: { select: { name: true, color: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

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
    category: a.category,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Haber Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Haberleri düzenleyin, gizleyin veya silin
        </p>
      </div>
      <ArticlesTable initialArticles={serialized} />
    </div>
  );
}
