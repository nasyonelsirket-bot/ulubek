import { getCategoryById } from "./categories";
import type { ArticleWithRelations, ArticleStatus, RawArticle } from "./types";

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapRawArticle(raw: RawArticle): ArticleWithRelations | null {
  const category = getCategoryById(raw.categoryId);
  if (!category) return null;

  const publishedAt = new Date(raw.publishedAt);
  const updatedAt = new Date(raw.updatedAt ?? raw.publishedAt);

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    content: raw.content,
    image: raw.image,
    imageSquare: raw.imageSquare ?? null,
    imageStory: raw.imageStory ?? null,
    status: (raw.status ?? "PUBLISHED") as ArticleStatus,
    featured: raw.featured,
    breaking: raw.breaking,
    readTime: raw.readTime,
    publishedAt,
    updatedAt,
    createdAt: publishedAt,
    categoryId: raw.categoryId,
    category,
    tags: raw.tags.map((name) => ({
      tag: {
        id: slugifyTag(name),
        name,
        slug: slugifyTag(name),
      },
    })),
    source: raw.sourceName ? { id: "mock-source", name: raw.sourceName } : null,
    metaTitle: raw.metaTitle ?? null,
    metaDescription: raw.metaDescription ?? null,
    aiProcessed: raw.aiProcessed ?? false,
    aiProcessingError: raw.aiProcessingError ?? null,
  };
}

export function mapRawArticles(rawArticles: RawArticle[]): ArticleWithRelations[] {
  return rawArticles
    .map(mapRawArticle)
    .filter((article): article is ArticleWithRelations => article !== null);
}
