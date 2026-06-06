import type { MockSource } from "./types";

/** Yalnızca anlık portal kaynakları — admin panelden tek tıkla eklenebilir */
export const PORTAL_NEWS_SOURCES: Omit<MockSource, "id" | "lastFetchedAt">[] = [
  {
    name: "Haberler.com",
    url: "https://rss.haberler.com/",
    type: "MANUAL",
    kind: "MANUAL",
    fetchType: "WEB",
    urlType: "SITE",
    isActive: true,
    trustScore: 0.88,
    categoryId: "1",
    fetchIntervalMin: 1,
  },
  {
    name: "SonDakika.com",
    url: "https://rss.sondakika.com/",
    type: "MANUAL",
    kind: "MANUAL",
    fetchType: "WEB",
    urlType: "SITE",
    isActive: true,
    trustScore: 0.87,
    categoryId: "1",
    fetchIntervalMin: 1,
  },
];
