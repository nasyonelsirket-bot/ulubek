import { getAdminDashboardStats } from "@/lib/services/admin";
import { Eye, Newspaper, Rss, Sparkles } from "lucide-react";

export default async function AdminDashboard() {
  const { total, published, rssSources, pendingAI, lastFetch } = await getAdminDashboardStats();

  const stats = [
    { label: "Toplam Haber", value: total, icon: Newspaper, color: "text-blue-600" },
    { label: "Yayında", value: published, icon: Eye, color: "text-green-600" },
    { label: "AI Bekleyen", value: pendingAI, icon: Sparkles, color: "text-purple-600" },
    { label: "Aktif RSS", value: rssSources, icon: Rss, color: "text-orange-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ulubek Medya yönetim paneli (mock veri)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {lastFetch && (
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Son RSS Taraması (Mock)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {lastFetch.createdAt.toLocaleString("tr-TR")} — {lastFetch.status} —{" "}
            {lastFetch.itemsImported} haber içe aktarıldı
          </p>
        </div>
      )}
    </div>
  );
}
