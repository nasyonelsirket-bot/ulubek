import type { Article, ArticleStatus, Category, Tag } from "@prisma/client";
import { categories as staticCategories } from "@/data/categories";
import { contentHash } from "@/lib/ai-engine/duplicate-check";
import { slugify } from "@/lib/utils/slug";
import { prisma, checkDatabaseConnection } from "./prisma";
import type { RawArticle } from "@/data/types";

type ArticleWithRelations = Article & {
  category: Category;
  tags: { tag: Tag }[];
  source: { id: string; name: string } | null;
};

function staticIdFromSlug(slug: string): string {
  return staticCategories.find((c) => c.slug === slug)?.id ?? "1";
}

export function mapPrismaArticleToRaw(row: ArticleWithRelations): RawArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content,
    categoryId: staticIdFromSlug(row.category.slug),
    image: row.image ?? "",
    publishedAt: row.publishedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    readTime: row.readTime,
    featured: row.featured,
    breaking: row.breaking,
    tags: row.tags.map((t) => t.tag.name),
    status: row.status as RawArticle["status"],
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    sourceName: row.source?.name ?? null,
    aiProcessed: row.aiProcessed,
    aiProcessingError: row.aiProcessingError,
  };
}

export async function resolveDbCategoryId(categorySlug: string): Promise<string | null> {
  const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
  return cat?.id ?? null;
}

export async function getExistingArticlesForPipeline(): Promise<RawArticle[]> {
  if (!(await checkDatabaseConnection())) return [];
  const rows = await prisma.article.findMany({
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: { select: { id: true, name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 500,
  });
  return rows.map(mapPrismaArticleToRaw);
}

export async function isDuplicateSourceUrl(url: string): Promise<boolean> {
  if (!url || !(await checkDatabaseConnection())) return false;
  const found = await prisma.article.findUnique({ where: { sourceUrl: url } });
  return Boolean(found);
}

export async function getExistingSourceUrlsFromDb(limit = 2000): Promise<string[]> {
  if (!(await checkDatabaseConnection())) return [];
  const rows = await prisma.article.findMany({
    where: { sourceUrl: { not: null } },
    select: { sourceUrl: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => r.sourceUrl!).filter(Boolean);
}

export interface SavePipelineArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  image: string;
  imageSquare?: string;
  imageStory?: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  breaking: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string;
  originalTitle?: string;
  originalContent?: string;
}

export async function savePipelineArticleToDb(
  input: SavePipelineArticleInput
): Promise<RawArticle | null> {
  if (!(await checkDatabaseConnection())) return null;

  if (input.sourceUrl) {
    const dup = await prisma.article.findUnique({ where: { sourceUrl: input.sourceUrl } });
    if (dup) return null;
  }

  const categoryId = await resolveDbCategoryId(input.categorySlug);
  if (!categoryId) return null;

  let sourceId: string | undefined;
  if (input.sourceId) {
    const src = await prisma.source.findUnique({ where: { id: input.sourceId }, select: { id: true } });
    if (src) sourceId = src.id;
  }

  const tagRecords = await Promise.all(
    input.tags.slice(0, 8).map(async (name) => {
      const tagSlug = slugify(name);
      return prisma.tag.upsert({
        where: { slug: tagSlug },
        create: { name, slug: tagSlug },
        update: {},
      });
    })
  );

  const row = await prisma.article.create({
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      image: input.image,
      status: "PUBLISHED",
      featured: input.featured,
      breaking: input.breaking,
      readTime: input.readTime,
      publishedAt: new Date(input.publishedAt),
      categoryId,
      sourceId,
      sourceUrl: input.sourceUrl,
      contentHash: contentHash(input.content),
      originalTitle: input.originalTitle,
      originalContent: input.originalContent,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      aiProcessed: true,
      aiProcessedAt: new Date(),
      tags: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: { select: { id: true, name: true } },
    },
  });

  if (sourceId) {
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastFetchedAt: new Date(),
        lastFetchError: null,
        articlesFetched: { increment: 1 },
      },
    }).catch(() => undefined);
  }

  return mapPrismaArticleToRaw(row);
}

export async function getPublishedArticlesFromDb(options?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  featured?: boolean;
  breaking?: boolean;
  status?: ArticleStatus;
}): Promise<RawArticle[]> {
  if (!(await checkDatabaseConnection())) return [];

  const rows = await prisma.article.findMany({
    where: {
      status: options?.status ?? "PUBLISHED",
      ...(options?.featured !== undefined ? { featured: options.featured } : {}),
      ...(options?.breaking !== undefined ? { breaking: options.breaking } : {}),
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: { select: { id: true, name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  });

  return rows.map(mapPrismaArticleToRaw);
}

export async function countArticlesInDb(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;
  return prisma.article.count();
}

export async function getArticleBySlugFromDb(slug: string): Promise<RawArticle | null> {
  if (!(await checkDatabaseConnection())) return null;
  const row = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: { select: { id: true, name: true } },
    },
  });
  return row ? mapPrismaArticleToRaw(row) : null;
}

export async function searchArticlesInDb(query: string, limit = 30): Promise<RawArticle[]> {
  if (!(await checkDatabaseConnection())) return [];
  const rows = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
      source: { select: { id: true, name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapPrismaArticleToRaw);
}
