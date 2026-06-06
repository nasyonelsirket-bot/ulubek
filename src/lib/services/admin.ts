import { categories } from "@/data/categories";
import {
  getAllSourcesFromStore,
  saveSource,
  deleteSource as removeSource,
  countArticlesBySourceName,
} from "@/lib/ai-engine/store";
import { getPipelineLogs, getLastRunAt } from "@/lib/ai-engine/pipeline-log";
import { getQueueStats } from "@/lib/ai-engine/queue";
import { getPublicSettings } from "@/lib/settings/store";
import { getActiveAIProvider } from "@/lib/ai/engine";
import { isGeminiAvailable } from "@/lib/ai/gemini";
import { isOpenAIAvailable } from "@/lib/ai/openai";
import { getDynamicArticleCount, getPublishedArticleCount } from "@/lib/ai-engine/store";
import { BOOTSTRAP_ARTICLE_TARGET } from "@/lib/ai-engine/runtime-init";
import { checkDatabaseConnection } from "@/lib/db/prisma";
import {
  listSourcesFromDb,
  getSourceFromDb,
  createSourceInDb,
  updateSourceInDb,
  deleteSourceFromDb,
} from "@/lib/db/sources";
import type { MockSource, SourceKind, SourceFetchType, SourceUrlType } from "@/data/types";

async function dbAvailable(): Promise<boolean> {
  return checkDatabaseConnection();
}

export async function getEngineStats() {
  const dbReady = await dbAvailable();
  const sources = dbReady ? await listSourcesFromDb() : getAllSourcesFromStore();
  const logs = getPipelineLogs();
  const settings = getPublicSettings();

  let totalImported = getDynamicArticleCount();
  let totalPublished = getPublishedArticleCount();

  if (dbReady) {
    const { prisma } = await import("@/lib/db/prisma");
    totalImported = await prisma.article.count();
    totalPublished = await prisma.article.count({ where: { status: "PUBLISHED" } });
  }

  return {
    totalSources: sources.length,
    activeSources: sources.filter((s) => s.isActive).length,
    totalImported,
    totalPublished,
    bootstrapTarget: BOOTSTRAP_ARTICLE_TARGET,
    bootstrapComplete: totalImported >= BOOTSTRAP_ARTICLE_TARGET,
    lastRunAt: getLastRunAt(),
    openAiEnabled: isOpenAIAvailable(),
    geminiEnabled: isGeminiAvailable(),
    activeProvider: getActiveAIProvider(),
    aiProvider: settings.aiProvider,
    imageProvider: settings.imageProvider,
    scanIntervalMin: settings.scanIntervalMin,
    scanLookbackDays: settings.scanLookbackDays,
    features: [
      "Web sitesi / kategori / haber URL tarama",
      "RSS tarama (opsiyonel)",
      "OpenAI + Gemini motor seçimi",
      "1200+ kelime haber üretimi",
      "SEO + OG + Twitter Card",
      "AI kapak görseli (1200x675)",
      "10 gün geriye tarama",
      "1 dk tarama aralığı",
    ],
    recentLogs: logs.slice(0, 15),
  };
}

export async function getAdminDashboardStats() {
  const { getAllArticlesFromStore } = await import("@/lib/ai-engine/store");
  const articles = getAllArticlesFromStore();
  const engine = await getEngineStats();
  const queue = getQueueStats();

  return {
    total: articles.length,
    published: articles.filter((a) => (a.status ?? "PUBLISHED") === "PUBLISHED").length,
    dynamicCount: engine.totalImported,
    bootstrapTarget: BOOTSTRAP_ARTICLE_TARGET,
    rssSources: engine.activeSources,
    pendingAI: queue.pending + queue.scanned,
    queue,
    lastFetch: engine.lastRunAt
      ? {
          createdAt: new Date(engine.lastRunAt),
          status: "SUCCESS",
          itemsImported: engine.recentLogs[0]?.imported ?? 0,
        }
      : null,
  };
}

