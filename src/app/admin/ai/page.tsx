import { getPublicSettings } from "@/lib/settings/store";
import { getActiveAIProvider } from "@/lib/ai/engine";
import SettingsForm from "@/components/admin/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminAIPage() {
  const settings = getPublicSettings();
  const active = getActiveAIProvider();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Ayarları</h1>
        <p className="text-sm text-muted-foreground">OpenAI / Gemini motor seçimi ve tarama yapılandırması</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Aktif Motor</CardTitle></CardHeader>
          <CardContent><Badge>{active}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">OpenAI</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.openaiKeyConfigured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {settings.openaiKeyConfigured ? "Yapılandırıldı" : "Eksik"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Gemini</CardTitle></CardHeader>
          <CardContent>
            <Badge className={settings.geminiKeyConfigured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {settings.geminiKeyConfigured ? "Yapılandırıldı" : "Eksik"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
