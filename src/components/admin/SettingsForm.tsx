"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { PublicSettings } from "@/lib/settings/types";
import { readApiJson, apiFailed } from "@/lib/api/client";

interface SettingsFormProps {
  initial: PublicSettings;
}

export default function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    aiProvider: initial.aiProvider,
    imageProvider: initial.imageProvider,
    openaiModel: initial.openaiModel,
    geminiModel: initial.geminiModel,
    scanIntervalMin: initial.scanIntervalMin,
    scanLookbackDays: initial.scanLookbackDays,
    minWordCount: initial.minWordCount,
    targetWordCount: initial.targetWordCount,
    openaiApiKey: "",
    geminiApiKey: "",
    useSourceImage: initial.useSourceImage,
    useStockImage: initial.useStockImage,
    useAiImage: initial.useAiImage,
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
      setMessage("Ayarlar kaydedildi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Motoru</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Metin Üretici</Label>
            <Select value={form.aiProvider} onValueChange={(v) => setForm({ ...form, aiProvider: v as "openai" | "gemini" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Görsel Üretici</Label>
            <Select value={form.imageProvider} onValueChange={(v) => setForm({ ...form, imageProvider: v as "openai" | "gemini" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI DALL-E</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>OpenAI Model</Label>
            <Input value={form.openaiModel} onChange={(e) => setForm({ ...form, openaiModel: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Gemini Model</Label>
            <Input value={form.geminiModel} onChange={(e) => setForm({ ...form, geminiModel: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Görsel Sistemi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Öncelik sırası: Kaynak Görseli → Stok Görsel → AI Görsel
          </p>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Kaynak görselini kullan</p>
              <p className="text-xs text-muted-foreground">Kaynak görseli al, optimize et, markalı haber kapağına dönüştür</p>
            </div>
            <Switch
              checked={form.useSourceImage}
              onCheckedChange={(v) => setForm({ ...form, useSourceImage: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Stok görsel kullan</p>
              <p className="text-xs text-muted-foreground">Stok fotoğrafı profesyonel haber kapağına dönüştür</p>
            </div>
            <Switch
              checked={form.useStockImage}
              onCheckedChange={(v) => setForm({ ...form, useStockImage: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">AI görsel üret</p>
              <p className="text-xs text-muted-foreground">OpenAI veya Gemini ile kapak görseli oluştur</p>
            </div>
            <Switch
              checked={form.useAiImage}
              onCheckedChange={(v) => setForm({ ...form, useAiImage: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarama Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tarama Aralığı (dk)</Label>
            <Input type="number" min={1} value={form.scanIntervalMin} onChange={(e) => setForm({ ...form, scanIntervalMin: parseInt(e.target.value) || 1 })} />
          </div>
          <div className="space-y-2">
            <Label>Geçmiş Tarama (gün)</Label>
            <Input type="number" min={1} max={30} value={form.scanLookbackDays} onChange={(e) => setForm({ ...form, scanLookbackDays: parseInt(e.target.value) || 10 })} />
          </div>
          <div className="space-y-2">
            <Label>Min. Kelime</Label>
            <Input type="number" min={800} value={form.minWordCount} onChange={(e) => setForm({ ...form, minWordCount: parseInt(e.target.value) || 800 })} />
          </div>
          <div className="space-y-2">
            <Label>Hedef Kelime</Label>
            <Input type="number" min={1200} value={form.targetWordCount} onChange={(e) => setForm({ ...form, targetWordCount: parseInt(e.target.value) || 1200 })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Anahtarları</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>OpenAI API Key {initial.openaiKeyConfigured && `(mevcut: ${initial.openaiKeyPreview})`}</Label>
            <Input type="password" placeholder="sk-..." value={form.openaiApiKey} onChange={(e) => setForm({ ...form, openaiApiKey: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Gemini API Key {initial.geminiKeyConfigured && `(mevcut: ${initial.geminiKeyPreview})`}</Label>
            <Input type="password" placeholder="AIza..." value={form.geminiApiKey} onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">
            Anahtarlar güvenli olarak sunucu ayarlarında saklanır. Boş bırakırsanız mevcut anahtar korunur.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </Button>
    </form>
  );
}