export async function getAllSources(): Promise<
  (MockSource & {
    category: { id: string; name: string };
    articleCount: number;
  })[]
> {
  if (await dbAvailable()) {
    return listSourcesFromDb();
  }

  const all = getAllSourcesFromStore();
  return all.map((source) => ({
    ...source,
    category: categories.find((c) => c.id === source.categoryId) ?? {
      id: source.categoryId,
      name: "Genel",
    },
    articleCount: countArticlesBySourceName(source.name),
  }));
}

export async function getSourceWithCategory(id: string) {
  if (await dbAvailable()) {
    return getSourceFromDb(id);
  }
  const all = await getAllSources();
  return all.find((s) => s.id === id) ?? null;
}

export async function addSource(data: {
  name: string;
  url: string;
  type?: string;
  kind?: SourceKind;
  fetchType?: SourceFetchType;
  urlType?: SourceUrlType;
  isActive?: boolean;
  trustScore?: number;
  categoryId: string;
  fetchIntervalMin?: number;
}): Promise<MockSource> {
  if (await dbAvailable()) {
    return createSourceInDb(data);
  }

  const fetchType = data.fetchType ?? (data.url.includes("rss") || data.url.endsWith(".xml") ? "RSS" : "WEB");
  const urlType = data.urlType ?? (fetchType === "RSS" ? "RSS" : "SITE");
  const source: MockSource = {
    id: `src-${Date.now()}`,
    name: data.name,
    url: data.url,
    type: "RSS",
    kind: data.kind ?? "MANUAL",
    fetchType,
    urlType,
    isActive: data.isActive ?? true,
    trustScore: data.trustScore ?? 0.8,
    categoryId: data.categoryId,
    lastFetchedAt: null,
    fetchIntervalMin: data.fetchIntervalMin ?? 1,
    lastFetchError: null,
    articlesImported: 0,
  };
  saveSource(source);
  return source;
}

export async function updateSource(id: string, data: Partial<MockSource>) {
  if (await dbAvailable()) {
    return updateSourceInDb(id, data);
  }

  const existing = getAllSourcesFromStore().find((s) => s.id === id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  saveSource(updated);
  return updated;
}

export async function deleteSource(id: string) {
  if (await dbAvailable()) {
    await deleteSourceFromDb(id);
    return true;
  }
  removeSource(id);
  return true;
}

export async function fetchSingleSource(sourceId: string) {
  const { processSingleSource } = await import("@/lib/ai-engine/pipeline");
  const result = await processSingleSource(sourceId);
  if (!result) {
    return { success: false, error: "Kaynak bulunamadı veya pasif" };
  }
  return {
    success: true,
    sourceId,
    sourceName: result.sourceName,
    found: result.found,
    itemsImported: result.imported,
    skipped: result.skipped,
    duplicate: result.duplicate,
    spam: result.spam,
    errors: result.errors,
  };
}

export async function fetchAllSources() {
  const { runFullNewsSync } = await import("@/lib/news/sync-orchestrator");
  const summary = await runFullNewsSync("manual");
  return {
    ...summary,
    bootstrap: false,
    databaseCount: summary.databaseCount,
  };
}

export async function mockUpdateArticle(
  id: string,
  data: Partial<{
    title: string;
    excerpt: string;
    content: string;
    image: string;
    status: import("@/data/types").ArticleStatus;
    featured: boolean;
    breaking: boolean;
    categoryId: string;
    readTime: number;
  }>
) {
  const { getArticleById } = await import("@/lib/services/articles");
  const existing = await getArticleById(id);
  if (!existing) return null;
  return { ...existing, ...data, updatedAt: new Date() };
}

export async function mockProcessArticleWithAI(articleId: string) {
  const { getArticleById } = await import("@/lib/services/articles");
  const article = await getArticleById(articleId);
  if (!article) return { success: false, error: "Haber bulunamadı" };
  return { success: true, articleId, engine: "local" as const };
}
