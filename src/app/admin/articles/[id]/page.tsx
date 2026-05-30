import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleEditForm from "@/components/admin/ArticleEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Haber Düzenle</h1>
        <p className="text-sm text-muted-foreground">{article.slug}</p>
      </div>
      <ArticleEditForm article={article} categories={categories} />
    </div>
  );
}
