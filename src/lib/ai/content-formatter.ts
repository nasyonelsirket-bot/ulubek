import { stripHtml } from "@/lib/utils/content";

export const REQUIRED_SECTIONS = [
  "Özet",
  "Gelişmeler",
  "Detaylar",
  "Uzman Değerlendirmeleri",
  "Olası Etkiler",
  "Son Durum",
] as const;

export function countWords(text: string): number {
  return stripHtml(text).split(/\s+/).filter(Boolean).length;
}

export function sanitizeArticleHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/<(?!p|\/p|h2|\/h2|h3|\/h3|strong|\/strong|em|\/em|ul|\/ul|li|\/li)[^>]+>/gi, "")
    .trim();
}

export function enrichArticleHtml(html: string): string {
  let sectionIndex = 0;
  return sanitizeArticleHtml(html).replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attrs, text) => {
    const id = `section-${sectionIndex++}`;
    const cleanAttrs = attrs.replace(/\sid="[^"]*"/gi, "");
    return `<h2 id="${id}"${cleanAttrs}>${stripHtml(text)}</h2>`;
  });
}

export function buildExcerptFromContent(content: string, minWords = 150, maxWords = 250): string {
  const paragraphs = stripHtml(content)
    .split(/\n{2,}|(?<=\.)\s+(?=[A-ZÇĞİÖŞÜ])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  let excerpt = "";
  for (const p of paragraphs) {
    if (countWords(excerpt) >= minWords) break;
    excerpt += (excerpt ? " " : "") + p;
  }

  const words = excerpt.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "…";
  }
  return excerpt;
}

export function ensureMinimumExcerpt(excerpt: string, content: string): string {
  const wordCount = countWords(excerpt);
  if (wordCount >= 150) return excerpt.trim();
  return buildExcerptFromContent(content, 150, 250);
}

export function hasRequiredSections(html: string): boolean {
  return REQUIRED_SECTIONS.filter((s) => s !== "Özet").every((s) =>
    new RegExp(`<h2[^>]*>\\s*${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<\\/h2>`, "i").test(html)
  );
}

export function isWithinLookbackDays(dateStr: string | undefined | null, days: number): boolean {
  if (!dateStr) return true;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return parsed.getTime() >= cutoff;
}
