import { revalidatePath } from "next/cache";
import type { MockSource } from "@/data/types";
import { categories } from "@/data/categories";
import { getCategoryIdBySlug } from "@/lib/ai-engine/category-matcher";
import {
  processItemsWithSource,
  type PipelineResult,
  type PipelineSummary,
  type FeedItem,
} from "@/lib/ai-engine/pipeline";
import { appendPipelineLog } from "@/lib/ai-engine/pipeline-log";
import {
  fetchNewsApiFeed,
  newsApiArticleToContent,
  isNewsApiConfigured,
  getNewsApiKey,
} from "./client";
import { NEWSAPI_FEEDS, type NewsApiFeed } from "./feeds";
import {
  getNewsApiSyncState,
  saveNewsApiSyncState,
  markNewsApiSyncRunning,
  shouldRunNewsApiSync,
} from "./sync-state";
import { getSettings } from "@/lib/settings/store";

function virtualSource(feed: NewsApiFeed): MockSource {
  return {
    id: `newsapi-${feed.id}`,
    name: feed.name,
    url: "https://newsapi.org/v2/top-headlines",
    type: "RSS",
    kind: "RSS",
    fetchType: "RSS",
    urlType: "RSS",
    isActive: true,
    trustScore: 0.88,
    categoryId: getCategoryIdBySlug(feed.categorySlug),
    lastFetchedAt: null,
    fetchIntervalMin: 1,
    lastFetchError: null,
    articlesImported: 0,
  };
}

function toFeedItems(articles: Awaited<ReturnType<typeof fetchNewsApiFeed>>): FeedItem[] {
  return articles.map((a) => ({
    title: a.title.trim(),
    link: a.url,
    content: newsApiArticleToContent(a),
    publishedAt: a.publishedAt,
    sourceImage: a.urlToImage ?? undefined,
  }));
}

export interface NewsApiPipelineOptions {
  force?: boolean;
  trigger?: "cron" | "manual";
}

export async function runNewsApiPipeline(
  options: NewsApiPipelineOptions = {}
): Promise<PipelineSummary | null> {
  const { force = false, trigger = "cron" } = options;
  const settings = getSettings();

  if (!settings.newsApiEnabled) {
    return null;
  }

  if (!isNewsApiConfigured()) {
    saveNewsApiSyncState({
      ...getNewsApiSyncState(),
      lastSyncStatus: "error",
      lastError: "NewsAPI anahtarı eksik",
      lastSyncAt: new Date().toISOString(),
    });
    return null;
  }

  if (!force && !shouldRunNewsApiSync(60)) {
    return null;
  }

  markNewsApiSyncRunning();

  const results: PipelineResult[] = [];
  const feedStatuses: import("./sync-state").NewsApiFeedStatus[] = [];
  let totalImported = 0;
  let totalSkipped = 0;
  let totalFound = 0;
  let totalDuplicate = 0;
  let globalError: string | null = null;

  for (const feed of NEWSAPI_FEEDS) {
    const feedStatus: import("./sync-state").NewsApiFeedStatus = {
      id: feed.id,
      name: feed.name,
      found: 0,
      imported: 0,
      skipped: 0,
      duplicate: 0,
      lastFetchedAt: new Date().toISOString(),
    };

    try {
      const articles = await fetchNewsApiFeed(feed);
      const items = toFeedItems(articles);
      feedStatus.found = items.length;

      const source = virtualSource(feed);
      const result = await processItemsWithSource(source, items, false, feed.categorySlug);
      results.push(result);

      feedStatus.imported = result.imported;
      feedStatus.skipped = result.skipped;
      feedStatus.duplicate = result.duplicate;
      totalImported += result.imported;
      totalSkipped += result.skipped;
      totalFound += result.found;
      totalDuplicate += result.duplicate;

      if (result.errors.length > 0) {
        feedStatus.error = result.errors.join("; ");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "NewsAPI feed hatası";
      feedStatus.error = msg;
      globalError = msg;
      results.push({
        sourceId: `newsapi-${feed.id}`,
        sourceName: feed.name,
        found: 0,
        imported: 0,
        skipped: 0,
        duplicate: 0,
        spam: 0,
        errors: [msg],
      });
    }

    feedStatuses.push(feedStatus);
  }

  const summary: PipelineSummary = {
    processed: results.length,
    imported: totalImported,
    skipped: totalSkipped,
    found: totalFound,
    sources: results,
    timestamp: new Date().toISOString(),
  };

  appendPipelineLog(summary, trigger === "manual" ? "manual" : "cron", undefined, "NewsAPI senkronizasyonu");

  saveNewsApiSyncState({
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: globalError && totalImported === 0 ? "error" : "success",
    lastImported: totalImported,
    lastFound: totalFound,
    lastSkipped: totalSkipped,
    lastDuplicate: totalDuplicate,
    lastError: globalError,
    feeds: feedStatuses,
  });

  if (totalImported > 0) {
    revalidatePath("/");
    for (const cat of categories) {
      revalidatePath(`/kategori/${cat.slug}`);
    }
  }

  return summary;
}

export function getNewsApiStatusForAdmin() {
  const state = getNewsApiSyncState();
  return {
    configured: isNewsApiConfigured(),
    enabled: getSettings().newsApiEnabled,
    keyPreview: getNewsApiKey() ? `****${getNewsApiKey().slice(-4)}` : "",
    feeds: NEWSAPI_FEEDS.map((f) => ({
      id: f.id,
      name: f.name,
      categorySlug: f.categorySlug,
      categoryName: categories.find((c) => c.slug === f.categorySlug)?.name ?? f.categorySlug,
    })),
    sync: state,
  };
}
