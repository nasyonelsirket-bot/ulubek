import { SourceType } from "@prisma/client";
import { TURKISH_RSS_FEEDS } from "@/data/turkish-rss-feeds";
import { PORTAL_LIVE_FEEDS } from "@/data/portal-live-feeds";
import { categories as staticCategories } from "@/data/categories";
import { getFeedUrlsForPhase, getPortalUrlsForPhase, getNewsSyncPhase } from "@/config/news-sync-phase";
import { checkDatabaseConnection, prisma } from "./prisma";

function feedsForCurrentPhase() {
  const phase = getNewsSyncPhase();
  const allowed = getFeedUrlsForPhase(phase);
  if (!allowed) return TURKISH_RSS_FEEDS;
  return TURKISH_RSS_FEEDS.filter((f) => allowed.has(f.url));
}

function portalFeedsForCurrentPhase() {
  const phase = getNewsSyncPhase();
  const allowed = getPortalUrlsForPhase(phase);
  if (!allowed) return PORTAL_LIVE_FEEDS;
  return PORTAL_LIVE_FEEDS.filter((f) => allowed.has(f.url));
}

/** Supabase'e fazdaki RSS kaynaklarını ekler; diğerlerini pasifleştirir. */
export async function ensureDefaultRssSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const phase = getNewsSyncPhase();
  const activeFeeds = feedsForCurrentPhase();
  const activeUrls = new Set(activeFeeds.map((f) => f.url));

  const dbCategories = await prisma.category.findMany();
  const slugToId = Object.fromEntries(dbCategories.map((c) => [c.slug, c.id]));

  let upserted = 0;

  for (const feed of activeFeeds) {
    const categoryId = slugToId[feed.categorySlug] ?? slugToId["gundem"];
    if (!categoryId) continue;

    const existing = await prisma.source.findFirst({ where: { url: feed.url } });

    if (existing) {
      await prisma.source.update({
        where: { id: existing.id },
        data: {
          name: feed.name,
          isActive: true,
          trustScore: feed.trustScore,
          fetchIntervalMinutes: feed.fetchIntervalMin ?? 1,
          categoryId,
        },
      });
    } else {
      await prisma.source.create({
        data: {
          name: feed.name,
          url: feed.url,
          type: SourceType.RSS,
          trustScore: feed.trustScore,
          isActive: true,
          categoryId,
          fetchIntervalMinutes: feed.fetchIntervalMin ?? 1,
        },
      });
    }
    upserted++;
  }

  // Faz dışı kaynakları pasifleştir (faz 3 hariç)
  if (phase < 3) {
    await prisma.source.updateMany({
      where: {
        url: { notIn: [...activeUrls] },
        type: SourceType.RSS,
      },
      data: { isActive: false },
    });
  }

  return upserted;
}

/** Haberler.com / SonDakika.com portal feed kaynaklarını ekler. */
export async function ensurePortalLiveSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const phase = getNewsSyncPhase();
  const activeFeeds = portalFeedsForCurrentPhase();
  const activeUrls = new Set(activeFeeds.map((f) => f.url));

  const dbCategories = await prisma.category.findMany();
  const slugToId = Object.fromEntries(dbCategories.map((c) => [c.slug, c.id]));

  let upserted = 0;

  for (const feed of activeFeeds) {
    const categoryId = slugToId[feed.categorySlug] ?? slugToId["gundem"];
    if (!categoryId) continue;

    const existing = await prisma.source.findFirst({ where: { url: feed.url } });

    if (existing) {
      await prisma.source.update({
        where: { id: existing.id },
        data: {
          name: feed.name,
          isActive: true,
          trustScore: feed.trustScore,
          fetchIntervalMinutes: feed.fetchIntervalMin ?? 1,
          categoryId,
          type: SourceType.WEB_FEED,
        },
      });
    } else {
      await prisma.source.create({
        data: {
          name: feed.name,
          url: feed.url,
          type: SourceType.WEB_FEED,
          trustScore: feed.trustScore,
          isActive: true,
          categoryId,
          fetchIntervalMinutes: feed.fetchIntervalMin ?? 1,
        },
      });
    }
    upserted++;
  }

  if (phase < 3) {
    await prisma.source.updateMany({
      where: {
        url: { in: PORTAL_LIVE_FEEDS.map((f) => f.url).filter((u) => !activeUrls.has(u)) },
        type: SourceType.WEB_FEED,
      },
      data: { isActive: false },
    });
  }

  return upserted;
}

/** JSON fallback için statik kaynak listesi */
export function buildMockSourcesFromFeeds() {
  const activeFeeds = feedsForCurrentPhase();
  const portalFeeds = portalFeedsForCurrentPhase();
  const rssMocks = activeFeeds.map((feed, i) => {
    const cat = staticCategories.find((c) => c.slug === feed.categorySlug);
    return {
      id: `rss-${i + 1}`,
      name: feed.name,
      url: feed.url,
      type: "RSS" as const,
      kind: "RSS" as const,
      fetchType: "RSS" as const,
      urlType: "RSS" as const,
      isActive: true,
      trustScore: feed.trustScore,
      categoryId: cat?.id ?? "1",
      lastFetchedAt: null as string | null,
      fetchIntervalMin: feed.fetchIntervalMin ?? 1,
      lastFetchError: null,
      articlesImported: 0,
    };
  });
  const portalMocks = portalFeeds.map((feed, i) => {
    const cat = staticCategories.find((c) => c.slug === feed.categorySlug);
    return {
      id: `portal-${i + 1}`,
      name: feed.name,
      url: feed.url,
      type: "MANUAL" as const,
      kind: "MANUAL" as const,
      fetchType: "WEB" as const,
      urlType: "SITE" as const,
      isActive: true,
      trustScore: feed.trustScore,
      categoryId: cat?.id ?? "1",
      lastFetchedAt: null as string | null,
      fetchIntervalMin: feed.fetchIntervalMin ?? 1,
      lastFetchError: null,
      articlesImported: 0,
    };
  });
  return [...rssMocks, ...portalMocks];
}
