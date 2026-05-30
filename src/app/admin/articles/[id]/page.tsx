import { notFound } from "next/navigation";
import { getArticleById, getAllCategories } from "@/lib/services/articles";
import ArticleEditForm from "@/components/admin/ArticleEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArticleEditPage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    getArticleById(id),
    getAllCategories(),
  ]);

  if (!article) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Haber Düzenle</h1>
        <p className="text-sm text-muted-foreground">{article.slug}</p>
      </div>
      <ArticleEditForm
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          image: article.image,
          status: article.status,
          featured: article.featured,
          breaking: article.breaking,
          readTime: article.readTime,
          categoryId: article.categoryId,
        }}
        categories={categories}
      />
    </div>
  );
}
