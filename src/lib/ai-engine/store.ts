import type { RawArticle } from "@/data/types";
import type { MockSource } from "@/data/types";
import { articles as seedArticles } from "@/data/articles";
import { sources as seedSources } from "@/data/sources";
import { readRuntimeJson, writeRuntimeJson } from "@/lib/runtime/paths";

export function getAllSourcesFromStore(): MockSource[] {
  const runtime = readRuntimeJson<MockSource[]>("sources.json", []);
  const map = new Map<string, MockSource>();
  for (const s of seedSources) map.set(s.id, s);
  for (const s of runtime) map.set(s.id, s);
  return Array.from(map.values());
}

export function saveSource(source: MockSource) {
  const runtime = readRuntimeJson<MockSource[]>("sources.json", []);
  const idx = runtime.findIndex((s) => s.id === source.id);
  if (idx >= 0) runtime[idx] = source;
  else runtime.push(source);
  writeRuntimeJson("sources.json", runtime);
}

export function deleteSource(id: string) {
  const runtime = readRuntimeJson<MockSource[]>("sources.json", []).filter((s) => s.id !== id);
  writeRuntimeJson("sources.json", runtime);
}

export function getDynamicArticles(): RawArticle[] {
  return readRuntimeJson<RawArticle[]>("articles.json", []);
}

export function getAllArticlesFromStore(): RawArticle[] {
  const dynamic = getDynamicArticles();
  const ids = new Set(dynamic.map((a) => a.id));
  const merged = [...dynamic];
  for (const a of seedArticles) {
    if (!ids.has(a.id)) merged.push(a);
  }
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function saveArticle(article: RawArticle) {
  const articles = getDynamicArticles();
  const idx = articles.findIndex((a) => a.id === article.id || a.slug === article.slug);
  if (idx >= 0) articles[idx] = article;
  else articles.unshift(article);
  writeRuntimeJson("articles.json", articles.slice(0, 500));
}

export function getSeenUrls(): Set<string> {
  const arr = readRuntimeJson<string[]>("seen.json", []);
  return new Set(arr);
}

export function markSeen(url: string) {
  const seen = getSeenUrls();
  seen.add(url);
  writeRuntimeJson("seen.json", Array.from(seen).slice(-5000));
}

export function clearPipelineRuntimeState() {
  writeRuntimeJson("seen.json", []);
  writeRuntimeJson("articles.json", []);
}

export function updateSourceFetchTime(id: string, error?: string | null, imported = 0) {
  const sources = getAllSourcesFromStore();
  const source = sources.find((s) => s.id === id);
  if (source) {
    saveSource({
      ...source,
      lastFetchedAt: new Date().toISOString(),
      lastFetchError: error ?? null,
      articlesImported: (source.articlesImported ?? 0) + imported,
    });
  }
}

export function countArticlesBySourceName(sourceName: string): number {
  return getAllArticlesFromStore().filter((a) => a.sourceName === sourceName).length;
}

export function getDynamicArticleCount(): number {
  return getDynamicArticles().length;
}

export function getPublishedArticleCount(): number {
  return getAllArticlesFromStore().filter((a) => (a.status ?? "PUBLISHED") === "PUBLISHED").length;
}
