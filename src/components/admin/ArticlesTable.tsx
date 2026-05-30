"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2, Search, Sparkles, AlertCircle } from "lucide-react";
import { ArticleStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  publishedAt: string;
  aiProcessed: boolean;
  aiProcessingError: string | null;
  category: { name: string; color: string };
}

interface ArticlesTableProps {
  initialArticles: ArticleRow[];
}

const statusLabels: Record<ArticleStatus, string> = {
  PUBLISHED: "Yayında",
  HIDDEN: "Gizli",
  DRAFT: "Taslak",
  ARCHIVED: "Arşiv",
};

const statusVariants: Record<ArticleStatus, "default" | "secondary" | "destructive" | "warning" | "success"> = {
  PUBLISHED: "success",
  HIDDEN: "warning",
  DRAFT: "secondary",
  ARCHIVED: "destructive",
};

export default function ArticlesTable({ initialArticles }: ArticlesTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function processWithAI(id: string) {
    setLoading(`ai-${id}`);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/articles/${id}/process-ai`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(`AI işleme tamamlandı (${data.engine})`);
        setArticles((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, aiProcessed: true, status: "PUBLISHED" as ArticleStatus, aiProcessingError: null } : a
          )
        );
        router.refresh();
      } else {
        setMessage(data.error || "AI işleme başarısız");
      }
    } finally {
      setLoading(null);
    }
  }

  async function toggleHide(id: string, currentStatus: ArticleStatus) {
    setLoading(id);
    const newStatus = currentStatus === "HIDDEN" ? "PUBLISHED" : "HIDDEN";

    try {
      const res = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteArticle(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Haber ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="PUBLISHED">Yayında</SelectItem>
            <SelectItem value="HIDDEN">Gizli</SelectItem>
            <SelectItem value="DRAFT">Taslak</SelectItem>
            <SelectItem value="ARCHIVED">Arşiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Haber bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="line-clamp-2 font-medium">{article.title}</p>
                      <div className="mt-1 flex gap-1">
                        {article.breaking && <Badge variant="destructive">Son Dakika</Badge>}
                        {article.featured && <Badge variant="secondary">Manşet</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: article.category.color, color: "#fff" }}>
                      {article.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[article.status]}>
                      {statusLabels[article.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {article.aiProcessed ? (
                      <Badge variant="success" className="gap-1">
                        <Sparkles className="h-3 w-3" /> OK
                      </Badge>
                    ) : article.aiProcessingError ? (
                      <Badge variant="destructive" className="gap-1" title={article.aiProcessingError}>
                        <AlertCircle className="h-3 w-3" /> Hata
                      </Badge>
                    ) : (
                      <Badge variant="warning">Bekliyor</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/articles/${article.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!article.aiProcessed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => processWithAI(article.id)}
                          disabled={loading === `ai-${article.id}`}
                          title="AI ile işle"
                        >
                          <Sparkles className={`h-4 w-4 text-purple-600 ${loading === `ai-${article.id}` ? "animate-pulse" : ""}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleHide(article.id, article.status)}
                        disabled={loading === article.id}
                        title={article.status === "HIDDEN" ? "Yayınla" : "Gizle"}
                      >
                        {article.status === "HIDDEN" ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={loading === article.id}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Haberi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{article.title}&quot; haberini kalıcı olarak silmek istediğinize emin misiniz?
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deleteArticle(article.id)}
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
