import type { MockSource } from "./types";
import { MINISTRY_SOURCES } from "./ministry-sources";

export const sources: MockSource[] = [
  {
    id: "src-1",
    name: "Anadolu Ajansı",
    url: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
    type: "RSS",
    kind: "RSS",
    fetchType: "RSS",
    isActive: true,
    trustScore: 0.95,
    categoryId: "1",
    lastFetchedAt: "2026-05-30T08:00:00",
    fetchIntervalMin: 1,
  },
  {
    id: "src-2",
    name: "BBC Türkçe",
    url: "https://www.bbc.com/turkce/index.xml",
    type: "RSS",
    kind: "RSS",
    fetchType: "RSS",
    isActive: true,
    trustScore: 0.9,
    categoryId: "6",
    lastFetchedAt: "2026-05-30T07:30:00",
    fetchIntervalMin: 1,
  },
  ...MINISTRY_SOURCES.map((s, i) => ({
    ...s,
    id: `ministry-${i + 1}`,
    lastFetchedAt: null as string | null,
  })),
];

export function getSourceById(id: string): MockSource | undefined {
  return sources.find((s) => s.id === id);
}
