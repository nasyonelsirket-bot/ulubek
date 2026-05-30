import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const articleInclude = {
  category: true,
  tags: { include: { tag: true } },
  source: true,
} satisfies Prisma.ArticleInclude;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>;

const publishedFilter = { status: ArticleStatus.PUBLISHED };

export async function getPublishedArticles(limit?: number): Promise<ArticleWithRelations[]> {
  return prisma.article.findMany({
    where: publishedFilter,
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getFeaturedArticles(): Promise<ArticleWithRelations[]> {
  return prisma.article.findMany({
    where: { ...publishedFilter, featured: true },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBreakingNews(): Promise<ArticleWithRelations[]> {
  return prisma.article.findMany({
    where: { ...publishedFilter, breaking: true },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  return prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    include: articleInclude,
  });
}

export async function getArticlesByCategorySlug(categorySlug: string): Promise<ArticleWithRelations[]> {
  return prisma.article.findMany({
    where: { ...publishedFilter, category: { slug: categorySlug } },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4) {
  return prisma.article.findMany({
    where: {
      ...publishedFilter,
      categoryId,
      id: { not: articleId },
    },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function searchPublishedArticles(query: string): Promise<ArticleWithRelations[]> {
  const q = query.trim();
  if (!q) return [];

  return prisma.article.findMany({
    where: {
      ...publishedFilter,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getAllArticleSlugs() {
  return prisma.article.findMany({
    where: publishedFilter,
    select: { slug: true },
  });
}

export async function getAllCategorySlugs() {
  return prisma.category.findMany({ select: { slug: true } });
}

export async function getArticlesForSitemap() {
  return prisma.article.findMany({
    where: publishedFilter,
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getCategoriesForSitemap() {
  return prisma.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getArticlesForNewsSitemap(maxAgeHours = 48) {
  const since = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

  return prisma.article.findMany({
    where: {
      ...publishedFilter,
      publishedAt: { gte: since },
    },
    select: {
      slug: true,
      title: true,
      metaTitle: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });
}
