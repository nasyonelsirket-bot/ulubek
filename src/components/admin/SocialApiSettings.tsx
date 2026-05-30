"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PublicSettings } from "@/lib/settings/types";
import { readApiJson, apiFailed } from "@/lib/api/client";

interface SocialApiSettingsProps {
  initial: PublicSettings;
}

export default function SocialApiSettings({ initial }: SocialApiSettingsProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    twitterApiKey: "",
    twitterApiSecret: "",
    twitterBearerToken: "",
    twitterAccounts: initial.twitterAccounts,
    instagramAccessToken: "",
    instagramAccountId: initial.instagramAccountId,
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
      setMessage("Sosyal medya API ayarları kaydedildi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Twitter / X API</CardTitle>
          <Badge className={initial.twitterBearerConfigured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {initial.twitterBearerConfigured ? "Yapılandırıldı" : "Eksik"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Belirlenen hesaplardan son paylaşımları çekmek için Twitter API v2 anahtarlarını girin.
          </p>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder={initial.twitterKeyConfigured ? "••••••••" : "Twitter API Key"}
              value={form.twitterApiKey}
              onChange={(e) => setForm({ ...form, twitterApiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>API Secret</Label>
            <Input
              type="password"
              placeholder="Twitter API Secret"
              value={form.twitterApiSecret}
              onChange={(e) => setForm({ ...form, twitterApiSecret: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Bearer Token</Label>
            <Input
              type="password"
              placeholder={initial.twitterBearerConfigured ? "••••••••" : "Bearer Token"}
              value={form.twitterBearerToken}
              onChange={(e) => setForm({ ...form, twitterBearerToken: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Takip Edilecek Hesaplar</Label>
            <Input
              placeholder="bpthaber, haberturk (virgülle ayırın)"
              value={form.twitterAccounts}
              onChange={(e) => setForm({ ...form, twitterAccounts: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Instagram Graph API</CardTitle>
          <Badge className={initial.instagramConfigured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {initial.instagramConfigured ? "Yapılandırıldı" : "Eksik"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            BPT Haber gibi sayfalardan içerik çekmek için Instagram Graph API erişim bilgilerini girin.
          </p>
          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input
              type="password"
              placeholder={initial.instagramConfigured ? "••••••••" : "Instagram Access Token"}
              value={form.instagramAccessToken}
              onChange={(e) => setForm({ ...form, instagramAccessToken: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Account / Page ID</Label>
            <Input
              placeholder="Instagram Business Account ID"
              value={form.instagramAccountId}
              onChange={(e) => setForm({ ...form, instagramAccountId: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Sosyal API Ayarlarını Kaydet"}
      </Button>
    </form>
  );
}
