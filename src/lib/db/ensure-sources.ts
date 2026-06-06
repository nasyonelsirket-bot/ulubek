import { SourceType } from "@prisma/client";
import { PORTAL_LIVE_FEEDS } from "@/data/portal-live-feeds";
import { categories as staticCategories } from "@/data/categories";
import { getPortalUrlsForPhase } from "@/config/news-sync-phase";
import { checkDatabaseConnection, prisma } from "./prisma";

function portalFeedsForCurrentPhase() {
  const allowed = getPortalUrlsForPhase();
  return PORTAL_LIVE_FEEDS.filter((f) => allowed.has(f.url));
}

/** RSS dışı tüm kaynakları pasifleştirir — yalnızca 2 portal kalır. */
export async function deactivateNonPortalSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const portalUrls = PORTAL_LIVE_FEEDS.map((f) => f.url);
  const result = await prisma.source.updateMany({
    where: { url: { notIn: portalUrls } },
    data: { isActive: false },
  });
  return result.count;
}

/** RSS kaynakları artık kullanılmıyor — mevcut RSS kayıtlarını pasifleştirir. */
export async function ensureDefaultRssSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const result = await prisma.source.updateMany({
    where: { type: SourceType.RSS },
    data: { isActive: false },
  });
  return result.count;
}

/** Haberler.com / SonDakika.com portal feed kaynaklarını ekler; diğerlerini kapatır. */
export async function ensurePortalLiveSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const activeFeeds = portalFeedsForCurrentPhase();

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

  await deactivateNonPortalSources();

  return upserted;
}

/** Portal kaynaklarının tarama sayaçlarını sıfırlar. */
export async function resetPortalSourceFetchState(): Promise<void> {
  if (!(await checkDatabaseConnection())) return;
  const urls = PORTAL_LIVE_FEEDS.map((f) => f.url);
  await prisma.source.updateMany({
    where: { url: { in: urls } },
    data: { lastFetchedAt: null, lastFetchError: null, articlesFetched: 0 },
  });
}

/** JSON fallback — yalnızca portal kaynakları */
export function buildMockSourcesFromFeeds() {
  const portalFeeds = portalFeedsForCurrentPhase();
  return portalFeeds.map((feed, i) => {
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
}
