"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import type { PublicSettings, CoverTitleStyle, LogoPosition } from "@/lib/settings/types";
import { readApiJson, apiFailed } from "@/lib/api/client";

interface CoverDesignSettingsProps {
  initial: PublicSettings;
}

export default function CoverDesignSettings({ initial }: CoverDesignSettingsProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    coverBrandingEnabled: initial.coverBrandingEnabled,
    coverWatermarkEnabled: initial.coverWatermarkEnabled,
    coverLogoPosition: initial.coverLogoPosition,
    coverTitleStyle: initial.coverTitleStyle,
    coverBreakingTagEnabled: initial.coverBreakingTagEnabled,
    coverLogoCustom: initial.coverLogoCustom,
  });
  const [logoUploaded, setLogoUploaded] = useState(initial.coverLogoUploaded);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setMessage("Kapak tasarım ayarları kaydedildi.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/admin/cover-logo", { method: "POST", body: fd });
      const data = await readApiJson<{ success?: boolean; error?: string }>(res);
      if (apiFailed(data, res)) {
        setMessage(data.error || "Logo yüklenemedi");
        return;
      }
      setLogoUploaded(true);
      setForm((f) => ({ ...f, coverLogoCustom: true }));
      setMessage("Logo yüklendi.");
      router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{message}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kapak Tasarım Sistemi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kaynak, stok ve AI görselleri otomatik olarak Ulubek Medya haber kapağına dönüştürülür.
            Çıktılar: 1200×675 (web), 1080×1080 (sosyal), 1080×1920 (story).
          </p>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Profesyonel kapak tasarımı</p>
              <p className="text-xs text-muted-foreground">Logo, başlık, kategori ve gradient overlay</p>
            </div>
            <Switch
              checked={form.coverBrandingEnabled}
              onCheckedChange={(v) => setForm({ ...form, coverBrandingEnabled: v })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Filigran / marka logosu</p>
              <p className="text-xs text-muted-foreground">Kapak üzerinde Ulubek Medya logosu göster</p>
            </div>
            <Switch
              checked={form.coverWatermarkEnabled}
              onCheckedChange={(v) => setForm({ ...form, coverWatermarkEnabled: v })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Son dakika etiketi</p>
              <p className="text-xs text-muted-foreground">Breaking haberlerde kırmızı etiket ekle</p>
            </div>
            <Switch
              checked={form.coverBreakingTagEnabled}
              onCheckedChange={(v) => setForm({ ...form, coverBreakingTagEnabled: v })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo konumu</Label>
              <Select
                value={form.coverLogoPosition}
                onValueChange={(v) => setForm({ ...form, coverLogoPosition: v as LogoPosition })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Sol üst</SelectItem>
                  <SelectItem value="top-right">Sağ üst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Başlık stili</Label>
              <Select
                value={form.coverTitleStyle}
                onValueChange={(v) => setForm({ ...form, coverTitleStyle: v as CoverTitleStyle })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bold">Kalın (varsayılan)</SelectItem>
                  <SelectItem value="compact">Kompakt</SelectItem>
                  <SelectItem value="impact">Etkileyici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo Yükleme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Şeffaf PNG logo yükleyin. Önerilen: yatay format, min. 400px genişlik.
            {logoUploaded ? " Özel logo yüklendi." : " Varsayılan: public/logo.png"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Yükleniyor..." : "Logo Yükle (PNG)"}
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.coverLogoCustom}
                onCheckedChange={(v) => setForm({ ...form, coverLogoCustom: v })}
              />
              <Label className="text-sm">Özel logoyu kullan</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Kapak Ayarlarını Kaydet"}
      </Button>
    </form>
  );
}
