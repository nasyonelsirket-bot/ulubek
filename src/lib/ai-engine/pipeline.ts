import Parser from "rss-parser";
import type { MockSource, SourceFetchType, SourceUrlType } from "@/data/types";
import { processArticleWithAI } from "@/lib/ai/engine";
import { categories } from "@/data/categories";
import { slugify } from "@/lib/utils/slug";
import { calcReadTime } from "@/lib/utils/content";
import { resolveArticleImage } from "./resolve-image";
import { matchCategory, getCategoryIdBySlug } from "./category-matcher";
import { isWithinLookbackDays } from "@/lib/ai/content-formatter";
import { getSettings } from "@/lib/settings/store";
import {
  checkContentBeforePublish,
  buildExistingArticleIndex,
  contentHash,
} from "./duplicate-check";
import { notifyArticlePublished } from "@/lib/live/notify";
import { publishArticleToSocial } from "@/lib/social/publish";
import {
  savePipelineArticleToDb,
  getExistingArticlesForPipeline,
  countArticlesInDb,
} from "@/lib/db/articles";
import { getActiveSourcesForPipeline } from "@/lib/db/pipeline-sources";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import {
  getAllSourcesFromStore,
  getSeenUrls,
  markSeen,
  saveArticle,
  updateSourceFetchTime,
  getAllArticlesFromStore,
  getDynamicArticleCount,
} from "./store";
import { appendPipelineLog } from "./pipeline-log";
import { scrapeWebsite, scrapeArticlePage, isRssUrl } from "./scraper";
import { addQueueItem, updateQueueItem, isUrlInQueue } from "./queue";
import { BOOTSTRAP_ARTICLE_TARGET } from "./runtime-init";
import type { RawArticle } from "@/data/types";

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "UlubekMedya-AI-Engine/2.0 (+https://ulubekmedya.com)" },
});

export interface PipelineResult {
  sourceId: string;
  sourceName: string;
  found: number;
  imported: number;
  skipped: number;
  duplicate: number;
  spam: number;
  errors: string[];
}

export interface PipelineSummary {
  processed: number;
  imported: number;
  skipped: number;
  found: number;
  sources: PipelineResult[];
  timestamp: string;
  bootstrap?: boolean;
}

export interface PipelineOptions {
  sourceId?: string;
  force?: boolean;
  respectInterval?: boolean;
  bootstrap?: boolean;
  trigger?: "cron" | "manual" | "single" | "bootstrap";
}

interface FeedItem {
  title: string;
  link: string;
  content: string;
  publishedAt?: string;
  sourceImage?: string;
}

export type { FeedItem };

function resolveUrlType(source: MockSource): SourceUrlType {
  if (source.urlType) return source.urlType;
  if (resolveFetchType(source) === "RSS") return "RSS";
  return "SITE";
}

function shouldFetchSource(source: MockSource, force: boolean, respectInterval: boolean): boolean {
  if (force) return true;
  if (!respectInterval) return true;
  if (!source.lastFetchedAt) return true;
  const intervalMin = source.fetchIntervalMin ?? 1;
  const elapsed = Date.now() - new Date(source.lastFetchedAt).getTime();
  return elapsed >= intervalMin * 60 * 1000;
}

function resolveFetchType(source: MockSource): SourceFetchType {
  if (source.fetchType) return source.fetchType;
  if (isRssUrl(source.url)) return "RSS";
  return "WEB";
}

function isDuplicateReason(reason?: string): boolean {
  return (
    reason === "duplicate_url" ||
    reason === "duplicate_title" ||
    reason === "duplicate_content"
  );
}

async function enrichItemContent(item: FeedItem): Promise<FeedItem> {
  if (item.content.length >= 120 || !item.link) return item;
  try {
    const detail = await scrapeArticlePage(item.link);
    if (!detail) return item;
    return {
      ...item,
      title: detail.title || item.title,
      content: detail.content.length > item.content.length ? detail.content : item.content,
      sourceImage: item.sourceImage || detail.image,
      publishedAt: item.publishedAt || detail.publishedAt,
    };
  } catch {
    return item;
  }
}

