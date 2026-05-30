import { getQueueItems } from "@/lib/ai-engine/queue";
import type { QueueStatus } from "@/data/types";
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

const STATUS_LABELS: Record<QueueStatus, string> = {
  SCANNED: "Taranan",
  PENDING: "Bekliyor",
  PUBLISHED: "Yayında",
  REJECTED: "Reddedildi",
};

const STATUS_COLORS: Record<QueueStatus, string> = {
  SCANNED: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface QueueTableProps {
  status?: QueueStatus;
  title: string;
  description?: string;
}

export default function QueueTable({ status, title, description }: QueueTableProps) {
  const items = getQueueItems(status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <p className="mt-2 text-sm text-muted-foreground">{items.length} kayıt</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Kaynak</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  Henüz kayıt yok
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 font-medium">{item.originalTitle}</p>
                    {item.error && <p className="mt-1 text-xs text-red-600">{item.error}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{item.sourceName}</p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Kaynağı aç
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
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
