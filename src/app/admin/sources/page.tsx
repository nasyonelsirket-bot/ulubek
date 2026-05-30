import { getAllSources } from "@/lib/services/admin";
import { getAllCategories } from "@/lib/services/articles";
import SourcesManager from "@/components/admin/SourcesManager";

export default async function AdminSourcesPage() {
  const [sources, categories] = await Promise.all([
    getAllSources(),
    getAllCategories(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">RSS Kaynakları</h1>
        <p className="text-sm text-muted-foreground">Kaynak yönetimi (mock veri)</p>
      </div>
      <SourcesManager
        initialSources={sources.map((s) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          type: s.type,
          isActive: s.isActive,
          trustScore: s.trustScore,
          fetchIntervalMinutes: s.fetchIntervalMin,
          lastFetchedAt: s.lastFetchedAt,
          lastFetchError: null,
          articlesFetched: 12,
          category: s.category,
          _count: { articles: 6 },
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
