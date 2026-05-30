import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "data", "runtime", "images");

export function getOptimizedImagePath(filename: string): Buffer | null {
  const safe = path.basename(filename);
  const filePath = path.join(IMAGES_DIR, safe);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath);
}
