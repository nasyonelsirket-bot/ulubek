"use client";

import {
  Bot,
  Clock,
  Database,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/date";

export interface EngineStatsData {
  totalSources: number;
  activeSources: number;
  totalImported: number;
  totalPublished?: number;
  bootstrapTarget?: number;
  bootstrapComplete?: boolean;
  lastRunAt: string | null;
  openAiEnabled: boolean;
  geminiEnabled?: boolean;
  activeProvider?: string;
  aiProvider?: string;
  imageProvider?: string;
  scanIntervalMin: number;
  scanLookbackDays?: number;
  features: string[];
  recentLogs: Array<{
    id: string;
    timestamp: string;
    sourceName?: string;
    found?: number;
    imported: number;
    skipped: number;
    duplicate: number;
    spam: number;
    trigger: string;
    errors: string[];
    message?: string;
    sources?: Array<{
      sourceName: string;
      found: number;
      imported: number;
      skipped: number;
      errors: string[];
    }>;
  }>;
}

const FEATURE_ICONS: Record<string, typeof Bot> = {
  "Web sitesi / kategori / haber URL tarama": RefreshCw,
  "RSS tarama (opsiyonel)": RefreshCw,
  "OpenAI + Gemini motor seçimi": Sparkles,
  "1200+ kelime haber üretimi": Sparkles,
  "SEO + OG + Twitter Card": Search,
  "AI kapak görseli (1200x675)": Sparkles,
  "10 gün geriye tarama": Clock,
  "1 dk tarama aralığı": Clock,
};

interface SourceEngineDashboardProps {
  initialStats: EngineStatsData;
}

export default function SourceEngineDashboard({ initialStats }: SourceEngineDashboardProps) {
  const stats = initialStats;
  const lastLog = stats.recentLogs[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Veritabanı</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-green-600">
              <Database className="h-5 w-5" />
              {stats.totalImported}
            </p>
            <p className="text-xs text-muted-foreground">
              Hedef: {stats.bootstrapTarget ?? 100} · {stats.bootstrapComplete ? "Tamamlandı" : "İlk kurulum"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Aktif Kaynak</p>
            <p className="mt-1 text-2xl font-bold">{stats.activeSources}</p>
            <p className="text-xs text-muted-foreground">/ {stats.totalSources} toplam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">AI Motor</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
              <Bot className="h-5 w-5" />
              {stats.activeProvider ?? "local"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Tarama</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
              <Clock className="h-5 w-5 text-red-600" />
              {stats.scanIntervalMin} dk
            </p>
            <p className="text-xs text-muted-foreground">Son {stats.scanLookbackDays ?? 10} gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Son Tarama</p>
            <p className="mt-1 text-sm font-bold">
              {stats.lastRunAt ? formatDateTime(stats.lastRunAt) : "Henüz taranmadı"}
            </p>
            {lastLog && (
              <p className="mt-1 text-xs text-muted-foreground">
                {lastLog.found ?? 0} bulundu · {lastLog.imported} eklendi · {lastLog.skipped} atlandı
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {!stats.bootstrapComplete && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            İlk kurulum modu aktif. &quot;Tümünü Tara&quot; ile kaynaklardan son 10 günlük haberler toplu çekilir;
            hedef en az {stats.bootstrapTarget ?? 100} haber.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-red-600" />
            AI Haber Ajansı — Otomatik Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.features.map((feature) => {
              const Icon = FEATURE_ICONS[feature] ?? Sparkles;
              return (
                <Badge key={feature} variant="outline" className="gap-1.5 py-1.5">
                  <Icon className="h-3 w-3" />
                  {feature}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {stats.recentLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Haber Çekme Logları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="rounded-lg border px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">
                        {log.sourceName ?? (log.trigger === "cron" ? "Otomatik cron" : "Tüm kaynaklar")}
                      </span>
                      <Badge variant="outline" className="ml-2 text-[10px]">{log.trigger}</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <Badge variant="secondary">{log.found ?? 0} bulundu</Badge>
                      <Badge className="bg-green-600">{log.imported} eklendi</Badge>
                      {log.skipped > 0 && <Badge variant="outline">{log.skipped} atlandı</Badge>}
                      {log.duplicate > 0 && <Badge variant="secondary">{log.duplicate} kopya</Badge>}
                      {log.spam > 0 && <Badge variant="destructive">{log.spam} spam</Badge>}
                    </div>
                  </div>
                  {log.message && <p className="mt-1 text-xs text-amber-700">{log.message}</p>}
                  {log.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">{log.errors.join(" · ")}</p>
                  )}
                  {log.sources && log.sources.length > 0 && (
                    <div className="mt-2 space-y-1 border-t pt-2">
                      {log.sources.map((s) => (
                        <div key={s.sourceName} className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{s.sourceName}</span>
                          <span>{s.found} bulundu</span>
                          <span className="text-green-600">{s.imported} eklendi</span>
                          <span>{s.skipped} atlandı</span>
                          {s.errors.length > 0 && <span className="text-red-600">{s.errors[0]}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
