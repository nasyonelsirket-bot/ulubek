import { NextRequest } from "next/server";
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import {
  adminErr,
  adminOk,
  requireAdminSession,
  toErrorMessage,
} from "@/lib/api/admin-response";
import { runtimeFile } from "@/lib/runtime/paths";
import { saveSettings } from "@/lib/settings/store";

export async function POST(request: NextRequest) {
  try {
    const { unauthorized } = await requireAdminSession();
    if (unauthorized) return unauthorized;

    const formData = await request.formData();
    const file = formData.get("logo");
    if (!file || !(file instanceof Blob)) {
      return adminErr("Logo dosyası gerekli", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 500) {
      return adminErr("Dosya çok küçük", 400);
    }

    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
      return adminErr("Geçersiz görsel", 400);
    }

    const logoPath = runtimeFile("cover-logo.png");
    const optimized = await sharp(buffer)
      .resize(400, 120, { fit: "inside", withoutEnlargement: false })
      .png({ compressionLevel: 9 })
      .toBuffer();

    writeFileSync(logoPath, optimized);
    saveSettings({ coverLogoCustom: true });

    return adminOk();
  } catch (err) {
    console.error("[admin/cover-logo POST]", err);
    return adminErr(toErrorMessage(err));
  }
}
