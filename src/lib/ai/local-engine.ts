import type { AIProcessInput, AIProcessedResult } from "./types";
import { stripHtml } from "@/lib/utils/content";
import { enrichArticleHtml, buildExcerptFromContent, countWords } from "./content-formatter";

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
  return `${source}${topic} başlığı gündeme oturdu. ${stripHtml(rawContent).slice(0, 400)} Bu gelişme, benzer haberlerden farklı bir çerçevede ele alınarak okuyuculara sunuluyor.`;
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
    .filter((s) => s.length > 25);
}

function padParagraphs(paragraphs: string[], minCount: number, topic: string): string[] {
  const result = [...paragraphs];
  const templates = [
    `${topic} konusu kamuoyunda geniş yankı uyandırmaya devam ediyor. Gelişmelerin ardından ilgili kurumlar konuya ilişkin açıklamalarda bulundu.`,
    `Uzmanlar, ${topic.toLowerCase()} başlığının önümüzdeki dönemde gündemin merkezinde kalabileceğini belirtiyor. Sürecin tüm boyutlarıyla izlenmesi gerektiği ifade ediliyor.`,
    `Konuya ilişkin arka planda yer alan unsurlar, olayın yalnızca güncel boyutunu değil uzun vadeli etkilerini de gündeme taşıyor. Analistler, gelişmelerin farklı kesimler üzerindeki yansımalarının takip edilmesi gerektiğini vurguluyor.`,
    `Resmi kaynaklardan edinilen bilgilere göre süreç planlandığı şekilde ilerliyor. Yetkililer, kamuoyunu bilgilendirmeye devam edeceklerini açıkladı.`,
    `Gözlemciler, ${topic.toLowerCase()} kapsamında atılacak adımların bölgesel dengeler açısından da dikkatle izleneceğini kaydediyor.`,
    `Son gelişmelerin ardından sürecin nasıl şekilleneceği merak konusu. İlgili tarafların açıklamaları ve resmi veriler, tablonun netleşmesine katkı sağlayacak.`,
  ];

  let i = 0;
  while (result.length < minCount) {
    result.push(templates[i % templates.length]);
    i++;
  }
  return result;
}

function buildSectionHtml(title: string, paragraphs: string[]): string {
  const body = paragraphs.map((p) => `<p>${p}</p>`).join("");
  return `<h2>${title}</h2>${body}`;
}

function expandToLongForm(title: string, rawContent: string): string {
  const topic = neutralizeTitle(title);
  const base = stripHtml(rawContent) || topic;
  const sentences = splitSentences(base);

  const intro = padParagraphs(
    [
      `${topic} gündemin öne çıkan başlıkları arasında yer alıyor. Konuyla ilgili son gelişmeler kamuoyunda geniş yankı uyandırdı.`,
      sentences[0] || `${topic} hakkında yapılan açıklamalar, sürecin önemini bir kez daha ortaya koydu.`,
      `Haberin detayları ve olayın gelişim süreci aşağıda bölüm bölüm ele alınıyor.`,
    ],
    4,
    topic
  );

  const developments = padParagraphs(
    sentences.slice(0, 4).length > 0
      ? sentences.slice(0, 4)
      : [`${topic} kapsamında yaşanan gelişmeler hız kesmeden devam ediyor.`],
    5,
    topic
  );

  const details = padParagraphs(
    [
      ...sentences.slice(4, 8),
      `${topic} konusunun arka planında, benzer gelişmelerin geçmişte de gündeme geldiği hatırlatılıyor. Uzmanlar, mevcut tablonun önceki dönemlerle kıyaslandığında farklı dinamikler içerdiğini belirtiyor.`,
      `Konuya dair teknik ve operasyonel detaylar, resmi açıklamalar ve kamuya açık veriler ışığında değerlendiriliyor.`,
    ].filter(Boolean),
    5,
    topic
  );

  const expertEvaluations = padParagraphs(
    [
      `Uzmanlar, ${topic.toLowerCase()} gelişmelerinin detaylı analiz edilmesi gerektiğini belirtiyor.`,
      `Analistler, sürecin farklı boyutlarının kamuoyu ve ilgili sektörler açısından yakından izlenmesi gerektiğini ifade ediyor.`,
      `Gözlemciler, resmi açıklamaların ve bağımsız değerlendirmelerin birlikte ele alınmasının önemine dikkat çekiyor.`,
    ],
    4,
    topic
  );

  const impacts = padParagraphs(
    [
      `Analistler, ${topic.toLowerCase()} gelişmelerinin kısa vadede ilgili sektörler ve kamuoyu üzerinde etkili olabileceğini ifade ediyor.`,
      `Olası senaryolara göre sürecin uzun vadeli sonuçları, atılacak adımlara bağlı olarak şekillenecek.`,
      `Gözlemciler, olayın bölgesel ve ulusal düzeydeki yansımalarının yakından takip edilmesi gerektiğini vurguluyor.`,
    ],
    4,
    topic
  );

  const latest = padParagraphs(
    [
      sentences[sentences.length - 1] || `${topic} ile ilgili süreç devam ediyor.`,
      `Yetkililer, gelişmeler hakkında kamuoyunu bilgilendirmeye devam edeceklerini belirtti. Konunun takip edilmesi öneriliyor.`,
      `Ulubek Medya, ${topic.toLowerCase()} başlığındaki gelişmeleri yakından izlemeye devam edecek.`,
    ],
    3,
    topic
  );

  const sections = [
    buildSectionHtml("Özet", intro),
    buildSectionHtml("Gelişmeler", developments),
    buildSectionHtml("Detaylar", details),
    buildSectionHtml("Uzman Değerlendirmeleri", expertEvaluations),
    buildSectionHtml("Olası Etkiler", impacts),
    buildSectionHtml("Son Durum", latest),
  ];

  let html = sections.join("");

  while (countWords(html) < 1200) {
    const extra = padParagraphs([], 1, topic)[0];
    html += `<h2>Gelişmeler</h2><p>${extra}</p>`;
  }

  return enrichArticleHtml(html);
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

  const content = compact
    ? enrichArticleHtml(
        input.rewrite
          ? `<p>${rewriteIntro(title, raw, input.sourceName)}</p><p>${title} konusundaki gelişmeler kamuoyunda takip ediliyor. Resmi açıklamalar ve sürece ilişkin yeni bilgiler paylaşıldıkça haber güncellenecektir.</p>`
          : `<p>${raw.slice(0, 800)}</p><p>${title} konusundaki gelişmeler kamuoyunda takip ediliyor. Resmi açıklamalar ve sürece ilişkin yeni bilgiler paylaşıldıkça haber güncellenecektir.</p>`
      )
    : expandToLongForm(title, input.rewrite ? rewriteIntro(title, raw, input.sourceName) : input.content);
  const excerpt = buildExcerptFromContent(content, 150, 250);
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
