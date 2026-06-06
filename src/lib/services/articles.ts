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
import {
  getPublishedArticlesFromDb,
  getArticleBySlugFromDb,
  searchArticlesInDb,
  getRelatedArticlesFromDb,
  getNextArticleFromDb,
  getArticleCardsFromDb,
  getArticleCardsPageFromDb,
} from "@/lib/db/articles";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export type { ArticleWithRelations } from "@/data/types";

const publishedFilter = (article: RawArticle) =>
  (article.status ?? "PUBLISHED") === "PUBLISHED";

const getMergedRaw = cache(async (): Promise<RawArticle[]> => {
  try {
    if (await checkDatabaseConnection()) {
      const dbArticles = await getPublishedArticlesFromDb({ limit: 200 });
      if (dbArticles.length > 0) return dbArticles;
    }
    return getAllArticlesFromStore().filter(publishedFilter);
  } catch {
    return getAllRawArticles().filter(publishedFilter);
  }
});

export async function getPublishedArticlesPage(
  page: number,
  limit: number,
  excludeIds: string[] = []
): Promise<{ articles: ArticleWithRelations[]; hasMore: boolean; total: number }> {
  if (await checkDatabaseConnection()) {
    const { articles, hasMore } = await getArticleCardsPageFromDb(page, limit, excludeIds);
    if (articles.length > 0 || page > 1) {
      return { articles: mapRawArticles(articles), hasMore, total: 0 };
    }
  }

  const exclude = new Set(excludeIds);
  const sorted = [...(await getMergedRaw())].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const filtered = sorted.filter((a) => !exclude.has(a.id));
  const offset = Math.max(0, (page - 1) * limit);
  const slice = filtered.slice(offset, offset + limit);

  return {
    articles: mapRawArticles(slice),
    hasMore: offset + limit < filtered.length,
    total: filtered.length,
  };
}

export async function getFeaturedArticles(): Promise<ArticleWithRelations[]> {
  if (await checkDatabaseConnection()) {
    const featured = await getArticleCardsFromDb(12, 0, { featured: true });
    if (featured.length > 0) return mapRawArticles(featured);
  }
  return mapRawArticles((await getMergedRaw()).filter((a) => a.featured));
}

export const getBreakingNews = unstable_cache(
  async (): Promise<ArticleWithRelations[]> => {
    let merged: RawArticle[] = [];
    if (await checkDatabaseConnection()) {
      merged = await getArticleCardsFromDb(15, 0, { breaking: true });
    }
    if (merged.length === 0) {
      merged = (await getMergedRaw()).filter((a) => a.breaking);
    }
    const breaking = getBreakingNewsArticles();
    const ids = new Set(merged.map((a) => a.id));
    const combined = [...merged];
    for (const b of breaking) {
      if (!ids.has(b.id)) combined.push(b);
    }
    return mapRawArticles(combined);
  },
  ["breaking-news"],
  { revalidate: 60, tags: ["articles"] }
);

export const getArticleBySlug = cache(async (slug: string): Promise<ArticleWithRelations | null> => {
  const fromDb = await getArticleBySlugFromDb(slug);
  if (fromDb && publishedFilter(fromDb)) return mapRawArticle(fromDb);

  const fromStore = (await getMergedRaw()).find((a) => a.slug === slug);
  const raw = fromStore ?? getRawArticleBySlug(slug);
  if (!raw || !publishedFilter(raw)) return null;
  return mapRawArticle(raw);
});

export async function getArticlesByCategorySlug(
  categorySlug: string,
  limit?: number
): Promise<ArticleWithRelations[]> {
  if (await checkDatabaseConnection()) {
    const dbArticles = await getArticleCardsFromDb(limit ?? 20, 0, { categorySlug });
    if (dbArticles.length > 0) return mapRawArticles(dbArticles);
  }

  const category = getDataCategoryBySlug(categorySlug);
  if (!category) return [];
  const filtered = (await getMergedRaw()).filter((a) => a.categoryId === category.id);
  return mapRawArticles(limit ? filtered.slice(0, limit) : filtered);
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  const category = categories.find((c) => c.id === categoryId);
  if (category && (await checkDatabaseConnection())) {
    const related = await getRelatedArticlesFromDb(articleId, category.slug, limit);
    if (related.length > 0) return mapRawArticles(related);
  }
  return mapRawArticles(
    (await getMergedRaw())
      .filter((a) => a.categoryId === categoryId && a.id !== articleId)
      .slice(0, limit)
  );
}

