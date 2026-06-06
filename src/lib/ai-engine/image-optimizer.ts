import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getRuntimeDir } from "@/lib/runtime/paths";
import {
  composeAllCoverVariants,
  type CoverComposeInput,
} from "./cover-compositor";
import { scoreImageDimensions, MIN_IMAGE_QUALITY_SCORE } from "@/lib/utils/image-quality";
import { assessBlurVariance, MIN_BLUR_VARIANCE } from "@/lib/utils/image-quality";

const USER_AGENT = "UlubekMedya-ImageBot/2.0 (+https://ulubekmedya.com)";

function getImagesDir(): string {
  return path.join(getRuntimeDir(), "images");
}

export interface CoverUrls {
  web: string;
  square: string;
  story: string;
}

function ensureDir() {
  mkdirSync(getImagesDir(), { recursive: true });
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeId(fileId: string): string {
  return fileId.replace(/[^a-zA-Z0-9-_]/g, "");
}

async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  if (buffer.length < 8000) return false;

  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const quality = scoreImageDimensions(width, height, buffer.length);
  if (!quality.acceptable || quality.score < MIN_IMAGE_QUALITY_SCORE) return false;

  const blurVariance = await assessBlurVariance(buffer);
  if (blurVariance < MIN_BLUR_VARIANCE) return false;

  return true;
}

function saveCoverVariants(
  variants: { web: Buffer; square: Buffer; story: Buffer; baseName: string }
): CoverUrls {
  ensureDir();
  const id = variants.baseName;
  const webFile = `${id}.webp`;
  const squareFile = `${id}-square.webp`;
  const storyFile = `${id}-story.webp`;

  writeFileSync(path.join(getImagesDir(), webFile), variants.web);
  writeFileSync(path.join(getImagesDir(), squareFile), variants.square);
  writeFileSync(path.join(getImagesDir(), storyFile), variants.story);

  return {
    web: `/api/media/${webFile}`,
    square: `/api/media/${squareFile}`,
    story: `/api/media/${storyFile}`,
  };
}

export async function bufferFromSource(source: string): Promise<Buffer | null> {
  try {
    if (source.startsWith("data:")) {
      const base64 = source.split(",")[1];
      if (!base64) return null;
      return Buffer.from(base64, "base64");
    }

    if (!isValidImageUrl(source)) return null;

    const res = await fetch(source, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/") && !source.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
      return null;
    }

    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function createNewsCoversFromBufferLite(
  buffer: Buffer,
  fileId: string,
  coverInput: CoverComposeInput
): Promise<CoverUrls | null> {
  try {
    if (buffer.length < 2000) return null;
    const variants = await composeAllCoverVariants(buffer, coverInput, sanitizeId(fileId));
    return saveCoverVariants(variants);
  } catch {
    return null;
  }
}

export async function createNewsCoversFromBuffer(
  buffer: Buffer,
  fileId: string,
  coverInput: CoverComposeInput
): Promise<CoverUrls | null> {
  try {
    if (!(await validateImageBuffer(buffer))) return null;

    const variants = await composeAllCoverVariants(buffer, coverInput, sanitizeId(fileId));
    return saveCoverVariants(variants);
  } catch {
    return null;
  }
}

export async function createNewsCoversFromUrl(
  sourceUrl: string,
  fileId: string,
  coverInput: CoverComposeInput
): Promise<CoverUrls | null> {
  const buffer = await bufferFromSource(sourceUrl);
  if (!buffer) return null;
  return createNewsCoversFromBuffer(buffer, fileId, coverInput);
}

export async function optimizeSourceImage(
  sourceUrl: string,
  fileId: string,
  coverInput?: CoverComposeInput
): Promise<string | null> {
  if (!coverInput) {
    const result = await createNewsCoversFromUrl(sourceUrl, fileId, {
      title: "Haber",
      categoryName: "Gündem",
      categoryColor: "#c41e1e",
    });
    return result?.web ?? null;
  }
  const result = await createNewsCoversFromUrl(sourceUrl, fileId, coverInput);
  return result?.web ?? null;
}

export async function optimizeRemoteToWebp(
  imageUrl: string,
  fileId: string,
  coverInput?: CoverComposeInput
): Promise<string | null> {
  return optimizeSourceImage(imageUrl, fileId, coverInput);
}

export async function createNewsCovers(
  source: string | Buffer,
  fileId: string,
  coverInput: CoverComposeInput
): Promise<CoverUrls | null> {
  if (Buffer.isBuffer(source)) {
    return createNewsCoversFromBuffer(source, fileId, coverInput);
  }
  return createNewsCoversFromUrl(source, fileId, coverInput);
}
