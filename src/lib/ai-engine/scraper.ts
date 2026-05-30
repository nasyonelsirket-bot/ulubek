import * as cheerio from "cheerio";

export interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  image?: string;
  publishedAt?: string;
}

const USER_AGENT = "UlubekMedya-Bot/2.0 (+https://ulubekmedya.com)";

export async function scrapeWebsite(baseUrl: string, limit = 8): Promise<ScrapedArticle[]> {
  const res = await fetch(baseUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(20000),
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

    let url = href;
    try {
      url = new URL(href, origin).href;
    } catch {
      return;
    }

    if (!url.startsWith(origin) || seen.has(url)) return;
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
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();

  const title =
    $("meta[property='og:title']").attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim();

  const content =
    $("meta[property='og:description']").attr("content") ||
    $("article p").slice(0, 6).text().trim() ||
    $("p").slice(0, 8).text().trim();

  const image = $("meta[property='og:image']").attr("content");

  const publishedAt =
    $("meta[property='article:published_time']").attr("content") ||
    $("time[datetime]").first().attr("datetime") ||
    $("meta[name='date']").attr("content") ||
    undefined;

  if (!title || content.length < 40) return null;
  return { title, url, content: content.slice(0, 5000), image, publishedAt };
}

export function isRssUrl(url: string): boolean {
  return /\.(xml|rss|rdf)$/i.test(url) || /\/rss/i.test(url) || url.includes("feed");
}