export async function getTrendingArticles(hours: 24 | 168, limit = 6): Promise<ArticleWithRelations[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  if (await checkDatabaseConnection()) {
    const recent = await getArticleCardsFromDb(80, 0, { since });
    if (recent.length > 0) {
      const sorted = [...recent].sort((a, b) => {
        const va = estimateViewCount(a.id, a.publishedAt);
        const vb = estimateViewCount(b.id, b.publishedAt);
        return vb - va;
      });
      return mapRawArticles(sorted.slice(0, limit));
    }
  }

  const filtered = (await getMergedRaw()).filter((a) => new Date(a.publishedAt).getTime() >= since.getTime());
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
  const category = categories.find((c) => c.id === categoryId);
  if (category && (await checkDatabaseConnection())) {
    const next = await getNextArticleFromDb(currentId, category.slug);
    if (next) return mapRawArticle(next);
  }

  const sorted = [...(await getMergedRaw())].sort(
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
  const q = query.trim();
  if (!q) return [];

  if (await checkDatabaseConnection()) {
    const dbResults = await searchArticlesInDb(q, 30);
    if (dbResults.length > 0) return mapRawArticles(dbResults);
  }

  const lower = q.toLowerCase();
  return mapRawArticles(
    (await getMergedRaw()).filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.excerpt.toLowerCase().includes(lower) ||
        a.tags.some((t) => t.toLowerCase().includes(lower))
    )
  );
}

export async function getPublishedArticles(limit?: number): Promise<ArticleWithRelations[]> {
  if (await checkDatabaseConnection()) {
    const cards = await getArticleCardsFromDb(limit ?? 100);
    if (cards.length > 0) return mapRawArticles(cards);
  }
  const raw = await getMergedRaw();
  return mapRawArticles(limit ? raw.slice(0, limit) : raw);
}

export const getAllCategories = unstable_cache(
  async () => {
    try {
      const { listCategoriesFromDb } = await import("@/lib/db/sources");
      if (await checkDatabaseConnection()) {
        const dbCategories = await listCategoriesFromDb();
        return dbCategories.map(({ id, name, slug, description, color, sortOrder }) => ({
          id,
          name,
          slug,
          description,
          color,
          sortOrder,
        }));
      }
    } catch {
      // fallback
    }
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  ["all-categories"],
  { revalidate: 3600 }
);

export async function getCategoryBySlug(slug: string) {
  return getDataCategoryBySlug(slug) ?? null;
}

export async function getAllArticleSlugs() {
  return (await getMergedRaw()).map((a) => ({ slug: a.slug }));
}

export async function getAllCategorySlugs() {
  const cats = await getAllCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function getArticlesForSitemap() {
  return (await getMergedRaw()).map((a) => ({
    slug: a.slug,
    updatedAt: new Date(a.updatedAt ?? a.publishedAt),
    publishedAt: new Date(a.publishedAt),
  }));
}

export async function getCategoriesForSitemap() {
  const cats = await getAllCategories();
  return cats.map((c) => ({
    slug: c.slug,
    updatedAt: new Date(),
  }));
}

export async function getArticlesForNewsSitemap(maxAgeHours = NEWS_SITEMAP_MAX_AGE_HOURS) {
  const since = Date.now() - maxAgeHours * 60 * 60 * 1000;

  return (await getMergedRaw())
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
  const raw = (await getMergedRaw()).find((a) => a.id === id) ?? getRawArticleById(id);
  if (!raw) return null;
  return mapRawArticle(raw);
}

export async function getAllArticlesForAdmin(): Promise<ArticleWithRelations[]> {
  try {
    if (await checkDatabaseConnection()) {
      const dbArticles = await getPublishedArticlesFromDb({ limit: 200, status: "PUBLISHED" });
      const drafts = await getPublishedArticlesFromDb({ limit: 100, status: "DRAFT" });
      const all = [...dbArticles, ...drafts];
      if (all.length > 0) return mapRawArticles(all);
    }
    return mapRawArticles(getAllArticlesFromStore());
  } catch {
    return mapRawArticles(getAllRawArticles());
  }
}
