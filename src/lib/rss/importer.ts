import { ArticleStatus, Source } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchAndParseFeed } from "./parser";
import { checkDuplicate } from "./deduplication";
import { slugify } from "@/lib/utils/slug";
import { toHtmlParagraphs, truncate } from "@/lib/utils/content";
import { hashTitle } from "@/lib/utils/content";
import { processArticleWithAI } from "@/lib/ai/processor";

export interface FetchResult {
  sourceId: string;
  sourceName: string;
  fetched: number;
  created: number;
  skipped: number;
  processed: number;
  errors: number;
  error?: string;
}

async function resolveUniqueSlug(baseTitle: string): Promise<string> {
  let base = slugify(baseTitle);
  if (!base) base = `haber-${Date.now()}`;

  let slug = base;
  let counter = 1;
  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

async function resolveCategoryId(source: Source): Promise<string> {
  if (source.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: source.categoryId } });
    if (cat) return cat.id;
  }

  const defaultCategory = await prisma.category.findFirst({
    orderBy: { sortOrder: "asc" },
  });

  if (!defaultCategory) {
    throw new Error("Veritabanında kategori bulunamadı");
  }

  return defaultCategory.id;
}

export async function fetchRssSource(sourceId: string): Promise<FetchResult> {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });

  if (!source) {
    return {
      sourceId,
      sourceName: "Bilinmeyen",
      fetched: 0,
      created: 0,
      skipped: 0,
      processed: 0,
      errors: 1,
      error: "Kaynak bulunamadı",
    };
  }

  if (!source.isActive) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      fetched: 0,
      created: 0,
      skipped: 0,
      processed: 0,
      errors: 0,
      error: "Kaynak pasif",
    };
  }

  if (source.type !== "RSS") {
    return {
      sourceId: source.id,
      sourceName: source.name,
      fetched: 0,
      created: 0,
      skipped: 0,
      processed: 0,
      errors: 1,
      error: "Sadece RSS kaynakları taranabilir",
    };
  }

  let fetched = 0;
  let created = 0;
  let skipped = 0;
  let processed = 0;
  let errors = 0;

  try {
    const items = await fetchAndParseFeed(source.url);
    fetched = items.length;

    const categoryId = await resolveCategoryId(source);

    for (const item of items) {
      try {
        const duplicate = await checkDuplicate(item, source.id);
        if (duplicate.isDuplicate) {
          skipped++;
          continue;
        }

        const slug = await resolveUniqueSlug(item.title);
        const htmlContent = item.content.includes("<")
          ? item.content
          : toHtmlParagraphs(item.content || item.excerpt);
        const excerpt = truncate(item.excerpt || item.content, 300);
        const contentHash = hashTitle(item.title);

        const article = await prisma.article.create({
          data: {
            title: item.title,
            slug,
            excerpt,
            content: htmlContent,
            image: item.image,
            status: ArticleStatus.DRAFT,
            publishedAt: item.publishedAt,
            readTime: 3,
            categoryId,
            sourceId: source.id,
            externalId: item.guid || undefined,
            sourceUrl: item.link || undefined,
            contentHash,
            originalTitle: item.title,
            originalContent: htmlContent,
            aiProcessed: false,
          },
        });

        created++;

        const aiResult = await processArticleWithAI(article.id);
        if (aiResult.success) {
          processed++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    await prisma.source.update({
      where: { id: source.id },
      data: {
        lastFetchedAt: new Date(),
        lastFetchError: null,
        articlesFetched: { increment: processed },
      },
    });

    await prisma.rssFetchLog.create({
      data: {
        sourceId: source.id,
        status: errors > 0 ? "partial" : "success",
        fetched,
        created: processed,
        skipped,
        errors,
        message: `${source.name}: ${created} yeni, ${processed} AI ile yayınlandı, ${skipped} atlandı`,
      },
    });

    return {
      sourceId: source.id,
      sourceName: source.name,
      fetched,
      created,
      skipped,
      processed,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";

    await prisma.source.update({
      where: { id: source.id },
      data: {
        lastFetchedAt: new Date(),
        lastFetchError: message,
      },
    });

    await prisma.rssFetchLog.create({
      data: {
        sourceId: source.id,
        status: "error",
        fetched,
        created: processed,
        skipped,
        errors: errors + 1,
        message,
      },
    });

    return {
      sourceId: source.id,
      sourceName: source.name,
      fetched,
      created,
      skipped,
      processed,
      errors: errors + 1,
      error: message,
    };
  }
}

export async function fetchAllActiveRssSources(): Promise<FetchResult[]> {
  const now = new Date();

  const sources = await prisma.source.findMany({
    where: { isActive: true, type: "RSS" },
    orderBy: { lastFetchedAt: "asc" },
  });

  const dueSources = sources.filter((source) => {
    if (!source.lastFetchedAt) return true;
    const intervalMs = source.fetchIntervalMinutes * 60 * 1000;
    return now.getTime() - source.lastFetchedAt.getTime() >= intervalMs;
  });

  const results: FetchResult[] = [];
  for (const source of dueSources) {
    results.push(await fetchRssSource(source.id));
  }

  return results;
}

export async function fetchAllRssSourcesForce(): Promise<FetchResult[]> {
  const sources = await prisma.source.findMany({
    where: { isActive: true, type: "RSS" },
  });

  const results: FetchResult[] = [];
  for (const source of sources) {
    results.push(await fetchRssSource(source.id));
  }

  return results;
}
