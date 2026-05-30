import { categories } from "@/data/categories";
import { sources, getSourceById } from "@/data/sources";
import type { ArticleStatus, MockSource } from "@/data/types";

export async function getAdminDashboardStats() {
  const { getAllRawArticles } = await import("@/data/articles");
  const articles = getAllRawArticles();

  return {
    total: articles.length,
    published: articles.filter((a) => (a.status ?? "PUBLISHED") === "PUBLISHED").length,
    rssSources: sources.filter((s) => s.isActive && s.type === "RSS").length,
    pendingAI: articles.filter((a) => !a.aiProcessed && a.status === "DRAFT").length,
    lastFetch: {
      createdAt: new Date("2026-05-30T08:00:00"),
      status: "SUCCESS",
      itemsImported: 3,
    },
  };
}

export async function getAllSources(): Promise<
  (MockSource & { category: { id: string; name: string } })[]
> {
  return sources.map((source) => ({
    ...source,
    category: categories.find((c) => c.id === source.categoryId) ?? {
      id: source.categoryId,
      name: "Genel",
    },
  }));
}

export async function getSourceWithCategory(id: string) {
  const source = getSourceById(id);
  if (!source) return null;

  return {
    ...source,
    category: categories.find((c) => c.id === source.categoryId) ?? null,
  };
}

export async function mockUpdateArticle(
  id: string,
  data: Partial<{
    title: string;
    excerpt: string;
    content: string;
    image: string;
    status: ArticleStatus;
    featured: boolean;
    breaking: boolean;
    categoryId: string;
    readTime: number;
  }>
) {
  const { getArticleById } = await import("@/lib/services/articles");
  const existing = await getArticleById(id);
  if (!existing) return null;

  return {
    ...existing,
    ...data,
    updatedAt: new Date(),
  };
}

export async function mockFetchSource(sourceId: string) {
  const source = getSourceById(sourceId);
  if (!source) return { success: false, error: "Kaynak bulunamadı" };

  return {
    success: true,
    sourceId,
    itemsFound: 5,
    itemsImported: 2,
    duplicates: 3,
  };
}

export async function mockProcessArticleWithAI(articleId: string) {
  const { getArticleById } = await import("@/lib/services/articles");
  const article = await getArticleById(articleId);
  if (!article) return { success: false, error: "Haber bulunamadı" };

  return {
    success: true,
    articleId,
    engine: "local" as const,
  };
}
