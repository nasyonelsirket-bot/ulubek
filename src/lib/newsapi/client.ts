import { getSettings } from "@/lib/settings/store";
import type { NewsApiFeed } from "./feeds";

const BASE = "https://newsapi.org/v2";

export interface NewsApiArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  source: { id: string | null; name: string };
}

interface NewsApiResponse {
  status: string;
  totalResults?: number;
  articles?: NewsApiArticle[];
  message?: string;
  code?: string;
}

export function getNewsApiKey(): string {
  const fromSettings = getSettings().newsApiKey?.trim();
  if (fromSettings) return fromSettings;
  return process.env.NEWS_API_KEY?.trim() || "";
}

export function isNewsApiConfigured(): boolean {
  return Boolean(getNewsApiKey());
}

export async function fetchNewsApiFeed(feed: NewsApiFeed): Promise<NewsApiArticle[]> {
  const apiKey = getNewsApiKey();
  if (!apiKey) {
    throw new Error("NewsAPI anahtarı yapılandırılmamış");
  }

  const params = new URLSearchParams({
    apiKey,
    pageSize: String(feed.pageSize ?? 10),
    language: feed.country === "tr" || !feed.sources ? "tr" : "en",
  });

  if (feed.sources) {
    params.set("sources", feed.sources);
  } else {
    if (feed.country) params.set("country", feed.country);
    if (feed.category) params.set("category", feed.category);
  }

  const url = `${BASE}/top-headlines?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "UlubekMedya/2.0 (+https://ulubekmedya.com)" },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NewsAPI HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as NewsApiResponse;

  if (data.status !== "ok") {
    throw new Error(data.message || `NewsAPI hatası (${data.code ?? "unknown"})`);
  }

  return (data.articles ?? []).filter((a) => a.title && a.url && a.title !== "[Removed]");
}

export function newsApiArticleToContent(article: NewsApiArticle): string {
  const parts = [
    article.description,
    article.content?.replace(/\[\+\d+ chars\]$/i, "").trim(),
  ].filter(Boolean);
  const combined = parts.join("\n\n").trim();
  if (combined.length >= 80) return combined;
  return `${article.title}. ${combined}`.trim();
}
