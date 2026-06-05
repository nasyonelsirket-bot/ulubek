import { getAllSources, getEngineStats } from "@/lib/services/admin";
import { getAllCategories } from "@/lib/services/articles";
import { getNewsApiStatusForAdmin } from "@/lib/newsapi/pipeline";
import SourcesManager from "@/components/admin/SourcesManager";
import SourceEngineDashboard from "@/components/admin/SourceEngineDashboard";
import NewsApiSyncPanel from "@/components/admin/NewsApiSyncPanel";

export default async function AdminSourcesPage() {
  const [sources, categories, engineStats, newsApiStatus] = await Promise.all([
    getAllSources(),
    getAllCategories(),
    getEngineStats(),
    Promise.resolve(getNewsApiStatusForAdmin()),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Kaynak Yönetim Paneli</h1>
        <p className="text-sm text-muted-foreground">
          NewsAPI · RSS kaynakları · AI haber ajansı · duplicate kontrol · otomatik yayın
        </p>
      </div>

      <NewsApiSyncPanel initial={newsApiStatus} />

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
