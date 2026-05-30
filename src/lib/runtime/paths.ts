import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";

let cachedRuntimeDir: string | null = null;

function isServerlessEnv(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL ||
      process.env.NF_DEPLOYMENT_ID
  );
}

function canWriteDir(dir: string): boolean {
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    writeFileSync(probe, "ok", "utf-8");
    unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

/** Netlify/serverless ortamlarında /tmp öncelikli yedek dizin kullanır. */
export function getRuntimeDir(): string {
  if (cachedRuntimeDir) return cachedRuntimeDir;

  const projectDir = path.join(process.cwd(), "data", "runtime");
  const tmpDir = path.join(os.tmpdir(), "ulubekmedya-runtime");
  const candidates = isServerlessEnv()
    ? [tmpDir, projectDir]
    : [projectDir, tmpDir];

  for (const dir of candidates) {
    if (canWriteDir(dir)) {
      cachedRuntimeDir = dir;
      return dir;
    }
  }

  cachedRuntimeDir = tmpDir;
  try {
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  } catch {
    // Son çare — okuma yine denenecek
  }
  return cachedRuntimeDir;
}

export function runtimeFile(name: string): string {
  return path.join(getRuntimeDir(), name);
}

export function ensureRuntimeDir(): void {
  getRuntimeDir();
}

export function readRuntimeJson<T>(name: string, fallback: T): T {
  try {
    const file = runtimeFile(name);
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch (err) {
    console.error("[runtime] read failed:", name, err);
    return fallback;
  }
}

export function writeRuntimeJson(name: string, data: unknown): boolean {
  try {
    ensureRuntimeDir();
    writeFileSync(runtimeFile(name), JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[runtime] write failed:", name, err);
    return false;
  }
}

export function runtimeFileExists(name: string): boolean {
  try {
    return existsSync(runtimeFile(name));
  } catch {
    return false;
  }
}
