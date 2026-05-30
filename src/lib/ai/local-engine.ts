import type { AIProcessInput, AIProcessedResult } from "./types";
import { stripHtml, toHtmlParagraphs, truncate } from "@/lib/utils/content";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gundem: ["hükümet", "meclis", "bakan", "cumhurbaşkan", " seçim", "politika", "tbmm", "anayasa", "belediye", "vali"],
  ekonomi: ["ekonomi", "borsa", "dolar", "euro", "enflasyon", "faiz", "tcmb", "bütçe", "vergi", "piyasa", "kobi", "ihracat"],
  spor: ["futbol", "basketbol", "spor", "takım", "maç", "gol", "lig", "şampiyon", "milli takım", "transfer"],
  teknoloji: ["teknoloji", "yapay zeka", "ai", "yazılım", "apple", "google", "microsoft", "siber", "dijital", "mobil"],
  saglik: ["sağlık", "hastane", "doktor", "hastalık", "aşı", "tıp", "bakanlık sağlık", "tedavi", "virüs"],
  dunya: ["abd", "avrupa", "rusya", "çin", "bm", "nato", "ukrayna", "israil", "filistin", "uluslararası", "dünya"],
  "kultur-sanat": ["sinema", "film", "müzik", "kitap", "sanat", "tiyatro", "festival", "dizi", "konser", "yazar"],
};

const BIAS_PATTERNS = [
  /\b(korkunç|rezalet|skandal|şok|bomba|sansasyonel)\b/gi,
  /\b(muhalefet|iktidar|chp|akp|mhp|deva|gelecek partisi)\b/gi,
  /!{2,}/g,
  /\?{2,}/g,
];

const CLICKBAIT_PREFIXES = [
  "İşte ", "Son dakika: ", "Şok! ", "Bomba! ", "Flaş! ", "O anlar! ",
];

function detectCategory(text: string, categories: AIProcessInput["categories"]): string {
  const lower = text.toLowerCase();
  let bestSlug = categories[0]?.slug || "gundem";
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw.trim())).length;
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  const exists = categories.some((c) => c.slug === bestSlug);
  return exists ? bestSlug : categories[0]?.slug || "gundem";
}

function neutralizeTitle(title: string): string {
  let result = title;
  for (const prefix of CLICKBAIT_PREFIXES) {
    if (result.toLowerCase().startsWith(prefix.toLowerCase())) {
      result = result.slice(prefix.length);
    }
  }
  for (const pattern of BIAS_PATTERNS) {
    result = result.replace(pattern, " ");
  }
  result = result.replace(/\s+/g, " ").trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result.replace(/!+$/, "").trim();
}

function neutralizeContent(html: string): string {
  let text = stripHtml(html);
  for (const pattern of BIAS_PATTERNS) {
    text = text.replace(pattern, " ");
  }
  text = text.replace(/\s+/g, " ").trim();

  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  const neutralSentences = sentences.map((s) => {
    if (!s.match(/(belirtildi|açıklandı|duyuruldu|ifade edildi)/i)) {
      return s.replace(/\.$/, "") + " olarak belirtildi.";
    }
    return s;
  });

  return toHtmlParagraphs(neutralSentences.slice(0, 6).join("\n\n"));
}

function extractTags(text: string, categorySlug: string): string[] {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const tags = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);

  if (!tags.includes(categorySlug.replace("-", " "))) {
    tags.unshift(categorySlug.replace("-", " "));
  }
  return tags.slice(0, 5);
}

export async function processWithLocalEngine(input: AIProcessInput): Promise<AIProcessedResult> {
  const combined = `${input.title} ${stripHtml(input.content)}`;
  const categorySlug = detectCategory(combined, input.categories);
  const title = neutralizeTitle(input.title);
  const content = neutralizeContent(input.content);
  const excerpt = truncate(stripHtml(content), 160);
  const tags = extractTags(combined, categorySlug);

  const breakingKeywords = ["son dakika", "deprem", "patlama", "acil", "flaş", "kritik"];
  const breaking = breakingKeywords.some((kw) => input.title.toLowerCase().includes(kw));

  return {
    title,
    excerpt,
    content,
    categorySlug,
    tags,
    metaTitle: title.slice(0, 60),
    metaDescription: excerpt.slice(0, 155),
    breaking,
    analysis: {
      topic: categorySlug,
      neutralityScore: 0.85,
      confidence: 0.7,
    },
  };
}
