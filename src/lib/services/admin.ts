import { categories } from "@/data/categories";
import {
  getAllSourcesFromStore,
  saveSource,
  deleteSource as removeSource,
  countArticlesBySourceName,
} from "@/lib/ai-engine/store";
import { getPipelineLogs, getLastRunAt, getTotalImportedCount } from "@/lib/ai-engine/pipeline-log";
import { getQueueStats } from "@/lib/ai-engine/queue";
import { isOpenAIAvailable } from "@/lib/ai/openai";
import { runAutoNewsPipeline, processSingleSource } from "@/lib/ai-engine/pipeline";
import type { MockSource, SourceKind, SourceFetchType } from "@/data/types";

export async function getEngineStats() {
  const sources = getAllSourcesFromStore();
  const logs = getPipelineLogs();

  return {
    totalSources: sources.length,
    activeSources: sources.filter((s) => s.isActive).length,
    totalImported: getTotalImportedCount(),
    lastRunAt: getLastRunAt(),
    openAiEnabled: isOpenAIAvailable(),
    cronIntervalMin: 1,
    features: [
      "Web sitesi tarama (URL)",
      "RSS tarama (opsiyonel)",
      "AI özgünleştirme",
      "SEO başlık & meta",
      "AI kapak görseli",
      "Kopya kontrolü",
      "Spam filtresi",
      "Otomatik yayın",
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
  const all = await getAllSources();
  return all.find((s) => s.id === id) ?? null;
}

export async function addSource(data: {
  name: string;
  url: string;
  type?: string;
  kind?: SourceKind;
  fetchType?: SourceFetchType;
  isActive?: boolean;
  trustScore?: number;
  categoryId: string;
  fetchIntervalMin?: number;
}): Promise<MockSource> {
  const fetchType = data.fetchType ?? (data.url.includes("rss") || data.url.endsWith(".xml") ? "RSS" : "WEB");
  const source: MockSource = {
    id: `src-${Date.now()}`,
    name: data.name,
    url: data.url,
    type: "RSS",
    kind: data.kind ?? "MANUAL",
    fetchType,
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
  const existing = getAllSourcesFromStore().find((s) => s.id === id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  saveSource(updated);
  return updated;
}

export async function deleteSource(id: string) {
  removeSource(id);
  return true;
}

export async function fetchSingleSource(sourceId: string) {
  const result = await processSingleSource(sourceId);
  if (!result) {
    return { success: false, error: "Kaynak bulunamadı veya pasif" };
  }
  return {
    success: true,
    sourceId,
    sourceName: result.sourceName,
    itemsImported: result.imported,
    skipped: result.skipped,
    duplicate: result.duplicate,
    spam: result.spam,
    errors: result.errors,
  };
}

export async function fetchAllSources() {
  const summary = await runAutoNewsPipeline({ force: true, trigger: "manual" });
  return summary;
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
