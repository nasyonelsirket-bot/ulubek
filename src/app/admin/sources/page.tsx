import { prisma } from "@/lib/prisma";
import SourcesManager from "@/components/admin/SourcesManager";

export default async function AdminSourcesPage() {
  const [sources, categories] = await Promise.all([
    prisma.source.findMany({
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { articles: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const serialized = sources.map((s) => ({
    ...s,
    lastFetchedAt: s.lastFetchedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">RSS Kaynak Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Haber kaynaklarını ekleyin, periyodik tarama ayarlarını yönetin
        </p>
      </div>
      <SourcesManager initialSources={serialized} categories={categories} />
    </div>
  );
}
