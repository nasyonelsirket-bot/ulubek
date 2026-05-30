import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { QueueItem, QueueStatus } from "@/data/types";

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const QUEUE_FILE = path.join(RUNTIME_DIR, "queue.json");

function ensureDir() {
  if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
}

function readQueue(): QueueItem[] {
  try {
    if (!existsSync(QUEUE_FILE)) return [];
    return JSON.parse(readFileSync(QUEUE_FILE, "utf-8")) as QueueItem[];
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]) {
  ensureDir();
  writeFileSync(QUEUE_FILE, JSON.stringify(items.slice(0, 1000), null, 2), "utf-8");
}

export function getQueueItems(status?: QueueStatus): QueueItem[] {
  const all = readQueue();
  if (!status) return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all.filter((i) => i.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addQueueItem(item: Omit<QueueItem, "id" | "createdAt" | "updatedAt">): QueueItem {
  const queue = readQueue();
  const entry: QueueItem = {
    ...item,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  queue.unshift(entry);
  writeQueue(queue);
  return entry;
}

export function updateQueueItem(id: string, data: Partial<QueueItem>) {
  const queue = readQueue();
  const idx = queue.findIndex((i) => i.id === id);
  if (idx >= 0) {
    queue[idx] = { ...queue[idx], ...data, updatedAt: new Date().toISOString() };
    writeQueue(queue);
  }
}

export function isUrlInQueue(url: string): boolean {
  return readQueue().some((i) => i.sourceUrl === url);
}

export function getQueueStats() {
  const all = readQueue();
  return {
    total: all.length,
    scanned: all.filter((i) => i.status === "SCANNED").length,
    pending: all.filter((i) => i.status === "PENDING").length,
    published: all.filter((i) => i.status === "PUBLISHED").length,
    rejected: all.filter((i) => i.status === "REJECTED").length,
  };
}
