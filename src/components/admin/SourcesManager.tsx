"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Plus, Trash2, Rss, Play, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MINISTRY_SOURCES } from "@/data/ministry-sources";
import { PORTAL_NEWS_SOURCES } from "@/data/portal-sources";
import type { SourceKind, SourceFetchType, SourceUrlType } from "@/data/types";
import { formatDateTime } from "@/lib/utils/date";
import { apiFailed, readApiJson } from "@/lib/api/client";

interface Category {
  id: string;
  name: string;
}

interface SourceRow {
  id: string;
  name: string;
  url: string;
  type: string;
  kind?: SourceKind;
  isActive: boolean;
  trustScore: number;
  fetchIntervalMinutes: number;
  lastFetchedAt: string | null;
  lastFetchError: string | null;
  articlesFetched: number;
  category: { id: string; name: string } | null;
  _count: { articles: number };
}

interface SourcesManagerProps {
  initialSources: SourceRow[];
  categories: Category[];
}

type FilterTab = "all" | "rss" | "ministry";

const KIND_LABELS: Record<SourceKind, string> = {
  RSS: "RSS",
  MINISTRY: "Bakanlık",
  MANUAL: "Manuel",
};

function trustColor(score: number) {
  if (score >= 0.9) return "text-green-600 dark:text-green-400";
  if (score >= 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function SourcesManager({ initialSources, categories }: SourcesManagerProps) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    url: "",
    kind: "MANUAL" as SourceKind,
    fetchType: "WEB" as SourceFetchType,
    urlType: "SITE" as SourceUrlType,
    categoryId: "",
    fetchIntervalMinutes: 1,
    trustScore: 0.8,
    isActive: true,
  });

  const filtered = useMemo(() => {
    if (filter === "all") return sources;
    if (filter === "rss") return sources.filter((s) => (s.kind ?? "RSS") === "RSS");
    return sources.filter((s) => s.kind === "MINISTRY");
  }, [sources, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          url: form.url,
          kind: form.kind,
          fetchType: form.fetchType,
          urlType: form.urlType,
          isActive: form.isActive,
          trustScore: form.trustScore,
          categoryId: form.categoryId || categories[0]?.id,
          fetchIntervalMin: form.fetchIntervalMinutes,
        }),
      });

      const data = await readApiJson<Record<string, unknown>>(res);
      if (apiFailed(data, res)) {
        setMessage(String(data.error || "Kaynak eklenemedi"));
        return;
      }

      setSources((prev) => [
        {
          id: String(data.id),
          name: String(data.name),
          url: String(data.url),
          type: String(data.type),
          kind: data.kind as SourceKind | undefined,
          isActive: Boolean(data.isActive),
          trustScore: Number(data.trustScore),
          fetchIntervalMinutes: Number(data.fetchIntervalMin),
          lastFetchedAt: null,
          lastFetchError: null,
          articlesFetched: 0,
          category: categories.find((c) => c.id === data.categoryId) ?? null,
          _count: { articles: 0 },
        },
        ...prev,
      ]);
      setForm({
        name: "",
        url: "",
        kind: "MANUAL",
        fetchType: "WEB",
        urlType: "SITE",
        categoryId: "",
        fetchIntervalMinutes: 1,
        trustScore: 0.8,
        isActive: true,
      });
      setShowForm(false);
      setMessage("Kaynak başarıyla eklendi.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function addPortalPreset(preset: (typeof PORTAL_NEWS_SOURCES)[0]) {
    setLoading(`portal-${preset.name}`);
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          url: preset.url,
          kind: preset.kind,
          fetchType: preset.fetchType,
          urlType: preset.urlType,
          isActive: preset.isActive,
          trustScore: preset.trustScore,
          categoryId: preset.categoryId,
          fetchIntervalMin: preset.fetchIntervalMin,
        }),
      });

      const data = await readApiJson<Record<string, unknown>>(res);
      if (apiFailed(data, res)) {
        setMessage(String(data.error || "Portal kaynağı eklenemedi"));
        return;
      }

      setSources((prev) => [
        {
          id: String(data.id),
          name: String(data.name),
          url: String(data.url),
          type: String(data.type),
          kind: data.kind as SourceKind | undefined,
          isActive: Boolean(data.isActive),
          trustScore: Number(data.trustScore),
          fetchIntervalMinutes: Number(data.fetchIntervalMin),
          lastFetchedAt: null,
          lastFetchError: null,
          articlesFetched: 0,
          category: categories.find((c) => c.id === data.categoryId) ?? null,
          _count: { articles: 0 },
        },
        ...prev,
      ]);
      setMessage(`${preset.name} kaynağı eklendi.`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function addMinistryPreset(preset: (typeof MINISTRY_SOURCES)[0]) {
    setLoading(`ministry-${preset.name}`);
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          url: preset.url,
          kind: "MINISTRY",
          fetchType: preset.fetchType ?? "WEB",
          isActive: true,
          trustScore: preset.trustScore,
          categoryId: preset.categoryId,
          fetchIntervalMin: 1,
        }),
      });

      const data = await readApiJson<Record<string, unknown>>(res);
      if (apiFailed(data, res)) {
        setMessage(String(data.error || "Bakanlık kaynağı eklenemedi"));
        return;
      }

      setSources((prev) => [
        {
          id: String(data.id),
          name: String(data.name),
          url: String(data.url),
          type: String(data.type),
          kind: "MINISTRY",
          isActive: true,
          trustScore: Number(data.trustScore),
          fetchIntervalMinutes: 1,
          lastFetchedAt: null,
          lastFetchError: null,
          articlesFetched: 0,
          category: categories.find((c) => c.id === data.categoryId) ?? null,
          _count: { articles: 0 },
        },
        ...prev,
      ]);
      setMessage(`${preset.name} eklendi.`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (res.ok) {
      setSources((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
    }
  }

  async function updateTrustScore(id: string, trustScore: number) {
    const res = await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trustScore }),
    });

    if (res.ok) {
      setSources((prev) => prev.map((s) => (s.id === id ? { ...s, trustScore } : s)));
    }
  }

  async function fetchSource(id: string) {
    setLoading(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/sources/${id}/fetch`, { method: "POST" });
      const data = await readApiJson<{
        success?: boolean;
        error?: string;
        started?: boolean;
        async?: boolean;
        message?: string;
        sourceName?: string;
        found?: number;
        itemsImported?: number;
        skipped?: number;
        duplicate?: number;
        errors?: string[];
      }>(res);

      if (apiFailed(data, res)) {
        setMessage(data.error || data.errors?.join(", ") || "Tarama başarısız");
        return;
      }

      if (data.started || data.async) {
        setMessage(data.message || "Kaynak taraması arka planda başladı.");
        window.setTimeout(() => router.refresh(), 25000);
        return;
      }

      const errText = data.errors?.length ? ` · Hata: ${data.errors.join(", ")}` : "";
      setMessage(
        `${data.sourceName}: ${data.found ?? 0} bulundu · ${data.itemsImported ?? 0} eklendi · ${data.skipped ?? 0} atlandı · ${data.duplicate ?? 0} kopya${errText}`
      );
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function fetchAll(freshStart = false) {
    if (freshStart) {
      const ok = window.confirm(
        "Tüm mevcut haberler silinecek ve Haberler.com + SonDakika.com'dan geçmiş + güncel haberler yeniden yüklenecek. Devam edilsin mi?"
      );
      if (!ok) return;
    }

    setFetchingAll(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources/fetch-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freshStart }),
      });
      const data = await readApiJson<{
        success?: boolean;
        error?: string;
        started?: boolean;
        async?: boolean;
        freshStart?: boolean;
        message?: string;
        phase?: number;
        phaseLabel?: string;
        rssSourcesRegistered?: number;
        imported?: number;
        created?: number;
        skipped?: number;
        found?: number;
        bootstrap?: boolean;
        databaseCount?: number;
        sources?: Array<{ found?: number; duplicate?: number }>;
      }>(res);
      if (apiFailed(data, res)) {
        setMessage(data.error || "Tarama başarısız");
        return;
      }
      if (data.started || data.async) {
        setMessage(
          data.message ||
            `${data.phaseLabel ?? "Tarama"} arka planda başladı. Sayfa birkaç dakika içinde yenilenecek…`
        );
        window.setTimeout(() => router.refresh(), 30000);
        window.setTimeout(() => router.refresh(), 90000);
        return;
      }
      const dup = data.sources?.reduce((n: number, s: { duplicate?: number }) => n + (s.duplicate ?? 0), 0) ?? 0;
      const found = data.found ?? data.sources?.reduce((n: number, s: { found?: number }) => n + (s.found ?? 0), 0) ?? 0;
      setMessage(
        `Tarama tamamlandı: ${found} bulundu · ${data.imported ?? data.created} eklendi · ${data.skipped} atlandı · ${dup} kopya · DB: ${data.databaseCount ?? "?"} haber${data.bootstrap ? " (ilk kurulum)" : ""}`
      );
      router.refresh();
    } finally {
      setFetchingAll(false);
    }
  }

  async function deleteSource(id: string) {
    const res = await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSources((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  const existingMinistryUrls = new Set(sources.map((s) => s.url));

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border bg-background p-1">
          {(["all", "rss", "ministry"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab
                  ? "bg-red-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "Tümü" : tab === "rss" ? "RSS" : "Bakanlık"}
            </button>
          ))}
        </div>

        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Kaynak Ekle
        </Button>
        <Button variant="outline" onClick={() => fetchAll(false)} disabled={fetchingAll}>
          <RefreshCw className={`h-4 w-4 ${fetchingAll ? "animate-spin" : ""}`} />
          Tümünü Tara (AI Motor)
        </Button>
        <Button
          variant="destructive"
          onClick={() => fetchAll(true)}
          disabled={fetchingAll}
        >
          <RefreshCw className={`h-4 w-4 ${fetchingAll ? "animate-spin" : ""}`} />
          Sıfırla ve Yeniden Doldur
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Ulusal Haber Portalları — Hızlı Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            AI Web Scraper ile RSS olmadan taranır. Başlık, içerik, görsel ve kategori otomatik algılanır.
          </p>
          <div className="flex flex-wrap gap-2">
            {PORTAL_NEWS_SOURCES.map((preset) => {
              const exists = existingMinistryUrls.has(preset.url);
              return (
                <Button
                  key={preset.url}
                  variant="outline"
                  size="sm"
                  disabled={exists || loading === `portal-${preset.name}`}
                  onClick={() => addPortalPreset(preset)}
                >
                  {exists ? "✓ " : "+ "}
                  {preset.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Bakanlık Kaynakları — Hızlı Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MINISTRY_SOURCES.map((preset) => {
              const exists = existingMinistryUrls.has(preset.url);
              return (
                <Button
                  key={preset.url}
                  variant="outline"
                  size="sm"
                  disabled={exists || loading === `ministry-${preset.name}`}
                  onClick={() => addMinistryPreset(preset)}
                >
                  {exists ? "✓ " : "+ "}
                  {preset.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rss className="h-5 w-5" />
              Yeni Haber Kaynağı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kaynak URL Tipi</Label>
                <Select
                  value={form.urlType}
                  onValueChange={(v) => {
                    const urlType = v as SourceUrlType;
                    const fetchType: SourceFetchType = urlType === "RSS" ? "RSS" : "WEB";
                    setForm({ ...form, urlType, fetchType });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SITE">Haber Sitesi URL</SelectItem>
                    <SelectItem value="CATEGORY">Kategori URL</SelectItem>
                    <SelectItem value="ARTICLE">Haber Sayfası URL</SelectItem>
                    <SelectItem value="RSS">RSS Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fetchType">Tarama Yöntemi</Label>
                <Select
                  value={form.fetchType}
                  onValueChange={(v) => setForm({ ...form, fetchType: v as SourceFetchType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB">Web Sitesi (URL tarama)</SelectItem>
                    <SelectItem value="RSS">RSS Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kind">Kaynak Türü</Label>
                <Select
                  value={form.kind}
                  onValueChange={(v) => setForm({ ...form, kind: v as SourceKind })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RSS">RSS Feed</SelectItem>
                    <SelectItem value="MINISTRY">Bakanlık / Resmi</SelectItem>
                    <SelectItem value="MANUAL">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Kaynak Adı</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Örn: BBC Türkçe"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="url">
                  {form.urlType === "RSS"
                    ? "RSS Feed URL"
                    : form.urlType === "ARTICLE"
                      ? "Haber Sayfası URL"
                      : form.urlType === "CATEGORY"
                        ? "Kategori URL"
                        : "Haber Sitesi URL"}
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder={
                    form.fetchType === "WEB"
                      ? "https://www.ornekhaber.com"
                      : "https://example.com/rss.xml"
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori (otomatik eşleme yedek)</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Tarama Aralığı (dk)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  max={1440}
                  value={form.fetchIntervalMinutes}
                  onChange={(e) =>
                    setForm({ ...form, fetchIntervalMinutes: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="trust" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Güven Puanı: {(form.trustScore * 100).toFixed(0)}%
                </Label>
                <input
                  id="trust"
                  type="range"
                  min={0}
                  max={100}
                  value={form.trustScore * 100}
                  onChange={(e) =>
                    setForm({ ...form, trustScore: parseInt(e.target.value) / 100 })
                  }
                  className="w-full accent-red-600"
                />
                <p className="text-xs text-muted-foreground">
                  %90+ manşet adayı · %30 altı otomatik atlanır
                </p>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading === "create"}>
                  {loading === "create" ? "Ekleniyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kaynak</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Güven</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son Tarama</TableHead>
              <TableHead>Haberler</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Bu filtrede kaynak bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                        {source.url}
                      </p>
                      {source.lastFetchError && (
                        <p className="mt-1 text-xs text-red-500">{source.lastFetchError}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.kind === "MINISTRY" ? "default" : "secondary"}>
                      {KIND_LABELS[source.kind ?? "RSS"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${trustColor(source.trustScore)}`}>
                        {(source.trustScore * 100).toFixed(0)}%
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={source.trustScore * 100}
                        onChange={(e) =>
                          updateTrustScore(source.id, parseInt(e.target.value) / 100)
                        }
                        className="w-16 accent-red-600"
                        title="Güven puanını güncelle"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {source.category ? (
                      <Badge variant="outline">{source.category.name}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Otomatik</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={source.isActive}
                        onCheckedChange={(checked) => toggleActive(source.id, checked)}
                      />
                      <span className="text-xs">{source.isActive ? "Aktif" : "Pasif"}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Her {source.fetchIntervalMinutes} dk
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {source.lastFetchedAt
                      ? formatDateTime(source.lastFetchedAt)
                      : "Henüz taranmadı"}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{source._count.articles}</span>
                    <span className="text-xs text-muted-foreground"> yayın</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchSource(source.id)}
                        disabled={loading === source.id}
                        title="AI ile tara ve yayınla"
                      >
                        <Play className={`h-4 w-4 ${loading === source.id ? "animate-pulse" : ""}`} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kaynağı Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{source.name}&quot; kaynağını silmek istediğinize emin misiniz?
                              Mevcut haberler silinmez.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteSource(source.id)}
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
