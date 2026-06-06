import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { getRuntimeDir } from "@/lib/runtime/paths";

function getImagesDir(): string {
  return path.join(getRuntimeDir(), "images");
}

export function getOptimizedImagePath(filename: string): Buffer | null {
  const safe = path.basename(filename);
  const filePath = path.join(getImagesDir(), safe);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath);
}
