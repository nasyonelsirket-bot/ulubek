export const MIN_IMAGE_QUALITY_SCORE = 55;
export const MIN_WIDTH = 640;
export const MIN_HEIGHT = 360;
export const MIN_BLUR_VARIANCE = 35;

export interface ImageQualityResult {
  score: number;
  width: number;
  height: number;
  bytes: number;
  acceptable: boolean;
  reasons: string[];
}

export function scoreImageDimensions(
  width: number,
  height: number,
  bytes: number
): ImageQualityResult {
  const reasons: string[] = [];
  let score = 0;

  if (width >= 1200) score += 35;
  else if (width >= 800) score += 25;
  else if (width >= MIN_WIDTH) score += 15;
  else reasons.push("düşük genişlik");

  if (height >= 675) score += 25;
  else if (height >= 450) score += 18;
  else if (height >= MIN_HEIGHT) score += 10;
  else reasons.push("düşük yükseklik");

  const pixels = width * height;
  if (pixels >= 800_000) score += 20;
  else if (pixels >= 400_000) score += 12;
  else reasons.push("düşük çözünürlük");

  if (bytes >= 80_000) score += 10;
  else if (bytes >= 30_000) score += 5;
  else if (bytes < 8000) reasons.push("çok küçük dosya");

  const ratio = width / Math.max(height, 1);
  if (ratio >= 1.2 && ratio <= 2.2) score += 10;

  return {
    score: Math.min(100, score),
    width,
    height,
    bytes,
    acceptable: score >= MIN_IMAGE_QUALITY_SCORE && width >= MIN_WIDTH && height >= MIN_HEIGHT,
    reasons,
  };
}

export function scoreImageUrl(url: string): number {
  if (!url) return 0;
  if (url.startsWith("/api/media/")) return 95;
  if (url.includes("w=1200") || url.includes("1200x675")) return 90;
  if (url.includes("unsplash.com")) return 85;
  if (url.startsWith("data:image/svg")) return 20;
  if (url.includes("placeholder")) return 15;
  return 60;
}

export function isHighQualityImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  return scoreImageUrl(url) >= MIN_IMAGE_QUALITY_SCORE;
}

export function pickBestImage(candidates: (string | undefined | null)[]): string | undefined {
  let best: string | undefined;
  let bestScore = 0;
  for (const c of candidates) {
    if (!c?.trim()) continue;
    const s = scoreImageUrl(c);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return bestScore >= MIN_IMAGE_QUALITY_SCORE ? best : undefined;
}

const LAPLACIAN_KERNEL = {
  width: 3,
  height: 3,
  kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

export async function assessBlurVariance(buffer: Buffer): Promise<number> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(buffer)
      .greyscale()
      .resize(640, null, { withoutEnlargement: true })
      .convolve(LAPLACIAN_KERNEL)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const len = info.width * info.height;
    if (len === 0) return 0;

    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      sumSq += data[i] * data[i];
    }
    const mean = sum / len;
    return sumSq / len - mean * mean;
  } catch {
    return 100;
  }
}
