import type { MockSource } from "./types";

export const sources: MockSource[] = [
  {
    id: "src-1",
    name: "Anadolu Ajansı",
    url: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
    type: "RSS",
    isActive: true,
    trustScore: 0.95,
    categoryId: "1",
    lastFetchedAt: "2026-05-30T08:00:00",
    fetchIntervalMin: 30,
  },
  {
    id: "src-2",
    name: "BBC Türkçe",
    url: "https://www.bbc.com/turkce/index.xml",
    type: "RSS",
    isActive: true,
    trustScore: 0.9,
    categoryId: "6",
    lastFetchedAt: "2026-05-30T07:30:00",
    fetchIntervalMin: 60,
  },
];

export function getSourceById(id: string): MockSource | undefined {
  return sources.find((s) => s.id === id);
}
