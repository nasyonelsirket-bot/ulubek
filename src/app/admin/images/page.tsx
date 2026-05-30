import { getQueueItems } from "@/lib/ai-engine/queue";
import { getPublicSettings } from "@/lib/settings/store";
import CoverDesignSettings from "@/components/admin/CoverDesignSettings";
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

const SOURCE_LABELS: Record<string, string> = {
  source: "Kaynak Görseli",
  stock: "Stok Görsel",
  ai: "AI Görsel",
  placeholder: "Placeholder",
};

export default function AdminImagesPage() {
  const settings = getPublicSettings();
  const withPrompts = getQueueItems().filter((i) => i.imagePrompt);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Görsel Yönetimi</h1>
        <p className="text-sm text-muted-foreground">
          Profesyonel haber kapağı sistemi — kaynak, stok ve AI görselleri markalı kapaklara dönüştürülür
        </p>
      </div>

      <div className="mb-8">
        <CoverDesignSettings initial={settings} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Kapak Tasarımı</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.coverBrandingEnabled ? "bg-green-100 text-green-700" : "bg-gray-100"}>
              {settings.coverBrandingEnabled ? "Aktif" : "Kapalı"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">Logo + başlık + gradient overlay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Kaynak Görseli</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.useSourceImage ? "bg-green-100 text-green-700" : "bg-gray-100"}>
              {settings.useSourceImage ? "Aktif" : "Kapalı"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">Optimize + markalı kapak</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Stok Görsel</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.useStockImage ? "bg-green-100 text-green-700" : "bg-gray-100"}>
              {settings.useStockImage ? "Aktif" : "Kapalı"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">Stok foto → haber kapağı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Görsel</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.useAiImage ? "bg-green-100 text-green-700" : "bg-gray-100"}>
              {settings.useAiImage ? "Aktif" : "Kapalı"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">{settings.imageProvider} + kapak editörü</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 rounded-lg border bg-secondary/50 p-4 text-sm">
        <p className="font-medium">Otomatik çıktı boyutları</p>
        <ul className="mt-2 list-inside list-disc text-muted-foreground">
          <li>1200×675 — Web kapak</li>
          <li>1080×1080 — Sosyal medya (Instagram)</li>
          <li>1080×1920 — Story / dikey</li>
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Haber</TableHead>
              <TableHead>Görsel Kaynağı</TableHead>
              <TableHead>Detay</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withPrompts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  Henüz görsel kaydı yok
                </TableCell>
              </TableRow>
            ) : (
              withPrompts.map((item) => {
                const match = item.imagePrompt?.match(/^\[(\w+)\]\s*(.*)/);
                const source = match?.[1] ?? "ai";
                const detail = match?.[2] ?? item.imagePrompt;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[200px] font-medium">{item.originalTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{SOURCE_LABELS[source] ?? source}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">{detail}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatDateTime(item.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
