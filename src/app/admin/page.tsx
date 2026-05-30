import { getAdminDashboardStats } from "@/lib/services/admin";
import { formatDateTime } from "@/lib/utils/date";
import { Eye, Newspaper, Rss, Sparkles, ListOrdered } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const { total, published, rssSources, pendingAI, lastFetch, queue } = await getAdminDashboardStats();

  const stats = [
    { label: "Toplam Haber", value: total, icon: Newspaper, color: "text-blue-600", href: "/admin/articles" },
    { label: "Yayında", value: published, icon: Eye, color: "text-green-600", href: "/admin/published" },
    { label: "Kuyruk", value: queue.total, icon: ListOrdered, color: "text-purple-600", href: "/admin/queue" },
    { label: "Bekleyen", value: pendingAI, icon: Sparkles, color: "text-amber-600", href: "/admin/pending" },
    { label: "Aktif Kaynak", value: rssSources, icon: Rss, color: "text-orange-600", href: "/admin/sources" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ulubek Medya haber ajansı yönetim paneli</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {lastFetch && (
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Son AI Taraması</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDateTime(lastFetch.createdAt.toISOString())} — {lastFetch.status} —{" "}
            {lastFetch.itemsImported} haber yayınlandı
          </p>
        </div>
      )}
    </div>
  );
}
