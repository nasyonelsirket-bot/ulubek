import { getAllSources, getEngineStats } from "@/lib/services/admin";
import { getAllCategories } from "@/lib/services/articles";
import SourcesManager from "@/components/admin/SourcesManager";
import SourceEngineDashboard from "@/components/admin/SourceEngineDashboard";

export default async function AdminSourcesPage() {
  const [sources, categories, engineStats] = await Promise.all([
    getAllSources(),
    getAllCategories(),
    getEngineStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Kaynak Yönetim Paneli</h1>
        <p className="text-sm text-muted-foreground">
          RSS kaynakları · AI haber ajansı · güven puanı · kopya & spam kontrolü · otomatik yayın
        </p>
      </div>

      <SourceEngineDashboard initialStats={engineStats} />

      <SourcesManager
        initialSources={sources.map((s) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          type: s.type,
          kind: s.kind,
          isActive: s.isActive,
          trustScore: s.trustScore,
          fetchIntervalMinutes: s.fetchIntervalMin,
          lastFetchedAt: s.lastFetchedAt,
          lastFetchError: s.lastFetchError ?? null,
          articlesFetched: s.articlesImported ?? 0,
          category: s.category,
          _count: { articles: s.articleCount },
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
