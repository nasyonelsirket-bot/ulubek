import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { PipelineSummary } from "./pipeline";

export interface PipelineLogEntry {
  id: string;
  timestamp: string;
  sourceId?: string;
  sourceName?: string;
  imported: number;
  skipped: number;
  duplicate: number;
  spam: number;
  published: number;
  errors: string[];
  trigger: "cron" | "manual" | "single";
}

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const LOG_FILE = path.join(RUNTIME_DIR, "pipeline-log.json");
const MAX_LOGS = 100;

function ensureDir() {
  if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
}

export function appendPipelineLog(
  summary: PipelineSummary,
  trigger: PipelineLogEntry["trigger"],
  sourceId?: string
): PipelineLogEntry {
  const duplicate = summary.sources.reduce((n, s) => n + (s.duplicate ?? 0), 0);
  const spam = summary.sources.reduce((n, s) => n + (s.spam ?? 0), 0);

  const entry: PipelineLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: summary.timestamp,
    sourceId,
    sourceName: sourceId
      ? summary.sources.find((s) => s.sourceId === sourceId)?.sourceName
      : undefined,
    imported: summary.imported,
    skipped: summary.skipped,
    duplicate,
    spam,
    published: summary.imported,
    errors: summary.sources.flatMap((s) => s.errors),
    trigger,
  };

  ensureDir();
  const existing = existsSync(LOG_FILE)
    ? (JSON.parse(readFileSync(LOG_FILE, "utf-8")) as PipelineLogEntry[])
    : [];
  writeFileSync(LOG_FILE, JSON.stringify([entry, ...existing].slice(0, MAX_LOGS), null, 2), "utf-8");
  return entry;
}

export function getPipelineLogs(): PipelineLogEntry[] {
  try {
    if (!existsSync(LOG_FILE)) return [];
    return JSON.parse(readFileSync(LOG_FILE, "utf-8")) as PipelineLogEntry[];
  } catch {
    return [];
  }
}

export function getTotalImportedCount(): number {
  return getPipelineLogs().reduce((n, log) => n + log.imported, 0);
}

export function getLastRunAt(): string | null {
  const logs = getPipelineLogs();
  return logs[0]?.timestamp ?? null;
}
