import OpenAI from "openai";
import { buildSystemPrompt, buildUserPrompt, buildExpansionPrompt } from "./prompts";
import type { AIProcessInput, AIProcessedResult } from "./types";
import {
  countWords,
  enrichArticleHtml,
  ensureMinimumExcerpt,
  hasRequiredSections,
} from "./content-formatter";

let client: OpenAI | null = null;

const MIN_CONTENT_WORDS = 800;
const MIN_EXCERPT_WORDS = 150;

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

async function expandContentIfNeeded(
  openai: OpenAI,
  title: string,
  content: string
): Promise<string> {
  if (countWords(content) >= MIN_CONTENT_WORDS && hasRequiredSections(content)) {
    return content;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 8000,
    messages: [
      {
        role: "system",
        content:
          "Sen haber editörüsün. Verilen haber metnini 800-1500 kelimeye genişlet. Zorunlu H2 bölümleri: Giriş, Gelişmeler, Detaylar, Etkileri, Son Durum. Sadece HTML döndür.",
      },
      { role: "user", content: buildExpansionPrompt(title, content) },
    ],
  });

  const expanded = response.choices[0]?.message?.content?.trim();
  if (!expanded) return content;
  return enrichArticleHtml(expanded);
}

export async function processWithOpenAI(input: AIProcessInput): Promise<AIProcessedResult> {
  const openai = getClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY tanımlı değil");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(input.categories) },
      {
        role: "user",
        content: buildUserPrompt({
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          sourceName: input.sourceName,
        }),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("AI yanıt vermedi");

  const parsed = JSON.parse(raw) as AIProcessedResult;

  if (!parsed.title || !parsed.content || !parsed.categorySlug) {
    throw new Error("AI yanıtı eksik alanlar içeriyor");
  }

  let content = enrichArticleHtml(parsed.content);
  content = await expandContentIfNeeded(openai, parsed.title, content);

  let excerpt = (parsed.excerpt || "").trim();
  excerpt = ensureMinimumExcerpt(excerpt, content);

  if (countWords(excerpt) < MIN_EXCERPT_WORDS) {
    excerpt = ensureMinimumExcerpt("", content);
  }

  return {
    title: parsed.title.trim(),
    excerpt,
    content,
    categorySlug: parsed.categorySlug,
    tags: (parsed.tags || []).slice(0, 6).map((t) => t.trim()).filter(Boolean),
    metaTitle: (parsed.metaTitle || parsed.title).trim().slice(0, 70),
    metaDescription: (parsed.metaDescription || excerpt).trim().slice(0, 160),
    breaking: !!parsed.breaking,
    analysis: parsed.analysis || { topic: "Genel", neutralityScore: 0.9, confidence: 0.8 },
  };
}
