import { getQueueItems } from "@/lib/ai-engine/queue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/date";

export default function AdminImagesPage() {
  const withPrompts = getQueueItems().filter((i) => i.imagePrompt);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Görsel Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Haber içeriğine göre oluşturulan AI kapak görseli promptları (stok görsel kullanılmaz)
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Haber</TableHead>
              <TableHead>Görsel Promptu</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withPrompts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  Henüz görsel prompt kaydı yok
                </TableCell>
              </TableRow>
            ) : (
              withPrompts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[200px] font-medium">{item.originalTitle}</TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">{item.imagePrompt}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTime(item.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
