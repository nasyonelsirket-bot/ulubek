/** Haber senkronizasyon fazı — Netlify timeout önlemek için kademeli açılım. */
export type NewsSyncPhase = 1 | 2 | 3;

export function getNewsSyncPhase(): NewsSyncPhase {
  const raw = Number(process.env.NEWS_SYNC_PHASE ?? "1");
  if (raw === 2 || raw === 3) return raw;
  return 1;
}

/** Faz 1: en güvenilir 8 kaynak + Haberler.com + SonDakika.com */
export const PHASE1_FEED_URLS = new Set([
  "https://www.aa.com.tr/tr/rss/default?cat=guncel",
  "https://www.aa.com.tr/tr/rss/default?cat=ekonomi",
  "https://www.aa.com.tr/tr/rss/default?cat=spor",
  "https://www.trthaber.com/rss/gundem.xml",
  "https://www.trthaber.com/rss/spor.xml",
  "https://www.trthaber.com/rss/ekonomi.xml",
  "https://www.ntv.com.tr/gundem.rss",
  "https://www.ntv.com.tr/spor.rss",
]);

export const PHASE1_PORTAL_URLS = new Set([
  "https://rss.haberler.com/",
  "https://rss.sondakika.com/",
]);

/** Faz 2: faz1 + haberturk + bbc + google news tr */
export const PHASE2_FEED_URLS = new Set([
  ...PHASE1_FEED_URLS,
  "https://www.haberturk.com/rss/kategori/gundem.xml",
  "https://www.haberturk.com/rss/kategori/spor.xml",
  "https://www.bbc.com/turkce/index.xml",
  "https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr",
  "https://www.cnnturk.com/feed/rss/all/news",
]);

export const PHASE2_PORTAL_URLS = PHASE1_PORTAL_URLS;

export function getFeedUrlsForPhase(phase: NewsSyncPhase): Set<string> | null {
  if (phase === 1) return PHASE1_FEED_URLS;
  if (phase === 2) return PHASE2_FEED_URLS;
  return null; // faz 3 = tüm kaynaklar
}

export function getPortalUrlsForPhase(phase: NewsSyncPhase): Set<string> | null {
  if (phase === 1) return PHASE1_PORTAL_URLS;
  if (phase === 2) return PHASE2_PORTAL_URLS;
  return null;
}

export function getPhaseLimits(phase: NewsSyncPhase) {
  switch (phase) {
    case 1:
      return { maxSourcesPerRun: 6, maxImportPerSource: 2, newsApiFeedsPerSync: 2 };
    case 2:
      return { maxSourcesPerRun: 8, maxImportPerSource: 3, newsApiFeedsPerSync: 3 };
    default:
      return { maxSourcesPerRun: 12, maxImportPerSource: 5, newsApiFeedsPerSync: 5 };
  }
}

export function getPhaseLabel(phase: NewsSyncPhase): string {
  if (phase === 1) return "Faz 1 — temel kaynaklar + Haberler/SonDakika";
  if (phase === 2) return "Faz 2 — genişletilmiş kaynaklar";
  return "Faz 3 — tüm kaynaklar";
}
