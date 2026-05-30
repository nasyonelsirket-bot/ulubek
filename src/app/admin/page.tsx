import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Eye, Rss, Sparkles } from "lucide-react";
import ProcessPendingButton from "@/components/admin/ProcessPendingButton";

export default async function AdminDashboard() {
  const [total, published, rssSources, pendingAI, lastFetch] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.source.count({ where: { isActive: true, type: "RSS" } }),
    prisma.article.count({ where: { aiProcessed: false, status: "DRAFT" } }),
    prisma.rssFetchLog.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const stats = [
    { label: "Toplam Haber", value: total, icon: Newspaper, color: "text-blue-600" },
    { label: "Yayında", value: published, icon: Eye, color: "text-green-600" },
    { label: "AI Bekleyen", value: pendingAI, icon: Sparkles, color: "text-purple-600" },
    { label: "Aktif RSS", value: rssSources, icon: Rss, color: "text-orange-600" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ProcessPendingButton pendingCount={pendingAI} />
      {lastFetch && (
        <p className="mt-4 text-sm text-muted-foreground">
          Son RSS taraması: {lastFetch.createdAt.toLocaleString("tr-TR")} — {lastFetch.message}
        </p>
      )}
    </div>
  );
}
