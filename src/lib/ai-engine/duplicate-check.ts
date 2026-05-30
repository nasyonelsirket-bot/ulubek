export type SkipReason = "duplicate_url" | "duplicate_title" | "duplicate_content" | "spam" | "low_trust" | "empty";

export interface ContentCheckInput {
  url: string;
  title: string;
  content: string;
  trustScore: number;
  seenUrls: Set<string>;
  existingTitles: string[];
  existingContentHashes: Set<string>;
}

export interface ContentCheckResult {
  allowed: boolean;
  reason?: SkipReason;
  message?: string;
}

const SPAM_PATTERNS: RegExp[] = [
  /\b(viagra|cialis|casino|kumar|bahis|bet\b|forex)\b/i,
  /\b(tıkla|click here|bedava para|kazan[aç]|promosyon kodu)\b/i,
  /\b(telegram\.me|t\.me\/\+|whatsapp\.com\/chat)\b/i,
  /(http[s]?:\/\/){3,}/i,
  /(.)\1{8,}/,
];

const TITLE_SIMILARITY_THRESHOLD = 0.82;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sğüşıöç]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(normalizeText(text).split(" ").filter((w) => w.length > 2));
}

export function titleSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function contentHash(content: string): string {
  const normalized = normalizeText(content).slice(0, 600);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

function detectSpam(title: string, content: string): string | null {
  const combined = `${title} ${content}`;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(combined)) {
      return "Spam veya reklam içeriği tespit edildi";
    }
  }
  if (title.length < 8) return "Başlık çok kısa";
  if (content.length < 80) return "İçerik çok kısa";
  return null;
}

export function checkContentBeforePublish(input: ContentCheckInput): ContentCheckResult {
  const { url, title, content, trustScore, seenUrls, existingTitles, existingContentHashes } =
    input;

  if (!title.trim()) {
    return { allowed: false, reason: "empty", message: "Başlık boş" };
  }

  if (trustScore < 0.3) {
    return { allowed: false, reason: "low_trust", message: "Güven puanı çok düşük" };
  }

  if (url && seenUrls.has(url)) {
    return { allowed: false, reason: "duplicate_url", message: "Bu URL daha önce işlendi" };
  }

  const spamReason = detectSpam(title, content);
  if (spamReason) {
    return { allowed: false, reason: "spam", message: spamReason };
  }

  for (const existing of existingTitles) {
    if (titleSimilarity(title, existing) >= TITLE_SIMILARITY_THRESHOLD) {
      return {
        allowed: false,
        reason: "duplicate_title",
        message: "Benzer başlıklı haber zaten mevcut",
      };
    }
  }

  const hash = contentHash(content);
  if (existingContentHashes.has(hash)) {
    return {
      allowed: false,
      reason: "duplicate_content",
      message: "Aynı içerik daha önce yayınlandı",
    };
  }

  return { allowed: true };
}

export function buildExistingArticleIndex(
  articles: { title: string; content: string }[]
) {
  return {
    titles: articles.map((a) => a.title),
    contentHashes: new Set(articles.map((a) => contentHash(a.content))),
  };
}
