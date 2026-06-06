import type { MockSource } from "./types";
import { TURKISH_RSS_FEEDS } from "./turkish-rss-feeds";
import { categories } from "./categories";
import { MINISTRY_SOURCES } from "./ministry-sources";

function slugToCategoryId(slug: string): string {
  return categories.find((c) => c.slug === slug)?.id ?? "1";
}

const RSS_SOURCES: MockSource[] = TURKISH_RSS_FEEDS.map((feed, i) => ({
  id: `rss-${i + 1}`,
  name: feed.name,
  url: feed.url,
  type: "RSS",
  kind: "RSS",
  fetchType: "RSS",
  urlType: "RSS",
  isActive: true,
  trustScore: feed.trustScore,
  categoryId: slugToCategoryId(feed.categorySlug),
  lastFetchedAt: null,
  fetchIntervalMin: feed.fetchIntervalMin ?? 1,
  lastFetchError: null,
  articlesImported: 0,
}));

export const sources: MockSource[] = [
  ...RSS_SOURCES,
  ...MINISTRY_SOURCES.map((s, i) => ({
    ...s,
    id: `ministry-${i + 1}`,
    lastFetchedAt: null as string | null,
  })),
];

export function getSourceById(id: string): MockSource | undefined {
  return sources.find((s) => s.id === id);
}

export { TURKISH_RSS_FEEDS };
