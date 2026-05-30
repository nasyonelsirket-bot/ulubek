import { getAllArticlesFromStore } from "@/lib/ai-engine/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminSEOPage() {
  const articles = getAllArticlesFromStore()
    .filter((a) => (a.status ?? "PUBLISHED") === "PUBLISHED")
    .slice(0, 50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SEO Yönetimi</h1>
        <p className="text-sm text-muted-foreground">AI tarafından oluşturulan meta başlık ve açıklamalar</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Haber</TableHead>
              <TableHead>Meta Başlık</TableHead>
              <TableHead>Meta Açıklama</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="max-w-[200px] font-medium">{a.title}</TableCell>
                <TableCell className="max-w-[220px] text-sm">{a.metaTitle ?? a.title}</TableCell>
                <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                  {a.metaDescription ?? a.excerpt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
