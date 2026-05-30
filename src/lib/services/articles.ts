import { categories, getCategoryBySlug as getDataCategoryBySlug } from "@/data/categories";
import {
  getAllRawArticles,
  getRawArticleById,
  getRawArticleBySlug,
} from "@/data/articles";
import { getBreakingNewsArticles } from "@/data/breaking-news";
import { mapRawArticle, mapRawArticles } from "@/data/mappers";
import { getAllArticlesFromStore } from "@/lib/ai-engine/store";
import type { ArticleWithRelations, RawArticle } from "@/data/types";
import { NEWS_SITEMAP_MAX_AGE_HOURS } from "@/lib/seo/config";
import { estimateViewCount } from "@/lib/utils/view-count";

export type { ArticleWithRelations } from "@/data/types";

const publishedFilter = (article: RawArticle) =>
  (article.status ?? "PUBLISHED") === "PUBLISHED";

function getMergedRaw(): RawArticle[] {
  try {
    return getAllArticlesFromStore().filter(publishedFilter);
  } catch {
    return getAllRawArticles().filter(publishedFilter);
  }
}

export async function getPublishedArticles(limit?: number): Promise<ArticleWithRelations[]> {
  const raw = getMergedRaw();
  return mapRawArticles(limit ? raw.slice(0, limit) : raw);
}

export async function getFeaturedArticles(): Promise<ArticleWithRelations[]> {
  return mapRawArticles(getMergedRaw().filter((a) => a.featured));
}

export async function getBreakingNews(): Promise<ArticleWithRelations[]> {
  const breaking = getBreakingNewsArticles();
  const merged = getMergedRaw().filter((a) => a.breaking);
  const ids = new Set(merged.map((a) => a.id));
  const combined = [...merged];
  for (const b of breaking) {
    if (!ids.has(b.id)) combined.push(b);
  }
  return mapRawArticles(combined);
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  const fromStore = getMergedRaw().find((a) => a.slug === slug);
  const raw = fromStore ?? getRawArticleBySlug(slug);
  if (!raw || !publishedFilter(raw)) return null;
  return mapRawArticle(raw);
}

export async function getArticlesByCategorySlug(
  categorySlug: string,
  limit?: number
): Promise<ArticleWithRelations[]> {
  const category = getDataCategoryBySlug(categorySlug);
  if (!category) return [];
  const filtered = getMergedRaw().filter((a) => a.categoryId === category.id);
  return mapRawArticles(limit ? filtered.slice(0, limit) : filtered);
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  return mapRawArticles(
    getMergedRaw()
      .filter((a) => a.categoryId === categoryId && a.id !== articleId)
      .slice(0, limit)
  );
}

export async function getTrendingArticles(hours: 24 | 168, limit = 6): Promise<ArticleWithRelations[]> {
  const since = Date.now() - hours * 60 * 60 * 1000;
  const filtered = getMergedRaw().filter((a) => new Date(a.publishedAt).getTime() >= since);
  const sorted = [...filtered].sort((a, b) => {
    const va = estimateViewCount(a.id, a.publishedAt);
    const vb = estimateViewCount(b.id, b.publishedAt);
    return vb - va;
  });
  return mapRawArticles(sorted.slice(0, limit));
}

export async function getNextArticle(
  currentId: string,
  categoryId: string
): Promise<ArticleWithRelations | null> {
  const sorted = [...getMergedRaw()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const idx = sorted.findIndex((a) => a.id === currentId);
  if (idx === -1) return null;

  const nextInCategory = sorted.slice(idx + 1).find((a) => a.categoryId === categoryId);
  const next = nextInCategory ?? sorted[idx + 1];
  if (!next) return null;
  return mapRawArticle(next);
}

export async function searchPublishedArticles(query: string): Promise<ArticleWithRelations[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return mapRawArticles(
    getMergedRaw().filter(
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
  return getMergedRaw().map((a) => ({ slug: a.slug }));
}

export async function getAllCategorySlugs() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function getArticlesForSitemap() {
  return getMergedRaw().map((a) => ({
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

  return getMergedRaw()
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
  const raw = getMergedRaw().find((a) => a.id === id) ?? getRawArticleById(id);
  if (!raw) return null;
  return mapRawArticle(raw);
}

export async function getAllArticlesForAdmin(): Promise<ArticleWithRelations[]> {
  try {
    return mapRawArticles(getAllArticlesFromStore());
  } catch {
    return mapRawArticles(getAllRawArticles());
  }
}
