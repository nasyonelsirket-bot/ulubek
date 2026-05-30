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
import {
  getAllSourcesFromStore,
  getSeenUrls,
  markSeen,
  saveArticle,
  updateSourceFetchTime,
  getAllArticlesFromStore,
} from "./store";
import { appendPipelineLog } from "./pipeline-log";
import { scrapeWebsite, scrapeArticlePage, isRssUrl } from "./scraper";
import { addQueueItem, updateQueueItem, isUrlInQueue } from "./queue";
import type { RawArticle } from "@/data/types";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "UlubekMedya-AI-Engine/2.0 (+https://ulubekmedya.com)" },
});

export interface PipelineResult {
  sourceId: string;
  sourceName: string;
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
  sources: PipelineResult[];
  timestamp: string;
}

export interface PipelineOptions {
  sourceId?: string;
  force?: boolean;
  respectInterval?: boolean;
  trigger?: "cron" | "manual" | "single";
}

interface FeedItem {
  title: string;
  link: string;
  content: string;
  publishedAt?: string;
  sourceImage?: string;
}

function resolveUrlType(source: MockSource): SourceUrlType {
  if (source.urlType) return source.urlType;
  if (resolveFetchType(source) === "RSS") return "RSS";
  return "SITE";
}

function shouldFetchSource(source: MockSource, force: boolean, respectInterval: boolean): boolean {
  if (force) return true;
  if (!respectInterval) return true;
  if (!source.lastFetchedAt) return true;
  const elapsed = Date.now() - new Date(source.lastFetchedAt).getTime();
  return elapsed >= source.fetchIntervalMin * 60 * 1000;
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

export async function runAutoNewsPipeline(options: PipelineOptions = {}): Promise<PipelineSummary> {
  const {
    sourceId,
    force = false,
    respectInterval = !force,
    trigger = sourceId ? "single" : force ? "manual" : "cron",
  } = options;

  let sources = getAllSourcesFromStore().filter((s) => s.isActive);
  if (sourceId) {
    sources = sources.filter((s) => s.id === sourceId);
  } else if (respectInterval) {
    sources = sources.filter((s) => shouldFetchSource(s, false, true));
  }

  const results: PipelineResult[] = [];
  let totalImported = 0;
  let totalSkipped = 0;

  for (const source of sources) {
    if (!shouldFetchSource(source, force, respectInterval)) continue;
    const result = await processSource(source);
    results.push(result);
    totalImported += result.imported;
    totalSkipped += result.skipped;
  }

  const summary: PipelineSummary = {
    processed: results.length,
    imported: totalImported,
    skipped: totalSkipped,
    sources: results,
    timestamp: new Date().toISOString(),
  };

  if (results.length > 0) {
    appendPipelineLog(summary, trigger, sourceId);
  }

  return summary;
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

async function fetchItemsFromSource(source: MockSource): Promise<FeedItem[]> {
  const settings = getSettings();
  const lookback = settings.scanLookbackDays;
  const urlType = resolveUrlType(source);

  if (urlType === "ARTICLE") {
    const detail = await scrapeArticlePage(source.url);
    if (!detail) return [];
    if (detail.publishedAt && !isWithinLookbackDays(detail.publishedAt, lookback)) return [];
    return [{ title: detail.title, link: detail.url, content: detail.content, publishedAt: detail.publishedAt, sourceImage: detail.image }];
  }

  if (urlType === "RSS" || resolveFetchType(source) === "RSS") {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? [])
      .filter((item) => isWithinLookbackDays(item.pubDate || item.isoDate, lookback))
      .slice(0, 8)
      .map((item) => ({
        title: item.title?.trim() || "",
        link: item.link || item.guid || "",
        content: item.contentSnippet || item.content || item.summary || item.title || "",
        publishedAt: item.pubDate || item.isoDate,
        sourceImage: extractRssImage(item as Record<string, unknown>),
      }));
  }

  const links = await scrapeWebsite(source.url, 12);
  const items: FeedItem[] = [];

  for (const link of links.slice(0, 8)) {
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
  }
  return items;
}

async function processSource(source: MockSource): Promise<PipelineResult> {
  const result: PipelineResult = {
    sourceId: source.id,
    sourceName: source.name,
    imported: 0,
    skipped: 0,
    duplicate: 0,
    spam: 0,
    errors: [],
  };

  try {
    const items = await fetchItemsFromSource(source);
    const seen = getSeenUrls();
    const existingArticles = getAllArticlesFromStore();
    const articleIndex = buildExistingArticleIndex(existingArticles);
    const categoryList = categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
    }));

    for (const item of items) {
      const link = item.link;
      const title = item.title;
      const rawContent = item.content;

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
        updateQueueItem(queueEntry.id, { status: "REJECTED", error: preCheck.reason });
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
          updateQueueItem(queueEntry.id, { status: "REJECTED", error: postCheck.reason });
          continue;
        }

        const categorySlug = aiResult.categorySlug || matchCategory(title, rawContent, source.categoryId);
        const articleId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const imageResult = await resolveArticleImage({
          title: aiResult.title,
          categorySlug,
          sourceImageUrl: item.sourceImage,
          articleId,
          breaking: aiResult.breaking,
        });
        const slug = uniqueSlug(aiResult.title);

        const article: RawArticle = {
          id: articleId,
          title: aiResult.title,
          slug,
          excerpt: aiResult.excerpt,
          content: aiResult.content,
          categoryId: getCategoryIdBySlug(categorySlug),
          image: imageResult.url,
          imageSquare: imageResult.urlSquare,
          imageStory: imageResult.urlStory,
          publishedAt: new Date().toISOString(),
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

        saveArticle(article);
        if (link) markSeen(link);
        articleIndex.titles.push(aiResult.title);
        articleIndex.contentHashes.add(contentHash(aiResult.content));
        updateQueueItem(queueEntry.id, {
          status: "PUBLISHED",
          articleId: article.id,
          imagePrompt: `[${imageResult.provider}] ${imageResult.prompt}`,
        });
        void notifyArticlePublished(article.id);
        result.imported++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "İşleme hatası";
        result.errors.push(msg);
        updateQueueItem(queueEntry.id, { status: "REJECTED", error: msg });
        result.skipped++;
      }
    }

    updateSourceFetchTime(source.id, null, result.imported);
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
