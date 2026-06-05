"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PublicSettings } from "@/lib/settings/types";
import { readApiJson, apiFailed } from "@/lib/api/client";

interface NewsApiSettingsProps {
  initial: PublicSettings;
}

export default function NewsApiSettings({ initial }: NewsApiSettingsProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    newsApiKey: "",
    newsApiEnabled: initial.newsApiEnabled ?? true,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readApiJson<{ success?: boolean; error?: string }>(res);
      if (apiFailed(data, res)) {
        setMessage(data.error || "Kaydedilemedi");
        return;
      }
      setMessage("NewsAPI ayarları kaydedildi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          NewsAPI
          {initial.newsApiKeyConfigured ? (
            <Badge className="bg-green-600">Yapılandırıldı {initial.newsApiKeyPreview}</Badge>
          ) : (
            <Badge variant="secondary">Anahtar yok</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {message && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>
          )}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">NewsAPI Otomatik Çekim</p>
              <p className="text-xs text-muted-foreground">Her 60 saniyede cron ile haber çeker</p>
            </div>
            <Switch
              checked={form.newsApiEnabled}
              onCheckedChange={(v) => setForm({ ...form, newsApiEnabled: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>NewsAPI Anahtarı</Label>
            <Input
              type="password"
              placeholder={initial.newsApiKeyConfigured ? "Değiştirmek için yeni anahtar" : "newsapi.org anahtarı"}
              value={form.newsApiKey}
              onChange={(e) => setForm({ ...form, newsApiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer" className="underline">
                newsapi.org
              </a>
              {" "}üzerinden ücretsiz anahtar alın. Ortam değişkeni: NEWS_API_KEY
            </p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