export async function runAutoNewsPipeline(options: PipelineOptions = {}): Promise<PipelineSummary> {
  const {
    sourceId,
    force = false,
    respectInterval = !force,
    bootstrap = false,
    trigger = sourceId ? "single" : bootstrap ? "bootstrap" : force ? "manual" : "cron",
  } = options;

  let sources = (await getActiveSourcesForPipeline()).filter((s) => s.isActive);
  if (sourceId) {
    sources = sources.filter((s) => s.id === sourceId);
  } else if (respectInterval && !bootstrap) {
    sources = sources.filter((s) => shouldFetchSource(s, false, true));
  }

  const results: PipelineResult[] = [];
  let totalImported = 0;
  let totalSkipped = 0;
  let totalFound = 0;

  if (sources.length === 0) {
    const summary: PipelineSummary = {
      processed: 0,
      imported: 0,
      skipped: 0,
      found: 0,
      sources: [],
      timestamp: new Date().toISOString(),
      bootstrap,
    };
    appendPipelineLog(summary, trigger, sourceId, "Aktif kaynak bulunamadı veya tarama aralığı dolmadı");
    return summary;
  }

  for (const source of sources) {
    if (!shouldFetchSource(source, force || bootstrap, respectInterval && !bootstrap)) continue;
    const result = await processSource(source, bootstrap);
    results.push(result);
    totalImported += result.imported;
    totalSkipped += result.skipped;
    totalFound += result.found;
  }

  const summary: PipelineSummary = {
    processed: results.length,
    imported: totalImported,
    skipped: totalSkipped,
    found: totalFound,
    sources: results,
    timestamp: new Date().toISOString(),
    bootstrap,
  };

  appendPipelineLog(summary, trigger, sourceId);
  return summary;
}

export async function runBootstrapImport(maxRounds = 8): Promise<PipelineSummary> {
  let lastSummary: PipelineSummary | null = null;
  let rounds = 0;

  async function articleCount(): Promise<number> {
    if (await checkDatabaseConnection()) return countArticlesInDb();
    return getDynamicArticleCount();
  }

  while ((await articleCount()) < BOOTSTRAP_ARTICLE_TARGET && rounds < maxRounds) {
    lastSummary = await runAutoNewsPipeline({
      force: true,
      bootstrap: true,
      respectInterval: false,
      trigger: "bootstrap",
    });
    rounds++;
    if (lastSummary.imported === 0 && lastSummary.found === 0) break;
  }

  return (
    lastSummary ?? {
      processed: 0,
      imported: 0,
      skipped: 0,
      found: 0,
      sources: [],
      timestamp: new Date().toISOString(),
      bootstrap: true,
    }
  );
}

export async function processSingleSource(sourceId: string): Promise<PipelineResult | null> {
  const summary = await runAutoNewsPipeline({
    sourceId,
    force: true,
    respectInterval: false,
    trigger: "single",
  });
  return summary.sources[0] ?? null;
}

function extractRssImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && (enclosure.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp)/i.test(enclosure.url))) {
    return enclosure.url;
  }
  const media = item["media:content"] as { $?: { url?: string } } | undefined;
  if (media?.$?.url) return media.$.url;
  const thumb = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;
  const content = String(item.content || item["content:encoded"] || "");
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

