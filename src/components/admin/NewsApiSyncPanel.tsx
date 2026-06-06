"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Rss, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/date";
import { readApiJson, apiFailed } from "@/lib/api/client";

export interface NewsApiAdminStatus {
  configured: boolean;
  enabled: boolean;
  keyPreview: string;
  feeds: Array<{
    id: string;
    name: string;
    categorySlug: string;
    categoryName: string;
  }>;
  sync: {
    lastSyncAt: string | null;
    lastSyncStatus: string;
    lastImported: number;
    lastFound: number;
    lastSkipped: number;
    lastDuplicate: number;
    lastError: string | null;
    feeds: Array<{
      id: string;
      name: string;
      found: number;
      imported: number;
      skipped: number;
      duplicate: number;
      lastFetchedAt: string | null;
      error?: string;
    }>;
  };
}

interface NewsApiSyncPanelProps {
  initial: NewsApiAdminStatus;
}

export default function NewsApiSyncPanel({ initial }: NewsApiSyncPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  async function refreshStatus() {
    const res = await fetch("/api/admin/newsapi/status");
    const data = await readApiJson<{ success?: boolean; data?: NewsApiAdminStatus }>(res);
    if (data.data) setStatus(data.data);
  }

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/newsapi/sync", { method: "POST" });
      const data = await readApiJson<{
        success?: boolean;
        error?: string;
        started?: boolean;
        async?: boolean;
        message?: string;
        imported?: number;
        found?: number;
      }>(res);

      if (apiFailed(data, res)) {
        setMessage(data.error || "Senkronizasyon başarısız");
        return;
      }

      if (data.started || data.async) {
        setMessage(data.message || "NewsAPI senkronizasyonu arka planda başladı.");
        window.setTimeout(() => refreshStatus(), 15000);
        window.setTimeout(() => {
          refreshStatus();
          router.refresh();
        }, 45000);
        return;
      }

      setMessage(
        `Senkronizasyon tamamlandı: ${data.found ?? 0} bulundu · ${data.imported ?? 0} yayınlandı`
      );
      await refreshStatus();
      router.refresh();
    } finally {
      setSyncing(false);
    }
  }

  const syncOk = status.sync.lastSyncStatus === "success";
  const syncErr = status.sync.lastSyncStatus === "error";
  const syncRunning = status.sync.lastSyncStatus === "running";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rss className="h-5 w-5 text-primary" />
            NewsAPI Senkronizasyonu
          </CardTitle>
          <Button onClick={handleSync} disabled={syncing || !status.configured} size="sm">
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Manuel Senkronize Et
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">{message}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">API Durumu</p>
              <div className="mt-1 flex items-center gap-2">
                {status.configured ? (
                  <Badge variant="default" className="bg-green-600">Bağlı {status.keyPreview}</Badge>
                ) : (
                  <Badge variant="destructive">Anahtar eksik</Badge>
                )}
                {!status.enabled && <Badge variant="secondary">Devre dışı</Badge>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Son Senkronizasyon</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                <Clock className="h-3.5 w-3.5" />
                {status.sync.lastSyncAt ? formatDateTime(status.sync.lastSyncAt) : "Henüz yok"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Durum</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                {syncRunning && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                {syncOk && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {syncErr && <XCircle className="h-4 w-4 text-red-500" />}
                {status.sync.lastSyncStatus}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Son Tur</p>
              <p className="mt-1 text-sm font-medium">
                {status.sync.lastFound} bulundu · {status.sync.lastImported} eklendi ·{" "}
                {status.sync.lastDuplicate} kopya
              </p>
            </div>
          </div>

          {status.sync.lastError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {status.sync.lastError}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Cron: her 60 saniyede otomatik çekim · Türkiye, Ekonomi, Spor, Teknoloji, Dünya
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Haber Kaynakları (NewsAPI)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kaynak</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Son Tur</TableHead>
                <TableHead>Bulundu</TableHead>
                <TableHead>Eklendi</TableHead>
                <TableHead>Kopya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status.feeds.map((feed) => {
                const run = status.sync.feeds.find((f) => f.id === feed.id);
                return (
                  <TableRow key={feed.id}>
                    <TableCell className="font-medium">{feed.name}</TableCell>
                    <TableCell>{feed.categoryName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {run?.lastFetchedAt ? formatDateTime(run.lastFetchedAt) : "—"}
                    </TableCell>
                    <TableCell>{run?.found ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {run?.imported ?? "—"}
                    </TableCell>
                    <TableCell>{run?.duplicate ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
