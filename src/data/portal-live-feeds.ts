/** Haberler.com / SonDakika.com anlık haber listeleri (rss.*.com HTML feed). */
export interface PortalLiveFeed {
  name: string;
  url: string;
  categorySlug: string;
  trustScore: number;
  fetchIntervalMin?: number;
}

export const PORTAL_LIVE_FEEDS: PortalLiveFeed[] = [
  {
    name: "Haberler.com — Son Dakika",
    url: "https://rss.haberler.com/",
    categorySlug: "gundem",
    trustScore: 0.88,
    fetchIntervalMin: 1,
  },
  {
    name: "SonDakika.com — Son Dakika",
    url: "https://rss.sondakika.com/",
    categorySlug: "gundem",
    trustScore: 0.87,
    fetchIntervalMin: 1,
  },
];
