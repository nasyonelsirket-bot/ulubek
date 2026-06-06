import * as cheerio from "cheerio";

export interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  image?: string;
  publishedAt?: string;
}

const USER_AGENT = "UlubekMedya-Bot/2.0 (+https://ulubekmedya.com)";

function resolveUrl(base: string, href?: string | null): string | undefined {
  if (!href?.trim()) return undefined;
  try {
    return new URL(href.trim(), base).href;
  } catch {
    return href.trim();
  }
}

function pickMeta(html: string, pageUrl: string): {
  title?: string;
  content?: string;
  image?: string;
  publishedAt?: string;
} {
  const $ = cheerio.load(html.slice(0, 200_000));

  const title =
    $("meta[property='og:title']").attr("content")?.trim() ||
    $("meta[name='twitter:title']").attr("content")?.trim() ||
    $("title").text().trim();

  const content =
    $("meta[property='og:description']").attr("content")?.trim() ||
    $("meta[name='twitter:description']").attr("content")?.trim() ||
    $("meta[name='description']").attr("content")?.trim();

  const image = resolveUrl(
    pageUrl,
    $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content") ||
      $("meta[property='og:image:url']").attr("content") ||
      $("link[rel='image_src']").attr("href")
  );

  const publishedAt =
    $("meta[property='article:published_time']").attr("content")?.trim() ||
    $("meta[name='date']").attr("content")?.trim() ||
    $("time[datetime]").first().attr("datetime")?.trim();

  return { title, content, image, publishedAt };
}

/** rss.haberler.com / rss.sondakika.com HTML haber listeleri */
export function isPortalRssUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "rss.haberler.com" || host === "rss.sondakika.com";
  } catch {
    return false;
  }
}

export async function scrapePortalRssPage(baseUrl: string, limit = 15): Promise<ScrapedArticle[]> {
  const res = await fetch(baseUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Portal feed alınamadı: HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapedArticle[] = [];
  const seen = new Set<string>();

  $("li.news-item a.news-link, .news-item a.news-link").each((_, el) => {
    if (items.length >= limit) return false;
    const href = $(el).attr("href");
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!href || !title || title.length < 12) return;

    const url = resolveUrl(baseUrl, href);
    if (!url || seen.has(url)) return;

    seen.add(url);
    items.push({ title, url, content: title });
  });

  if (items.length === 0) {
    throw new Error("Portal feed'de haber bulunamadı");
  }

  return items;
}

/** Hızlı og: meta okuma — görsel ve kısa özet için */
export async function scrapeArticleMeta(
  url: string
): Promise<Pick<ScrapedArticle, "title" | "content" | "image" | "publishedAt"> | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const meta = pickMeta(html, url);

  if (!meta.title) return null;
  return {
    title: meta.title,
    content: meta.content && meta.content.length >= 20 ? meta.content : meta.title,
    image: meta.image,
    publishedAt: meta.publishedAt,
  };
}

/** Haberler / SonDakika kategori sayfalarından haber linkleri. */
export async function scrapePortalArticleLinks(pageUrl: string, limit = 20): Promise<ScrapedArticle[]> {
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Liste sayfası alınamadı: HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;
  const items: ScrapedArticle[] = [];
  const seen = new Set<string>();

  $("a[href*='-haberi/']").each((_, el) => {
    if (items.length >= limit) return false;
    const href = $(el).attr("href");
    let title = $(el).text().replace(/\s+/g, " ").trim();
    if (!href) return;

    const url = resolveUrl(origin, href);
    if (!url || !url.startsWith(origin)) return;
    if (seen.has(url)) return;
    if (/(reklam|iletisim|giris|login|#)/i.test(url)) return;

    if (title.length < 15) {
      title = $(el).attr("title")?.trim() || title;
    }
    if (title.length < 15) return;

    seen.add(url);
    items.push({ title, url, content: title });
  });

  return items;
}

export async function scrapeWebsite(baseUrl: string, limit = 8): Promise<ScrapedArticle[]> {
  const res = await fetch(baseUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Sayfa alınamadı: HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const origin = new URL(baseUrl).origin;
  const seen = new Set<string>();
  const items: ScrapedArticle[] = [];

  $("a[href]").each((_, el) => {
    if (items.length >= limit) return;
    const href = $(el).attr("href");
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!href || !title || title.length < 20 || title.length > 200) return;

    const url = resolveUrl(origin, href);
    if (!url || !url.startsWith(origin) || seen.has(url)) return;
    if (/\.(pdf|jpg|png|gif|zip|doc)$/i.test(url)) return;
    if (/(login|giris|iletisim|contact|#)/i.test(url)) return;

    seen.add(url);
    items.push({ title, url, content: title });
  });

  return items;
}

export async function scrapeArticlePage(url: string): Promise<ScrapedArticle | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const meta = pickMeta(html, url);
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();

  const title =
    meta.title ||
    $("h1").first().text().trim() ||
    $("title").text().trim();

  const content =
    meta.content ||
    $("article p").slice(0, 6).text().trim() ||
    $("p").slice(0, 8).text().trim();

  const image = meta.image || resolveUrl(url, $("meta[property='og:image']").attr("content"));

  const publishedAt = meta.publishedAt;

  if (!title || content.length < 40) return null;
  return { title, url, content: content.slice(0, 5000), image, publishedAt };
}

export function isRssUrl(url: string): boolean {
  if (isPortalRssUrl(url)) return false;
  return /\.(xml|rss|rdf)$/i.test(url) || /\/rss/i.test(url) || url.includes("feed");
}
