import { unstable_cache } from "next/cache";
import { mapRawArticles } from "@/data/mappers";
import type { ArticleWithRelations } from "@/data/types";
import { HOME_CATEGORY_SLUGS, ARTICLES_PER_CATEGORY } from "@/config/navigation";
import { estimateViewCount } from "@/lib/utils/view-count";
import { getArticleCardsFromDb } from "@/lib/db/articles";

const FEED_PAGE_SIZE = 16;

export type HomePageData = {
  lead: ArticleWithRelations | undefined;
  secondary: ArticleWithRelations[];
  sidebar: ArticleWithRelations[];
  trending: ArticleWithRelations[];
  editorPicks: ArticleWithRelations[];
  categoryArticles: Record<string, ArticleWithRelations[]>;
  feedInitial: ArticleWithRelations[];
  feedHasMore: boolean;
  excludeIds: string[];
};

async function buildHomePageData(): Promise<HomePageData | null> {
  const cards = await getArticleCardsFromDb(160);
  if (cards.length === 0) return null;

  const all = mapRawArticles(cards);
  const featured = all.filter((a) => a.featured);
  const allFeatured = featured.length > 0 ? featured : all;

  const lead = allFeatured[0];
  const secondary = allFeatured.slice(1, 4);
  const heroIds = allFeatured.slice(0, 6).map((a) => a.id);

  const breakingItems = all.filter((a) => a.breaking).slice(0, 10);
  const sidebar = breakingItems.length > 0 ? breakingItems : all.slice(0, 6).filter((a) => !heroIds.includes(a.id));

  const excludeIds = [...new Set([...heroIds, ...sidebar.map((a) => a.id)])];

  const since24 = Date.now() - 24 * 60 * 60 * 1000;
  const trending24 = [...all]
    .filter((a) => a.publishedAt.getTime() >= since24)
    .sort((a, b) => estimateViewCount(b.id, b.publishedAt) - estimateViewCount(a.id, a.publishedAt))
    .slice(0, 10);

  const trending = trending24.length > 0 ? trending24 : all.slice(1, 9);
  const editorPicks = trending24.length > 0 ? trending24.slice(0, 7) : all.filter((a) => !excludeIds.includes(a.id)).slice(0, 7);

  const categoryArticles: Record<string, ArticleWithRelations[]> = {};
  for (const slug of HOME_CATEGORY_SLUGS) {
    categoryArticles[slug] = all.filter((a) => a.category.slug === slug).slice(0, ARTICLES_PER_CATEGORY);
  }

  const feedPool = all.filter((a) => !excludeIds.includes(a.id));
  const feedInitial = feedPool.slice(0, FEED_PAGE_SIZE);

  return {
    lead,
    secondary,
    sidebar,
    trending,
    editorPicks,
    categoryArticles,
    feedInitial,
    feedHasMore: feedPool.length > FEED_PAGE_SIZE,
    excludeIds,
  };
}

export const getHomePageData = unstable_cache(
  buildHomePageData,
  ["homepage-v2"],
  { revalidate: 60, tags: ["articles"] }
);

export { FEED_PAGE_SIZE };
