import { readRuntimeJson, writeRuntimeJson } from "@/lib/runtime/paths";

export interface NewsApiFeedStatus {
  id: string;
  name: string;
  found: number;
  imported: number;
  skipped: number;
  duplicate: number;
  lastFetchedAt: string | null;
  error?: string;
}

export interface NewsApiSyncState {
  lastSyncAt: string | null;
  lastSyncStatus: "idle" | "running" | "success" | "error";
  lastImported: number;
  lastFound: number;
  lastSkipped: number;
  lastDuplicate: number;
  lastError: string | null;
  feeds: NewsApiFeedStatus[];
  /** Takılı kalan running durumunu önlemek için */
  runningSince?: string | null;
  feedRotationIndex?: number;
}

const DEFAULT_STATE: NewsApiSyncState = {
  lastSyncAt: null,
  lastSyncStatus: "idle",
  lastImported: 0,
  lastFound: 0,
  lastSkipped: 0,
  lastDuplicate: 0,
  lastError: null,
  feeds: [],
};

export function getNewsApiSyncState(): NewsApiSyncState {
  return readRuntimeJson<NewsApiSyncState>("newsapi-sync.json", DEFAULT_STATE);
}

export function saveNewsApiSyncState(state: NewsApiSyncState): void {
  writeRuntimeJson("newsapi-sync.json", state);
}

export function markNewsApiSyncRunning(): NewsApiSyncState {
  const current = getNewsApiSyncState();
  const next = {
    ...current,
    lastSyncStatus: "running" as const,
    lastError: null,
    runningSince: new Date().toISOString(),
  };
  saveNewsApiSyncState(next);
  return next;
}

const STALE_RUNNING_MS = 3 * 60 * 1000;

function isStaleRunning(state: NewsApiSyncState): boolean {
  if (state.lastSyncStatus !== "running") return false;
  const since = state.runningSince || state.lastSyncAt;
  if (!since) return true;
  return Date.now() - new Date(since).getTime() > STALE_RUNNING_MS;
}

export function shouldRunNewsApiSync(intervalSeconds = 30): boolean {
  const state = getNewsApiSyncState();
  if (state.lastSyncStatus === "running" && !isStaleRunning(state)) return false;
  if (!state.lastSyncAt) return true;
  const elapsed = Date.now() - new Date(state.lastSyncAt).getTime();
  return elapsed >= intervalSeconds * 1000;
}
