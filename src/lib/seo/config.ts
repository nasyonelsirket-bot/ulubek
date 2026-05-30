export const SITE_NAME = "Ulubek Medya";

export const SITE_TAGLINE = "Doğru Haber, Güçlü Etki";

export const SITE_DESCRIPTION =
  "Ulubek Medya — Doğru Haber, Güçlü Etki. Türkiye ve dünyadan son dakika haberleri, güncel gelişmeler, ekonomi, spor ve teknoloji.";

export const SITE_LOCALE = "tr_TR";
export const SITE_LANGUAGE = "tr";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://ulubekmedya.com";
  return url.replace(/\/$/, "");
}

export function getTwitterHandle(): string | undefined {
  const handle = process.env.NEXT_PUBLIC_TWITTER_HANDLE;
  return handle?.startsWith("@") ? handle : handle ? `@${handle}` : undefined;
}

export const STATIC_SEO_PAGES = [
  { path: "", changeFrequency: "always" as const, priority: 1 },
  { path: "/hakkimizda", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/iletisim", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/gizlilik", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/arama", changeFrequency: "weekly" as const, priority: 0.4 },
];

export const NEWS_SITEMAP_MAX_AGE_HOURS = 48;
