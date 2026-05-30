import OpenAI from "openai";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import type { AIProcessInput, AIProcessedResult } from "./types";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function processWithOpenAI(input: AIProcessInput): Promise<AIProcessedResult> {
  const openai = getClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY tanımlı değil");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.3,
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

  return {
    title: parsed.title.trim(),
    excerpt: (parsed.excerpt || "").trim(),
    content: sanitizeHtmlContent(parsed.content),
    categorySlug: parsed.categorySlug,
    tags: (parsed.tags || []).slice(0, 5).map((t) => t.trim()).filter(Boolean),
    metaTitle: (parsed.metaTitle || parsed.title).trim().slice(0, 70),
    metaDescription: (parsed.metaDescription || parsed.excerpt || "").trim().slice(0, 160),
    breaking: !!parsed.breaking,
    analysis: parsed.analysis || { topic: "Genel", neutralityScore: 0.9, confidence: 0.8 },
  };
}

function sanitizeHtmlContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/<(?!p|\/p|strong|\/strong|em|\/em)[^>]+>/gi, "")
    .trim();
}
