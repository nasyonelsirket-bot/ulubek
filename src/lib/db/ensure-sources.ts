import { SourceType } from "@prisma/client";
import { TURKISH_RSS_FEEDS } from "@/data/turkish-rss-feeds";
import { categories as staticCategories } from "@/data/categories";
import { checkDatabaseConnection, prisma } from "./prisma";

/** Supabase'e varsayılan Türk RSS kaynaklarını ekler / günceller (cron başında). */
export async function ensureDefaultRssSources(): Promise<number> {
  if (!(await checkDatabaseConnection())) return 0;

  const dbCategories = await prisma.category.findMany();
  const slugToId = Object.fromEntries(dbCategories.map((c) => [c.slug, c.id]));

  let upserted = 0;

  for (const feed of TURKISH_RSS_FEEDS) {
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

  return upserted;
}

/** JSON fallback için statik kaynak listesi */
export function buildMockSourcesFromFeeds() {
  return TURKISH_RSS_FEEDS.map((feed, i) => {
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
}
