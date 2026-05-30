import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getSettings } from "@/lib/settings/store";
import type { CoverTitleStyle, LogoPosition } from "@/lib/settings/types";

export type CoverVariant = "web" | "square" | "story";

export const COVER_VARIANTS: Record<CoverVariant, { width: number; height: number; suffix: string }> = {
  web: { width: 1200, height: 675, suffix: "" },
  square: { width: 1080, height: 1080, suffix: "-square" },
  story: { width: 1080, height: 1920, suffix: "-story" },
};

export interface CoverComposeInput {
  title: string;
  categoryName: string;
  categoryColor: string;
  breaking?: boolean;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapTitle(title: string, maxLines: number, maxChars: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      if (lines.length >= maxLines) break;
      current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

function titleFontSize(variant: CoverVariant, style: CoverTitleStyle): number {
  const base = { web: 46, square: 42, story: 52 }[variant];
  if (style === "impact") return base + 10;
  if (style === "compact") return base - 6;
  return base;
}

function titleLineHeight(style: CoverTitleStyle): number {
  if (style === "compact") return 1.15;
  if (style === "impact") return 1.08;
  return 1.12;
}

function maxCharsPerLine(variant: CoverVariant): number {
  return { web: 38, square: 28, story: 24 }[variant];
}

function gradientHeight(variant: CoverVariant): number {
  return { web: 0.62, square: 0.55, story: 0.45 }[variant];
}

function buildOverlaySvg(
  variant: CoverVariant,
  input: CoverComposeInput,
  logoWidth: number,
  logoHeight: number,
  logoPosition: LogoPosition,
  titleStyle: CoverTitleStyle,
  showBreaking: boolean,
  showWatermark: boolean
): string {
  const { width, height } = COVER_VARIANTS[variant];
  const lines = wrapTitle(input.title, 3, maxCharsPerLine(variant));
  const fontSize = titleFontSize(variant, titleStyle);
  const lineHeight = titleLineHeight(titleStyle);
  const pad = variant === "story" ? 48 : 36;
  const gradH = Math.round(height * gradientHeight(variant));
  const gradY = height - gradH;

  const logoPad = 28;
  const logoX = logoPosition === "top-right" ? width - logoWidth - logoPad : logoPad;
  const logoY = logoPad;

  const categoryY = height - pad - lines.length * fontSize * lineHeight - 24;
  const breakingY = showBreaking && input.breaking ? categoryY - 44 : categoryY;
  const titleStartY = categoryY + 36;

  const titleLines = lines
    .map((line, i) => {
      const y = titleStartY + i * fontSize * lineHeight;
      const transform = titleStyle === "impact" && i === 0 ? ' text-transform="uppercase"' : "";
      return `<tspan x="${pad}" y="${y}"${transform} font-weight="${titleStyle === "impact" ? 900 : 800}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const breakingBadge =
    showBreaking && input.breaking
      ? `<rect x="${pad}" y="${breakingY - 28}" width="130" height="32" rx="4" fill="#c41e1e"/>
         <text x="${pad + 65}" y="${breakingY - 8}" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="800" letter-spacing="1">SON DAKİKA</text>`
      : "";

  const categoryBadge = `<rect x="${pad}" y="${categoryY - 4}" width="${Math.min(input.categoryName.length * 11 + 24, 200)}" height="28" rx="4" fill="${input.categoryColor}"/>
    <text x="${pad + 12}" y="${categoryY + 16}" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">${escapeXml(input.categoryName.toUpperCase())}</text>`;

  const watermark =
    showWatermark && !logoWidth
      ? `<text x="${logoX}" y="${logoY + 20}" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="800" opacity="0.9">ULUBEK MEDYA</text>`
      : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="35%" stop-color="rgba(0,0,0,0.15)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.88)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${gradY}" width="${width}" height="${gradH}" fill="url(#grad)"/>
    ${watermark}
    ${breakingBadge}
    ${categoryBadge}
    <text fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="800" style="text-shadow: 0 2px 8px rgba(0,0,0,0.6)">
      ${titleLines}
    </text>
  </svg>`;
}

export async function loadCoverLogo(): Promise<{ buffer: Buffer; width: number; height: number } | null> {
  const settings = getSettings();
  const customPath = path.join(process.cwd(), "data", "runtime", "cover-logo.png");
  const defaultPath = path.join(process.cwd(), "public", "logo.png");

  let logoPath: string | null = null;
  if (settings.coverLogoCustom && existsSync(customPath)) {
    logoPath = customPath;
  } else if (existsSync(defaultPath)) {
    logoPath = defaultPath;
  }

  if (!logoPath) return null;

  try {
    const buffer = readFileSync(logoPath);
    const meta = await sharp(buffer).metadata();
    const maxW = 180;
    const maxH = 56;
    const w = meta.width ?? maxW;
    const h = meta.height ?? maxH;
    const scale = Math.min(maxW / w, maxH / h, 1);
    const resized = await sharp(buffer)
      .resize(Math.round(w * scale), Math.round(h * scale), { fit: "inside" })
      .png()
      .toBuffer();
    const resizedMeta = await sharp(resized).metadata();
    return {
      buffer: resized,
      width: resizedMeta.width ?? maxW,
      height: resizedMeta.height ?? maxH,
    };
  } catch {
    return null;
  }
}

export async function composeCoverFromBuffer(
  baseBuffer: Buffer,
  input: CoverComposeInput,
  variant: CoverVariant
): Promise<Buffer> {
  const settings = getSettings();
  const { width, height } = COVER_VARIANTS[variant];

  if (!settings.coverBrandingEnabled) {
    return sharp(baseBuffer)
      .rotate()
      .resize(width, height, { fit: "cover", position: "attention" })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();
  }

  const logo = settings.coverWatermarkEnabled ? await loadCoverLogo() : null;
  const logoPosition = settings.coverLogoPosition;
  const overlaySvg = buildOverlaySvg(
    variant,
    input,
    logo?.width ?? 0,
    logo?.height ?? 0,
    logoPosition,
    settings.coverTitleStyle,
    settings.coverBreakingTagEnabled,
    settings.coverWatermarkEnabled
  );

  const overlayBuffer = await sharp(Buffer.from(overlaySvg)).png().toBuffer();

  const base = sharp(baseBuffer)
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" });

  const composites: sharp.OverlayOptions[] = [{ input: overlayBuffer, top: 0, left: 0 }];

  if (logo && settings.coverWatermarkEnabled) {
    const logoPad = 28;
    const left = logoPosition === "top-right" ? width - logo.width - logoPad : logoPad;
    composites.push({ input: logo.buffer, top: logoPad, left });
  }

  return base.composite(composites).webp({ quality: 88, effort: 4 }).toBuffer();
}

export async function composeAllCoverVariants(
  baseBuffer: Buffer,
  input: CoverComposeInput,
  fileId: string
): Promise<{ web: Buffer; square: Buffer; story: Buffer; baseName: string }> {
  const safeId = fileId.replace(/[^a-zA-Z0-9-_]/g, "");
  const [web, square, story] = await Promise.all([
    composeCoverFromBuffer(baseBuffer, input, "web"),
    composeCoverFromBuffer(baseBuffer, input, "square"),
    composeCoverFromBuffer(baseBuffer, input, "story"),
  ]);
  return { web, square, story, baseName: safeId };
}
