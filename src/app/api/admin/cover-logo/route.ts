import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { saveSettings } from "@/lib/settings/store";

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const LOGO_PATH = path.join(RUNTIME_DIR, "cover-logo.png");

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("logo");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Logo dosyası gerekli" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 500) {
      return NextResponse.json({ error: "Dosya çok küçük" }, { status: 400 });
    }

    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
      return NextResponse.json({ error: "Geçersiz görsel" }, { status: 400 });
    }

    if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });

    const optimized = await sharp(buffer)
      .resize(400, 120, { fit: "inside", withoutEnlargement: false })
      .png({ compressionLevel: 9 })
      .toBuffer();

    writeFileSync(LOGO_PATH, optimized);
    saveSettings({ coverLogoCustom: true });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Logo işlenemedi" }, { status: 500 });
  }
}
