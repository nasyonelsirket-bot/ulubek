import { getEngineStats } from "@/lib/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAIPage() {
  const engine = await getEngineStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Ayarları</h1>
        <p className="text-sm text-muted-foreground">Haber motoru yapılandırması ve durum bilgisi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OpenAI Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={engine.openAiEnabled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {engine.openAiEnabled ? "Aktif" : "Yerel motor (API anahtarı yok)"}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              OPENAI_API_KEY ortam değişkeni ile GPT ve DALL-E entegrasyonu etkinleştirilir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarama Aralığı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{engine.cronIntervalMin} dk</p>
            <p className="mt-2 text-sm text-muted-foreground">Otomatik cron tarama sıklığı</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">AI Pipeline Özellikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {engine.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
