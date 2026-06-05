/** NewsAPI feed tanımları — her biri ayrı kategori/kaynak. */
export interface NewsApiFeed {
  id: string;
  name: string;
  categorySlug: string;
  /** top-headlines country (ISO 3166-1) */
  country?: string;
  /** top-headlines category */
  category?: "business" | "entertainment" | "general" | "health" | "science" | "sports" | "technology";
  /** Virgülle ayrılmış kaynak ID'leri (dünya haberleri için) */
  sources?: string;
  pageSize?: number;
}

export const NEWSAPI_FEEDS: NewsApiFeed[] = [
  {
    id: "tr-gundem",
    name: "NewsAPI — Türkiye Gündem",
    country: "tr",
    categorySlug: "gundem",
    pageSize: 10,
  },
  {
    id: "tr-ekonomi",
    name: "NewsAPI — Türkiye Ekonomi",
    country: "tr",
    category: "business",
    categorySlug: "ekonomi",
    pageSize: 8,
  },
  {
    id: "tr-spor",
    name: "NewsAPI — Türkiye Spor",
    country: "tr",
    category: "sports",
    categorySlug: "spor",
    pageSize: 8,
  },
  {
    id: "tr-teknoloji",
    name: "NewsAPI — Türkiye Teknoloji",
    country: "tr",
    category: "technology",
    categorySlug: "teknoloji",
    pageSize: 8,
  },
  {
    id: "world",
    name: "NewsAPI — Dünya",
    sources: "bbc-news,reuters,associated-press,al-jazeera-english",
    categorySlug: "dunya",
    pageSize: 10,
  },
];

export function getNewsApiFeedById(id: string): NewsApiFeed | undefined {
  return NEWSAPI_FEEDS.find((f) => f.id === id);
}
