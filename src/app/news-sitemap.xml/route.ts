import { getSiteUrl, NEWS_SITEMAP_MAX_AGE_HOURS, SITE_LANGUAGE, SITE_NAME } from "@/lib/seo/config";
import { escapeXml } from "@/lib/seo/xml";
import { getArticlesForNewsSitemap } from "@/lib/services/articles";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const baseUrl = getSiteUrl();
  const articles = await getArticlesForNewsSitemap(NEWS_SITEMAP_MAX_AGE_HOURS);

  const urls = articles
    .map((article) => {
      const loc = `${baseUrl}/haber/${article.slug}`;
      const title = escapeXml(article.metaTitle || article.title);
      const pubDate = article.publishedAt.toISOString();

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>${SITE_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
