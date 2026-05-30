import { createHash } from "crypto";

export function estimateViewCount(articleId: string, publishedAt: Date | string): number {
  const hash = createHash("md5").update(articleId).digest("hex");
  const base = parseInt(hash.slice(0, 6), 16) % 8000;
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));
  const freshness = Math.max(200, 3500 - ageHours * 12);
  return Math.floor(500 + base + freshness);
}

export function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}
