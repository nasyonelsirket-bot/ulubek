import { categories, getCategoryBySlug as getDataCategoryBySlug } from "@/data/categories";
import {
  getAllRawArticles,
  getRawArticleById,
  getRawArticleBySlug,
} from "@/data/articles";
import { getBreakingNewsArticles } from "@/data/breaking-news";
import { mapRawArticle, mapRawArticles } from "@/data/mappers";
import type { ArticleWithRelations } from "@/data/types";
import { NEWS_SITEMAP_MAX_AGE_HOURS } from "@/lib/seo/config";

export type { ArticleWithRelations } from "@/data/types";

const publishedFilter = (article: ReturnType<typeof getAllRawArticles>[number]) =>
  (article.status ?? "PUBLISHED") === "PUBLISHED";

function getPublishedRaw() {
  return getAllRawArticles().filter(publishedFilter);
}

export async function getPublishedArticles(limit?: number): Promise<ArticleWithRelations[]> {
  const raw = getPublishedRaw();
  return mapRawArticles(limit ? raw.slice(0, limit) : raw);
}

export async function getFeaturedArticles(): Promise<ArticleWithRelations[]> {
  return mapRawArticles(getPublishedRaw().filter((a) => a.featured));
}

export async function getBreakingNews(): Promise<ArticleWithRelations[]> {
  return mapRawArticles(getBreakingNewsArticles());
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  const raw = getRawArticleBySlug(slug);
  if (!raw || !publishedFilter(raw)) return null;
  return mapRawArticle(raw);
}

export async function getArticlesByCategorySlug(
  categorySlug: string
): Promise<ArticleWithRelations[]> {
  const category = getDataCategoryBySlug(categorySlug);
  if (!category) return [];
  return mapRawArticles(getPublishedRaw().filter((a) => a.categoryId === category.id));
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  return mapRawArticles(
    getPublishedRaw()
      .filter((a) => a.categoryId === categoryId && a.id !== articleId)
      .slice(0, limit)
  );
}

export async function searchPublishedArticles(query: string): Promise<ArticleWithRelations[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return mapRawArticles(
    getPublishedRaw().filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  );
}

export async function getAllCategories() {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  return getDataCategoryBySlug(slug) ?? null;
}

export async function getAllArticleSlugs() {
  return getPublishedRaw().map((a) => ({ slug: a.slug }));
}

export async function getAllCategorySlugs() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function getArticlesForSitemap() {
  return getPublishedRaw().map((a) => ({
    slug: a.slug,
    updatedAt: new Date(a.updatedAt ?? a.publishedAt),
    publishedAt: new Date(a.publishedAt),
  }));
}

export async function getCategoriesForSitemap() {
  return categories.map((c) => ({
    slug: c.slug,
    updatedAt: new Date(),
  }));
}

export async function getArticlesForNewsSitemap(maxAgeHours = NEWS_SITEMAP_MAX_AGE_HOURS) {
  const since = Date.now() - maxAgeHours * 60 * 60 * 1000;

  return getPublishedRaw()
    .filter((a) => new Date(a.publishedAt).getTime() >= since)
    .slice(0, 1000)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      metaTitle: a.metaTitle ?? null,
      publishedAt: new Date(a.publishedAt),
    }));
}

export async function getArticleById(id: string): Promise<ArticleWithRelations | null> {
  const raw = getRawArticleById(id);
  if (!raw) return null;
  return mapRawArticle(raw);
}

export async function getAllArticlesForAdmin(): Promise<ArticleWithRelations[]> {
  return mapRawArticles(getAllRawArticles());
}
