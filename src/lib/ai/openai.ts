import OpenAI from "openai";
import { buildSystemPrompt, buildUserPrompt, buildExpansionPrompt } from "./prompts";
import type { AIProcessInput, AIProcessedResult } from "./types";
import {
  countWords,
  enrichArticleHtml,
  ensureMinimumExcerpt,
  hasRequiredSections,
} from "./content-formatter";
import { getOpenAIKey, getSettings } from "@/lib/settings/store";

let client: OpenAI | null = null;
let cachedKey = "";

function getClient(): OpenAI | null {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;
  if (!client || cachedKey !== apiKey) {
    client = new OpenAI({ apiKey });
    cachedKey = apiKey;
  }
  return client;
}

export function isOpenAIAvailable(): boolean {
  return !!getOpenAIKey();
}

async function expandContentIfNeeded(
  openai: OpenAI,
  title: string,
  content: string,
  minWords: number
): Promise<string> {
  if (countWords(content) >= minWords && hasRequiredSections(content)) {
    return content;
  }

  const settings = getSettings();
  const response = await openai.chat.completions.create({
    model: settings.openaiModel,
    temperature: 0.4,
    max_tokens: 12000,
    messages: [
      {
        role: "system",
        content:
          "Sen haber editörüsün. Metni minimum 1200 kelimeye genişlet. H2: Özet, Gelişmeler, Detaylar, Uzman Değerlendirmeleri, Olası Etkiler, Son Durum. Sadece HTML döndür.",
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
  if (!openai) throw new Error("OpenAI API anahtarı tanımlı değil");

  const settings = getSettings();

  const response = await openai.chat.completions.create({
    model: settings.openaiModel,
    temperature: 0.4,
    max_tokens: 12000,
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
  content = await expandContentIfNeeded(openai, parsed.title, content, settings.minWordCount);

  let excerpt = (parsed.excerpt || "").trim();
  excerpt = ensureMinimumExcerpt(excerpt, content);

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
