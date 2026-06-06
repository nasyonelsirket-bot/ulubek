/** Yalnızca Haberler.com + SonDakika.com anlık senkronizasyonu. */
export type NewsSyncPhase = 1;

export function getNewsSyncPhase(): NewsSyncPhase {
  return 1;
}

export const ACTIVE_PORTAL_URLS = new Set([
  "https://rss.haberler.com/",
  "https://rss.sondakika.com/",
]);

/** RSS kaynakları devre dışı — boş küme döner. */
export function getFeedUrlsForPhase(): Set<string> {
  return new Set();
}

export function getPortalUrlsForPhase(): Set<string> {
  return ACTIVE_PORTAL_URLS;
}

export function getPhaseLimits() {
  return {
    maxSourcesPerRun: 2,
    maxImportPerSource: 10,
    newsApiFeedsPerSync: 0,
  };
}

export function getPhaseLabel(): string {
  return "Haberler.com + SonDakika.com";
}
