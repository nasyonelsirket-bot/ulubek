import type { PipelineSummary, PipelineResult } from "./pipeline";
import { readRuntimeJson, writeRuntimeJson } from "@/lib/runtime/paths";

export interface SourceScanDetail {
  sourceId: string;
  sourceName: string;
  found: number;
  imported: number;
  skipped: number;
  duplicate: number;
  spam: number;
  errors: string[];
}

export interface PipelineLogEntry {
  id: string;
  timestamp: string;
  sourceId?: string;
  sourceName?: string;
  found: number;
  imported: number;
  skipped: number;
  duplicate: number;
  spam: number;
  published: number;
  errors: string[];
  trigger: "cron" | "manual" | "single" | "bootstrap";
  sources: SourceScanDetail[];
  message?: string;
}

const MAX_LOGS = 200;

function mapSourceDetail(s: PipelineResult): SourceScanDetail {
  return {
    sourceId: s.sourceId,
    sourceName: s.sourceName,
    found: s.found,
    imported: s.imported,
    skipped: s.skipped,
    duplicate: s.duplicate,
    spam: s.spam,
    errors: s.errors,
  };
}

export function appendPipelineLog(
  summary: PipelineSummary,
  trigger: PipelineLogEntry["trigger"],
  sourceId?: string,
  message?: string
): PipelineLogEntry {
  const duplicate = summary.sources.reduce((n, s) => n + (s.duplicate ?? 0), 0);
  const spam = summary.sources.reduce((n, s) => n + (s.spam ?? 0), 0);
  const found = summary.sources.reduce((n, s) => n + (s.found ?? 0), 0);

  const entry: PipelineLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: summary.timestamp,
    sourceId,
    sourceName: sourceId
      ? summary.sources.find((s) => s.sourceId === sourceId)?.sourceName
      : undefined,
    found,
    imported: summary.imported,
    skipped: summary.skipped,
    duplicate,
    spam,
    published: summary.imported,
    errors: summary.sources.flatMap((s) => s.errors),
    trigger,
    sources: summary.sources.map(mapSourceDetail),
    message,
  };

  const existing = readRuntimeJson<PipelineLogEntry[]>("pipeline-log.json", []);
  writeRuntimeJson("pipeline-log.json", [entry, ...existing].slice(0, MAX_LOGS));
  return entry;
}

export function getPipelineLogs(): PipelineLogEntry[] {
  return readRuntimeJson<PipelineLogEntry[]>("pipeline-log.json", []);
}

export function getTotalImportedCount(): number {
  return getPipelineLogs().reduce((n, log) => n + log.imported, 0);
}

export function getLastRunAt(): string | null {
  const logs = getPipelineLogs();
  return logs[0]?.timestamp ?? null;
}