async function fetchItemsFromSource(source: MockSource, bootstrap: boolean): Promise<FeedItem[]> {
  const settings = getSettings();
  const lookback = settings.scanLookbackDays;
  const itemLimit = bootstrap ? 30 : 12;
  const urlType = resolveUrlType(source);

  if (urlType === "ARTICLE") {
    const detail = await scrapeArticlePage(source.url);
    if (!detail) return [];
    if (detail.publishedAt && !isWithinLookbackDays(detail.publishedAt, lookback)) return [];
    return [{ title: detail.title, link: detail.url, content: detail.content, publishedAt: detail.publishedAt, sourceImage: detail.image }];
  }

  if (urlType === "RSS" || resolveFetchType(source) === "RSS") {
    let feed;
    try {
      feed = await parser.parseURL(source.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "RSS okunamadı";
      throw new Error(`RSS hatası (${source.name}): ${msg}`);
    }

    const rawItems = (feed.items ?? [])
      .filter((item) => isWithinLookbackDays(item.pubDate || item.isoDate, lookback))
      .slice(0, itemLimit)
      .map((item) => ({
        title: item.title?.trim() || "",
        link: item.link || item.guid || "",
        content: item.contentSnippet || item.content || item.summary || item.title || "",
        publishedAt: item.pubDate || item.isoDate,
        sourceImage: extractRssImage(item as Record<string, unknown>),
      }));

    const enriched: FeedItem[] = [];
    for (const item of rawItems) {
      if (!item.title || !item.link) continue;
      enriched.push(await enrichItemContent(item));
    }
    return enriched;
  }

  const links = await scrapeWebsite(source.url, itemLimit);
  const items: FeedItem[] = [];

  for (const link of links) {
    if (isUrlInQueue(link.url)) continue;
    const detail = await scrapeArticlePage(link.url);
    if (detail?.publishedAt && !isWithinLookbackDays(detail.publishedAt, lookback)) continue;
    items.push({
      title: detail?.title || link.title,
      link: link.url,
      content: detail?.content || link.content,
      publishedAt: detail?.publishedAt,
      sourceImage: detail?.image,
    });
    if (items.length >= itemLimit) break;
  }
  return items;
}

async function processSource(source: MockSource, bootstrap = false): Promise<PipelineResult> {
  try {
    const items = await fetchItemsFromSource(source, bootstrap);
    if (items.length === 0) {
      const empty: PipelineResult = {
        sourceId: source.id,
        sourceName: source.name,
        found: 0,
        imported: 0,
        skipped: 0,
        duplicate: 0,
        spam: 0,
        errors: ["Son 10 günde haber bulunamadı"],
      };
      updateSourceFetchTime(source.id, null, 0);
      return empty;
    }
    return processItemsWithSource(source, items, bootstrap);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Kaynak tarama hatası";
    updateSourceFetchTime(source.id, msg, 0);
    return {
      sourceId: source.id,
      sourceName: source.name,
      found: 0,
      imported: 0,
      skipped: 0,
      duplicate: 0,
      spam: 0,
      errors: [msg],
    };
  }
}

/** RSS, WEB veya NewsAPI'den gelen maddeleri AI pipeline'dan geçirir. */
export async function processItemsWithSource(
  source: MockSource,
  items: FeedItem[],
  bootstrap = false,
  defaultCategorySlug?: string
): Promise<PipelineResult> {
  const result: PipelineResult = {
    sourceId: source.id,
    sourceName: source.name,
    found: items.length,
    imported: 0,
    skipped: 0,
    duplicate: 0,
    spam: 0,
    errors: [],
  };

  try {
    if (items.length === 0) {
      updateSourceFetchTime(source.id, null, 0);
      return result;
    }

    const seen = getSeenUrls();
    const dbArticles = await getExistingArticlesForPipeline();
    const jsonArticles = getAllArticlesFromStore();
    const mergedIds = new Set(dbArticles.map((a) => a.id));
    const existingArticles = [
      ...dbArticles,
      ...jsonArticles.filter((a) => !mergedIds.has(a.id)),
    ];
    const articleIndex = buildExistingArticleIndex(existingArticles);
    const categoryList = categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
    }));

    for (const item of items) {
      const link = item.link;
      let title = item.title;
      let rawContent = item.content;

      if (rawContent.length < 80 && link) {
        const enriched = await enrichItemContent(item);
        title = enriched.title;
        rawContent = enriched.content;
      }

      const queueEntry = addQueueItem({
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl: link || source.url,
        originalTitle: title,
        originalContent: rawContent,
        status: "SCANNED",
      });

      const preCheck = checkContentBeforePublish({
        url: link,
        title,
        content: rawContent,
        trustScore: source.trustScore,
        seenUrls: seen,
        existingTitles: articleIndex.titles,
        existingContentHashes: articleIndex.contentHashes,
      });

      if (!preCheck.allowed) {
        result.skipped++;
        if (preCheck.reason === "spam") result.spam++;
        else if (isDuplicateReason(preCheck.reason)) result.duplicate++;
        updateQueueItem(queueEntry.id, { status: "REJECTED", error: preCheck.message ?? preCheck.reason });
        continue;
      }

      if (!title) {
        result.skipped++;
        updateQueueItem(queueEntry.id, { status: "REJECTED", error: "Başlık yok" });
        continue;
      }

      try {
        updateQueueItem(queueEntry.id, { status: "PENDING" });

        const aiResult = await processArticleWithAI({
          title,
          content: rawContent,
          categories: categoryList,
          sourceName: source.name,
        });

        const postCheck = checkContentBeforePublish({
          url: link,
          title: aiResult.title,
          content: aiResult.content,
          trustScore: source.trustScore,
          seenUrls: seen,
          existingTitles: articleIndex.titles,
          existingContentHashes: articleIndex.contentHashes,
        });

        if (!postCheck.allowed) {
          result.skipped++;
          if (postCheck.reason === "spam") result.spam++;
          else if (isDuplicateReason(postCheck.reason)) result.duplicate++;
          updateQueueItem(queueEntry.id, { status: "REJECTED", error: postCheck.message ?? postCheck.reason });
          continue;
        }

        const categorySlug =
          defaultCategorySlug ||
          aiResult.categorySlug ||
          matchCategory(title, rawContent, source.categoryId);
        const articleId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const imageResult = await resolveArticleImage({
          title: aiResult.title,
          categorySlug,
          sourceImageUrl: item.sourceImage,
          articleId,
          breaking: aiResult.breaking,
        });

        const publishedAt = item.publishedAt
          ? new Date(item.publishedAt).toISOString()
          : new Date().toISOString();

        const article: RawArticle = {
          id: articleId,
          title: aiResult.title,
          slug: uniqueSlug(aiResult.title),
          excerpt: aiResult.excerpt,
          content: aiResult.content,
          categoryId: getCategoryIdBySlug(categorySlug),
          image: imageResult.url,
          imageSquare: imageResult.urlSquare,
          imageStory: imageResult.urlStory,
          publishedAt,
          readTime: calcReadTime(aiResult.content),
          featured: source.trustScore >= 0.9,
          breaking: aiResult.breaking,
          tags: aiResult.tags,
          status: "PUBLISHED",
          metaTitle: aiResult.metaTitle,
          metaDescription: aiResult.metaDescription,
          sourceName: source.name,
          aiProcessed: true,
        };

        const dbArticle = await savePipelineArticleToDb({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          categorySlug,
          image: article.image,
          imageSquare: article.imageSquare,
          imageStory: article.imageStory,
          publishedAt: article.publishedAt,
          readTime: article.readTime,
          featured: article.featured,
          breaking: article.breaking,
          tags: article.tags,
          metaTitle: aiResult.metaTitle,
          metaDescription: aiResult.metaDescription,
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: link || undefined,
          originalTitle: title,
          originalContent: rawContent,
        });

        const saved = dbArticle ?? article;
        if (!dbArticle) saveArticle(article);
        else saveArticle(saved);

        if (link) markSeen(link);
        articleIndex.titles.push(aiResult.title);
        articleIndex.contentHashes.add(contentHash(aiResult.content));
        updateQueueItem(queueEntry.id, {
          status: "PUBLISHED",
          articleId: saved.id,
          imagePrompt: `[${imageResult.provider}] ${imageResult.prompt}`,
        });
        void notifyArticlePublished(saved.id);
        void publishArticleToSocial({
          title: saved.title,
          excerpt: saved.excerpt,
          slug: saved.slug,
          breaking: saved.breaking,
          image: saved.image,
        });
        result.imported++;

        const currentCount = await checkDatabaseConnection()
          ? await countArticlesInDb()
          : getDynamicArticleCount();
        if (bootstrap && currentCount >= BOOTSTRAP_ARTICLE_TARGET) break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "İşleme hatası";
        result.errors.push(msg);
        updateQueueItem(queueEntry.id, { status: "REJECTED", error: msg });
        result.skipped++;
      }
    }

    updateSourceFetchTime(source.id, result.errors.length > 0 ? result.errors[0] : null, result.imported);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Kaynak tarama hatası";
    result.errors.push(msg);
    updateSourceFetchTime(source.id, msg, 0);
  }

  return result;
}

function uniqueSlug(title: string): string {
  return `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
}
