"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Plus, Trash2, Rss, Play } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
}

interface SourceRow {
  id: string;
  name: string;
  url: string;
  type: string;
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

export default function SourcesManager({ initialSources, categories }: SourcesManagerProps) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    url: "",
    categoryId: "",
    fetchIntervalMinutes: 30,
    trustScore: 0.8,
    isActive: true,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: "RSS",
          categoryId: form.categoryId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Kaynak eklenemedi");
        return;
      }

      setSources((prev) => [data, ...prev]);
      setForm({ name: "", url: "", categoryId: "", fetchIntervalMinutes: 30, trustScore: 0.8, isActive: true });
      setShowForm(false);
      setMessage("Kaynak başarıyla eklendi.");
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

  async function fetchSource(id: string) {
    setLoading(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/sources/${id}/fetch`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setMessage(
          `${data.sourceName}: ${data.processed ?? data.created} yayınlandı, ${data.skipped} kopya atlandı`
        );
      } else {
        setMessage(data.error || "Tarama başarısız");
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function fetchAll() {
    setFetchingAll(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/sources/fetch-all", { method: "POST" });
      const data = await res.json();
      setMessage(`Tüm kaynaklar tarandı: ${data.created} yayınlandı, ${data.skipped} atlandı`);
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

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          RSS Kaynağı Ekle
        </Button>
        <Button variant="outline" onClick={fetchAll} disabled={fetchingAll}>
          <RefreshCw className={`h-4 w-4 ${fetchingAll ? "animate-spin" : ""}`} />
          Tümünü Tara
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rss className="h-5 w-5" />
              Yeni RSS Kaynağı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="url">RSS Feed URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/rss.xml"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
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
                  min={5}
                  max={1440}
                  value={form.fetchIntervalMinutes}
                  onChange={(e) =>
                    setForm({ ...form, fetchIntervalMinutes: parseInt(e.target.value) || 30 })
                  }
                />
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

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kaynak</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son Tarama</TableHead>
              <TableHead>Haberler</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Henüz RSS kaynağı eklenmemiş
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
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
                    {source.category ? (
                      <Badge variant="secondary">{source.category.name}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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
                      ? new Date(source.lastFetchedAt).toLocaleString("tr-TR")
                      : "Henüz taranmadı"}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{source._count.articles}</span>
                    <span className="text-xs text-muted-foreground"> / {source.articlesFetched} toplam</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchSource(source.id)}
                        disabled={loading === source.id}
                        title="Şimdi tara"
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
