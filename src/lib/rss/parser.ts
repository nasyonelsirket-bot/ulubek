import Parser from "rss-parser";

export interface ParsedFeedItem {
  title: string;
  link: string;
  guid: string;
  content: string;
  excerpt: string;
  image?: string;
  publishedAt: Date;
  categories: string[];
}

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "UlubekMedya-RSS-Bot/1.0 (+https://ulubekmedya.com)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

function extractImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) {
    return enclosure.url;
  }

  const mediaContent = item.mediaContent as { $?: { url?: string }; url?: string } | undefined;
  const mediaUrl = mediaContent?.$?.url || mediaContent?.url;
  if (mediaUrl) return mediaUrl;

  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string }; url?: string } | undefined;
  const thumbUrl = mediaThumbnail?.$?.url || mediaThumbnail?.url;
  if (thumbUrl) return thumbUrl;

  const content = String(item.contentEncoded || item.content || item.summary || "");
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch?.[1];
}

function parseDate(item: Record<string, unknown>): Date {
  const raw = item.isoDate || item.pubDate;
  if (raw) {
    const d = new Date(String(raw));
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export async function fetchAndParseFeed(feedUrl: string): Promise<ParsedFeedItem[]> {
  const feed = await parser.parseURL(feedUrl);

  return (feed.items || [])
    .filter((item) => item.title && (item.link || item.guid))
    .map((item) => {
      const record = item as unknown as Record<string, unknown>;
      const rawContent = String(
        record.contentEncoded || item.content || item.contentSnippet || item.summary || ""
      );
      const link = String(item.link || item.guid || "").trim();
      const guid = String(item.guid || record.id || link).trim();

      return {
        title: String(item.title).trim(),
        link,
        guid,
        content: rawContent,
        excerpt: String(item.contentSnippet || item.summary || "").trim(),
        image: extractImage(record),
        publishedAt: parseDate(record),
        categories: (item.categories || []).map(String),
      };
    });
}
