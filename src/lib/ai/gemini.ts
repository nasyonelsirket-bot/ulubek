import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt, buildUserPrompt, buildExpansionPrompt } from "./prompts";
import type { AIProcessInput, AIProcessedResult } from "./types";
import {
  countWords,
  enrichArticleHtml,
  ensureMinimumExcerpt,
  hasRequiredSections,
} from "./content-formatter";
import { getGeminiKey, getSettings } from "@/lib/settings/store";

export function isGeminiAvailable(): boolean {
  return !!getGeminiKey();
}

function getClient(): GoogleGenerativeAI | null {
  const key = getGeminiKey();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

async function expandContentIfNeeded(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  title: string,
  content: string,
  minWords: number
): Promise<string> {
  if (countWords(content) >= minWords && hasRequiredSections(content)) return content;

  const result = await model.generateContent(buildExpansionPrompt(title, content));
  const expanded = result.response.text()?.trim();
  if (!expanded) return content;
  return enrichArticleHtml(expanded);
}

export async function processWithGemini(input: AIProcessInput): Promise<AIProcessedResult> {
  const client = getClient();
  if (!client) throw new Error("Gemini API anahtarı tanımlı değil");

  const settings = getSettings();
  const model = client.getGenerativeModel({
    model: settings.geminiModel,
    generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
  });

  const prompt = `${buildSystemPrompt(input.categories)}\n\n${buildUserPrompt({
    title: input.title,
    content: input.content,
    excerpt: input.excerpt,
    sourceName: input.sourceName,
  })}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  if (!raw) throw new Error("Gemini yanıt vermedi");

  const parsed = JSON.parse(raw) as AIProcessedResult;
  if (!parsed.title || !parsed.content || !parsed.categorySlug) {
    throw new Error("Gemini yanıtı eksik alanlar içeriyor");
  }

  let content = enrichArticleHtml(parsed.content);
  content = await expandContentIfNeeded(model, parsed.title, content, settings.minWordCount);

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
    analysis: parsed.analysis || { topic: "Genel", neutralityScore: 0.9, confidence: 0.85 },
  };
}
