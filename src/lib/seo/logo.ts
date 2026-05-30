import { readFile } from "node:fs/promises";
import path from "node:path";

let cachedLogoBase64: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (!cachedLogoBase64) {
    const buffer = await readFile(path.join(process.cwd(), "public/logo.png"));
    cachedLogoBase64 = buffer.toString("base64");
  }
  return cachedLogoBase64;
}

export function getLogoDataUri(base64: string): string {
  return `data:image/png;base64,${base64}`;
}
