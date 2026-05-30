import type { QueueItem, QueueStatus } from "@/data/types";
import { readRuntimeJson, writeRuntimeJson } from "@/lib/runtime/paths";

function readQueue(): QueueItem[] {
  return readRuntimeJson<QueueItem[]>("queue.json", []);
}

function writeQueue(items: QueueItem[]) {
  writeRuntimeJson("queue.json", items.slice(0, 1000));
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
  const items = readQueue();
  return {
    total: items.length,
    pending: items.filter((i) => i.status === "PENDING").length,
    scanned: items.filter((i) => i.status === "SCANNED").length,
    published: items.filter((i) => i.status === "PUBLISHED").length,
    rejected: items.filter((i) => i.status === "REJECTED").length,
  };
}
