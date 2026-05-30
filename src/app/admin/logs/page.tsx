import { getPipelineLogs } from "@/lib/ai-engine/pipeline-log";
import { getDynamicArticleCount } from "@/lib/ai-engine/store";
import { formatDateTime } from "@/lib/utils/date";
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

export default function AdminLogsPage() {
  const logs = getPipelineLogs();
  const dbCount = getDynamicArticleCount();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Haber Çekme Logları</h1>
        <p className="text-sm text-muted-foreground">
          Kaynak tarama, RSS/Web scraper ve AI yayın geçmişi · Veritabanında {dbCount} dinamik haber
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Özet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Her taramada: kaç haber bulundu, kaç haber eklendi, kaç haber atlandı (kopya/spam/hata) kaydedilir.
          RSS hataları kırmızı sütunda görünür.
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Tetikleyici</TableHead>
              <TableHead>Bulundu</TableHead>
              <TableHead>Eklendi</TableHead>
              <TableHead>Atlandı</TableHead>
              <TableHead>Kopya</TableHead>
              <TableHead>Hatalar / RSS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Henüz log kaydı yok. Kaynak Yönetimi → &quot;Tümünü Tara (AI Motor)&quot; ile başlatın.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.trigger}</Badge>
                  </TableCell>
                  <TableCell>{log.found ?? 0}</TableCell>
                  <TableCell className="font-medium text-green-600">{log.imported}</TableCell>
                  <TableCell>{log.skipped}</TableCell>
                  <TableCell>{log.duplicate}</TableCell>
                  <TableCell className="max-w-md text-xs text-red-600">
                    {log.errors.length > 0 ? log.errors.join("; ") : log.message ?? "—"}
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
