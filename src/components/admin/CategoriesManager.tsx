"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readApiJson, apiFailed } from "@/lib/api/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  sortOrder: number;
  articleCount?: number;
}

interface CategoriesManagerProps {
  initialCategories: CategoryRow[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", color: "#dc2626", sortOrder: 99 });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readApiJson<{ success?: boolean; error?: string; data?: CategoryRow }>(res);
      if (apiFailed(data, res)) {
        setMessage(data.error || "Eklenemedi");
        return;
      }
      if (data.data) {
        setCategories((prev) => [...prev, { ...data.data!, articleCount: 0 }]);
      }
      setForm({ name: "", slug: "", description: "", color: "#dc2626", sortOrder: 99 });
      setMessage("Kategori eklendi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    const data = await readApiJson<{ success?: boolean; error?: string }>(res);
    if (!apiFailed(data, res)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yeni Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Ad</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Renk</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Açıklama</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> Ekle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kategoriler ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Haber</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: cat.color }} />
                    {cat.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{cat.slug}</TableCell>
                  <TableCell>{cat.articleCount ?? 0}</TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
