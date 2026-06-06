import type { Source as DbSource, Category as DbCategory } from "@prisma/client";
import { SourceType as DbSourceType } from "@prisma/client";
import { categories as staticCategories } from "@/data/categories";
import { prisma } from "./prisma";
import type { MockSource, SourceFetchType, SourceKind, SourceUrlType } from "@/data/types";
import { isPortalRssUrl } from "@/lib/ai-engine/scraper";

export type SourceWithMeta = MockSource & {
  category: { id: string; name: string };
  articleCount: number;
};

function staticIdFromSlug(slug: string | undefined): string {
  return staticCategories.find((c) => c.slug === slug)?.id ?? slug ?? "1";
}

function slugFromStaticId(categoryId: string): string | undefined {
  return staticCategories.find((c) => c.id === categoryId)?.slug;
}

function inferKind(row: DbSource): SourceKind {
  if (row.type === DbSourceType.RSS) return "RSS";
  if (row.name.toLowerCase().includes("bakanlığı") || row.name.includes("Cumhurbaşkanlığı")) {
    return "MINISTRY";
  }
  return "MANUAL";
}

function inferFetchType(row: DbSource): SourceFetchType {
  if (isPortalRssUrl(row.url)) return "WEB";
  if (row.type === DbSourceType.RSS) return "RSS";
  if (row.url.includes("rss") || row.url.endsWith(".xml")) return "RSS";
  return "WEB";
}

function inferUrlType(row: DbSource): SourceUrlType {
  if (isPortalRssUrl(row.url)) return "SITE";
  if (row.type === DbSourceType.RSS || row.url.includes("rss") || row.url.endsWith(".xml")) {
    return "RSS";
  }
  return "SITE";
}

function mapDbSourceType(fetchType?: SourceFetchType, kind?: SourceKind): DbSourceType {
  if (fetchType === "RSS") return DbSourceType.RSS;
  if (kind === "MINISTRY") return DbSourceType.WEB_FEED;
  return DbSourceType.MANUAL;
}

export function mapDbSourceToMock(
  row: DbSource & { category?: DbCategory | null },
  articleCount = 0
): SourceWithMeta {
  const categorySlug = row.category?.slug;
  const staticCategoryId = staticIdFromSlug(categorySlug);

  return {
    id: row.id,
    name: row.name,
    url: row.url,
    type: "RSS",
    kind: inferKind(row),
    fetchType: inferFetchType(row),
    urlType: inferUrlType(row),
    isActive: row.isActive,
    trustScore: row.trustScore,
    categoryId: staticCategoryId,
    lastFetchedAt: row.lastFetchedAt?.toISOString() ?? null,
    fetchIntervalMin: row.fetchIntervalMinutes,
    lastFetchError: row.lastFetchError ?? null,
    articlesImported: row.articlesFetched,
    category: row.category
      ? { id: staticCategoryId, name: row.category.name }
      : { id: staticCategoryId, name: "Genel" },
    articleCount,
  };
}

async function resolveDbCategoryId(categoryId: string): Promise<string | null> {
  const slug = slugFromStaticId(categoryId);
  if (slug) {
    const bySlug = await prisma.category.findUnique({ where: { slug } });
    if (bySlug) return bySlug.id;
  }

  const byId = await prisma.category.findUnique({ where: { id: categoryId } });
  return byId?.id ?? null;
}

export async function listSourcesFromDb(): Promise<SourceWithMeta[]> {
  const rows = await prisma.source.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const counts = await prisma.article.groupBy({
    by: ["sourceId"],
    _count: { _all: true },
    where: { sourceId: { not: null } },
  });
  const countMap = new Map(counts.map((c) => [c.sourceId!, c._count._all]));

  return rows.map((row) => mapDbSourceToMock(row, countMap.get(row.id) ?? 0));
}

export async function getSourceFromDb(id: string): Promise<SourceWithMeta | null> {
  const row = await prisma.source.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!row) return null;

  const articleCount = await prisma.article.count({ where: { sourceId: id } });
  return mapDbSourceToMock(row, articleCount);
}

export async function createSourceInDb(data: {
  name: string;
  url: string;
  kind?: SourceKind;
  fetchType?: SourceFetchType;
  urlType?: SourceUrlType;
  isActive?: boolean;
  trustScore?: number;
  categoryId: string;
  fetchIntervalMin?: number;
}): Promise<SourceWithMeta> {
  const dbCategoryId = await resolveDbCategoryId(data.categoryId);
  if (!dbCategoryId) {
    throw new Error("Kategori bulunamadı");
  }

  const fetchType = data.fetchType ?? (data.url.includes("rss") || data.url.endsWith(".xml") ? "RSS" : "WEB");

  const row = await prisma.source.create({
    data: {
      name: data.name,
      url: data.url,
      type: mapDbSourceType(fetchType, data.kind),
      trustScore: data.trustScore ?? 0.8,
      isActive: data.isActive ?? true,
      categoryId: dbCategoryId,
      fetchIntervalMinutes: data.fetchIntervalMin ?? 1,
    },
    include: { category: true },
  });

  return mapDbSourceToMock(row, 0);
}

export async function updateSourceInDb(
  id: string,
  data: Partial<MockSource>
): Promise<SourceWithMeta | null> {
  const existing = await prisma.source.findUnique({ where: { id } });
  if (!existing) return null;

  const patch: Parameters<typeof prisma.source.update>[0]["data"] = {};

  if (data.name !== undefined) patch.name = data.name;
  if (data.url !== undefined) patch.url = data.url;
  if (data.isActive !== undefined) patch.isActive = data.isActive;
  if (data.trustScore !== undefined) patch.trustScore = data.trustScore;
  if (data.lastFetchedAt !== undefined) {
    patch.lastFetchedAt = data.lastFetchedAt ? new Date(data.lastFetchedAt) : null;
  }
  if (data.lastFetchError !== undefined) patch.lastFetchError = data.lastFetchError;
  if (data.articlesImported !== undefined) patch.articlesFetched = data.articlesImported;
  if (data.fetchIntervalMin !== undefined) patch.fetchIntervalMinutes = data.fetchIntervalMin;
  if (data.fetchType !== undefined || data.kind !== undefined) {
    patch.type = mapDbSourceType(data.fetchType ?? inferFetchType(existing), data.kind);
  }
  if (data.categoryId !== undefined) {
    const dbCategoryId = await resolveDbCategoryId(data.categoryId);
    if (dbCategoryId) patch.categoryId = dbCategoryId;
  }

  const row = await prisma.source.update({
    where: { id },
    data: patch,
    include: { category: true },
  });

  const articleCount = await prisma.article.count({ where: { sourceId: id } });
  return mapDbSourceToMock(row, articleCount);
}

export async function deleteSourceFromDb(id: string): Promise<void> {
  await prisma.source.delete({ where: { id } });
}

export async function listCategoriesFromDb() {
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((row) => ({
    id: staticIdFromSlug(row.slug),
    dbId: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    color: row.color,
    sortOrder: row.sortOrder,
  }));
}
