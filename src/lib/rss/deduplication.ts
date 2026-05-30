import { prisma } from "@/lib/prisma";
import { normalizeTitle } from "@/lib/utils/slug";
import { hashTitle } from "@/lib/utils/content";
import type { ParsedFeedItem } from "./parser";

export type DuplicateReason =
  | "sourceUrl"
  | "externalId"
  | "contentHash"
  | "similarTitle";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: DuplicateReason;
}

export async function checkDuplicate(
  item: ParsedFeedItem,
  sourceId: string
): Promise<DuplicateCheckResult> {
  if (item.link) {
    const byUrl = await prisma.article.findUnique({
      where: { sourceUrl: item.link },
      select: { id: true },
    });
    if (byUrl) return { isDuplicate: true, reason: "sourceUrl" };
  }

  if (item.guid) {
    const byGuid = await prisma.article.findFirst({
      where: { sourceId, externalId: item.guid },
      select: { id: true },
    });
    if (byGuid) return { isDuplicate: true, reason: "externalId" };
  }

  const contentHash = hashTitle(item.title);
  const byHash = await prisma.article.findFirst({
    where: { contentHash },
    select: { id: true },
  });
  if (byHash) return { isDuplicate: true, reason: "contentHash" };

  const normalized = normalizeTitle(item.title);
  if (normalized.length >= 20) {
    const recentArticles = await prisma.article.findMany({
      where: {
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { title: true },
      take: 500,
    });

    for (const article of recentArticles) {
      const existing = normalizeTitle(article.title);
      if (existing === normalized) {
        return { isDuplicate: true, reason: "similarTitle" };
      }
      if (existing.length > 30 && normalized.length > 30) {
        if (existing.includes(normalized) || normalized.includes(existing)) {
          return { isDuplicate: true, reason: "similarTitle" };
        }
      }
    }
  }

  return { isDuplicate: false };
}
