import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { RawArticle } from "@/data/types";
import type { MockSource } from "@/data/types";
import { articles as seedArticles } from "@/data/articles";
import { sources as seedSources } from "@/data/sources";

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const ARTICLES_FILE = path.join(RUNTIME_DIR, "articles.json");
const SOURCES_FILE = path.join(RUNTIME_DIR, "sources.json");
const SEEN_FILE = path.join(RUNTIME_DIR, "seen.json");

function ensureDir() {
  if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function getAllSourcesFromStore(): MockSource[] {
  const runtime = readJson<MockSource[]>(SOURCES_FILE, []);
  const map = new Map<string, MockSource>();
  for (const s of seedSources) map.set(s.id, s);
  for (const s of runtime) map.set(s.id, s);
  return Array.from(map.values());
}

export function saveSource(source: MockSource) {
  const runtime = readJson<MockSource[]>(SOURCES_FILE, []);
  const idx = runtime.findIndex((s) => s.id === source.id);
  if (idx >= 0) runtime[idx] = source;
  else runtime.push(source);
  writeJson(SOURCES_FILE, runtime);
}

export function deleteSource(id: string) {
  const runtime = readJson<MockSource[]>(SOURCES_FILE, []).filter((s) => s.id !== id);
  writeJson(SOURCES_FILE, runtime);
}

export function getDynamicArticles(): RawArticle[] {
  return readJson<RawArticle[]>(ARTICLES_FILE, []);
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
  writeJson(ARTICLES_FILE, articles.slice(0, 500));
}

export function getSeenUrls(): Set<string> {
  const arr = readJson<string[]>(SEEN_FILE, []);
  return new Set(arr);
}

export function markSeen(url: string) {
  const seen = getSeenUrls();
  seen.add(url);
  writeJson(SEEN_FILE, Array.from(seen).slice(-5000));
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
