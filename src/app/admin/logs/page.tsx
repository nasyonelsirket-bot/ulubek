import { getPipelineLogs } from "@/lib/ai-engine/pipeline-log";
import { formatDateTime } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sistem Logları</h1>
        <p className="text-sm text-muted-foreground">AI haber motoru tarama ve yayın geçmişi</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Tetikleyici</TableHead>
              <TableHead>Yayınlanan</TableHead>
              <TableHead>Atlanan</TableHead>
              <TableHead>Hatalar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Henüz log kaydı yok
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.trigger}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">{log.imported}</TableCell>
                  <TableCell>{log.skipped}</TableCell>
                  <TableCell className="max-w-xs text-xs text-red-600">
                    {log.errors.length > 0 ? log.errors.join("; ") : "—"}
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
