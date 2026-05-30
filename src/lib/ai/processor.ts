import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils/slug";
import { calcReadTime, hashTitle } from "@/lib/utils/content";
import { notifyArticlePublished } from "@/lib/live/notify";
import { isOpenAIAvailable, processWithOpenAI } from "./openai";
import { processWithLocalEngine } from "./local-engine";
import type { AIProcessedResult } from "./types";

export interface ProcessArticleResult {
  articleId: string;
  success: boolean;
  engine: "openai" | "local";
  error?: string;
}

async function resolveUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
  let base = slugify(baseTitle);
  if (!base) base = `haber-${Date.now()}`;

  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

async function syncTags(articleId: string, tagNames: string[]): Promise<void> {
  await prisma.articleTag.deleteMany({ where: { articleId } });

  for (const name of tagNames) {
    const tagSlug = slugify(name);
    if (!tagSlug) continue;

    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name, slug: tagSlug },
    });

    await prisma.articleTag.create({
      data: { articleId, tagId: tag.id },
    });
  }
}

async function runAIEngine(input: {
  title: string;
  content: string;
  excerpt?: string | null;
  sourceName?: string;
}): Promise<{ result: AIProcessedResult; engine: "openai" | "local" }> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, description: true },
  });

  const aiInput = {
    title: input.title,
    content: input.content,
    excerpt: input.excerpt || undefined,
    sourceName: input.sourceName,
    categories,
  };

  if (isOpenAIAvailable()) {
    try {
      const result = await processWithOpenAI(aiInput);
      return { result, engine: "openai" };
    } catch (err) {
      console.warn("[AI] OpenAI hatası, yerel motora geçiliyor:", err);
    }
  }

  const result = await processWithLocalEngine(aiInput);
  return { result, engine: "local" };
}

export async function processArticleWithAI(articleId: string): Promise<ProcessArticleResult> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { source: true },
  });

  if (!article) {
    return { articleId, success: false, engine: "local", error: "Haber bulunamadı" };
  }

  try {
    const originalTitle = article.originalTitle || article.title;
    const originalContent = article.originalContent || article.content;

    const { result, engine } = await runAIEngine({
      title: originalTitle,
      content: originalContent,
      excerpt: article.excerpt,
      sourceName: article.source?.name,
    });

    const category = await prisma.category.findUnique({
      where: { slug: result.categorySlug },
    });

    const categoryId = category?.id || article.categoryId;
    const slug = await resolveUniqueSlug(result.title, article.id);
    const contentHash = hashTitle(result.title);

    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: result.title,
        slug,
        excerpt: result.excerpt,
        content: result.content,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        categoryId,
        breaking: result.breaking,
        readTime: calcReadTime(result.content),
        contentHash,
        status: ArticleStatus.PUBLISHED,
        aiProcessed: true,
        aiProcessedAt: new Date(),
        aiProcessingError: null,
        originalTitle: originalTitle,
        originalContent: originalContent,
        publishedAt: article.aiProcessed ? article.publishedAt : new Date(),
      },
    });

    await syncTags(articleId, result.tags);

    await notifyArticlePublished(articleId);

    return { articleId, success: true, engine };
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI işleme hatası";

    await prisma.article.update({
      where: { id: articleId },
      data: {
        aiProcessingError: message,
        status: ArticleStatus.DRAFT,
      },
    });

    return { articleId, success: false, engine: "local", error: message };
  }
}

export async function processPendingArticles(limit = 20): Promise<ProcessArticleResult[]> {
  const pending = await prisma.article.findMany({
    where: {
      aiProcessed: false,
      OR: [
        { status: ArticleStatus.DRAFT },
        { aiProcessingError: { not: null } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  const results: ProcessArticleResult[] = [];
  for (const { id } of pending) {
    results.push(await processArticleWithAI(id));
  }
  return results;
}
