import type { AIProcessInput, AIProcessedResult } from "./types";
import { stripHtml } from "@/lib/utils/content";
import { enrichArticleHtml, buildExcerptFromContent } from "./content-formatter";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gundem: ["hükümet", "meclis", "bakan", "cumhurbaşkan", " seçim", "politika", "tbmm", "anayasa", "belediye", "vali"],
  ekonomi: ["ekonomi", "borsa", "dolar", "euro", "enflasyon", "faiz", "tcmb", "bütçe", "vergi", "piyasa", "kobi", "ihracat"],
  spor: ["futbol", "basketbol", "spor", "takım", "maç", "gol", "lig", "şampiyon", "milli takım", "transfer"],
  teknoloji: ["teknoloji", "yapay zeka", "ai", "yazılım", "apple", "google", "microsoft", "siber", "dijital", "mobil"],
  saglik: ["sağlık", "hastane", "doktor", "hastalık", "aşı", "tıp", "bakanlık sağlık", "tedavi", "virüs"],
  dunya: ["abd", "avrupa", "rusya", "çin", "bm", "nato", "ukrayna", "israil", "filistin", "uluslararası", "dünya"],
  magazin: ["magazin", "ünlü", "dizi", "evlilik", "boşanma", "sosyal medya", "instagram", "sanatçı", "oyuncu"],
  "kultur-sanat": ["sinema", "film", "müzik", "kitap", "sanat", "tiyatro", "festival", "dizi", "konser", "yazar"],
};

const BIAS_PATTERNS = [
  /\b(korkunç|rezalet|skandal|şok|bomba|sansasyonel)\b/gi,
  /!{2,}/g,
  /\?{2,}/g,
];

const CLICKBAIT_PREFIXES = ["İşte ", "Son dakika: ", "Şok! ", "Bomba! ", "Flaş! ", "O anlar! "];

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

  return categories.some((c) => c.slug === bestSlug) ? bestSlug : categories[0]?.slug || "gundem";
}

function rephraseTitle(title: string, sourceName?: string): string {
  const base = neutralizeTitle(title);
  const suffixes = [
    " — güncel gelişmeler",
    " — son durum",
    " — detaylar",
    " — yeni bilgiler",
  ];
  const prefix = sourceName ? `${sourceName.replace(/\.com.*/i, "").trim()} haberine göre: ` : "";
  const suffix = suffixes[Math.abs(base.length) % suffixes.length];
  const candidate = `${prefix}${base}${suffix}`.replace(/\s+/g, " ").trim();
  return candidate.length <= 120 ? candidate : base;
}

export function makeDistinctTitle(title: string, sourceName?: string, attempt = 0): string {
  const variants = [
    rephraseTitle(title, sourceName),
    `${neutralizeTitle(title)} — ${new Date().toLocaleDateString("tr-TR")} güncellemesi`,
    `${neutralizeTitle(title)} | yeni açıklamalar`,
    `${neutralizeTitle(title)} — farklı perspektif`,
  ];
  return variants[attempt % variants.length] ?? title;
}

function rewriteIntro(title: string, rawContent: string, sourceName?: string): string {
  const topic = neutralizeTitle(title);
  const source = sourceName ? `${sourceName} kaynaklı bilgilere göre, ` : "";
  const snippet = stripHtml(rawContent).slice(0, 500);
  return `${source}${snippet || topic}`;
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

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function buildSectionHtml(title: string, paragraphs: string[]): string {
  if (paragraphs.length === 0) return "";
  const body = paragraphs.map((p) => `<p>${p}</p>`).join("");
  return `<h2>${title}</h2>${body}`;
}

/** Kaynak metinden kısa, tekrarsız haber gövdesi — şablon doldurma yok. */
function buildArticleFromSource(title: string, rawContent: string): string {
  const topic = neutralizeTitle(title);
  const base = stripHtml(rawContent) || topic;
  const sentences = splitSentences(base);

  const uniqueSentences = [...new Set(sentences)];

  const intro = uniqueSentences.slice(0, 2);
  const body = uniqueSentences.slice(2, 8);
  const closing = uniqueSentences.length > 2 ? [uniqueSentences[uniqueSentences.length - 1]] : [];

  const sections = [
    buildSectionHtml("Özet", intro.length > 0 ? intro : [base.slice(0, 400)]),
    buildSectionHtml("Detaylar", body),
    buildSectionHtml("Son Durum", closing),
  ].filter(Boolean);

  return enrichArticleHtml(sections.join(""));
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

export async function processWithLocalEngine(
  input: AIProcessInput,
  compact = false
): Promise<AIProcessedResult> {
  const combined = `${input.title} ${stripHtml(input.content)}`;
  const categorySlug = detectCategory(combined, input.categories);
  const title = input.rewrite ? rephraseTitle(input.title, input.sourceName) : neutralizeTitle(input.title);
  const raw = stripHtml(input.content) || input.title;

  const sourceText = input.rewrite ? rewriteIntro(title, raw, input.sourceName) : raw;

  const content = compact
    ? enrichArticleHtml(
        `<p>${sourceText.slice(0, 900)}</p>`
      )
    : buildArticleFromSource(title, sourceText);

  const excerpt = buildExcerptFromContent(content, 80, 200);
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
    metaDescription: excerpt.slice(0, 160),
    breaking,
    analysis: {
      topic: categorySlug,
      neutralityScore: 0.85,
      confidence: 0.7,
    },
  };
}
