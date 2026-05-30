"use client";

import {
  Bot,
  Clock,
  Image,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Zap,
  Copy,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/date";

export interface EngineStatsData {
  totalSources: number;
  activeSources: number;
  totalImported: number;
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
    imported: number;
    skipped: number;
    duplicate: number;
    spam: number;
    trigger: string;
    errors: string[];
  }>;
}

const FEATURE_ICONS: Record<string, typeof Bot> = {
  "RSS otomatik tarama": RefreshCw,
  "AI özgünleştirme": Sparkles,
  "SEO başlık & meta": Search,
  "Otomatik görsel": Image,
  "Kopya kontrolü": Copy,
  "Spam filtresi": Ban,
  "Otomatik yayın": Zap,
};

interface SourceEngineDashboardProps {
  initialStats: EngineStatsData;
}

export default function SourceEngineDashboard({ initialStats }: SourceEngineDashboardProps) {
  const stats = initialStats;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {stats.activeProvider ?? (stats.openAiEnabled ? "openai" : "local")}
            </p>
            <Badge variant={stats.openAiEnabled || stats.geminiEnabled ? "default" : "secondary"} className="mt-1">
              {stats.aiProvider ?? "openai"} / {stats.imageProvider ?? "openai"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Otomatik Tarama</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
              <Clock className="h-5 w-5 text-red-600" />
              {stats.scanIntervalMin} dk
            </p>
            <p className="text-xs text-muted-foreground">Son {stats.scanLookbackDays ?? 10} gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase text-muted-foreground">Toplam Yayın</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.totalImported}</p>
            <p className="text-xs text-muted-foreground">
              Son: {stats.lastRunAt ? formatDateTime(stats.lastRunAt) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

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
          <p className="mt-4 text-sm text-muted-foreground">
            RSS → Kopya & spam kontrolü → AI özgünleştirme → SEO meta → görsel üretimi → otomatik
            yayın
          </p>
        </CardContent>
      </Card>

      {stats.recentLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Son Tarama Kayıtları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {log.sourceName ?? (log.trigger === "cron" ? "Otomatik cron" : "Tüm kaynaklar")}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className="bg-green-600">{log.imported} yayın</Badge>
                    {log.duplicate > 0 && <Badge variant="secondary">{log.duplicate} kopya</Badge>}
                    {log.spam > 0 && <Badge variant="destructive">{log.spam} spam</Badge>}
                    {log.skipped > 0 && <Badge variant="outline">{log.skipped} atlandı</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
