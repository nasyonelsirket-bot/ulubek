import OpenAI from "openai";
import { generatePlaceholderCover } from "./placeholder-image";
import type { AIProcessedResult } from "@/lib/ai/types";

export interface ImageGenerationResult {
  url: string;
  prompt: string;
}

export async function generateImagePrompt(title: string, category: string): Promise<string> {
  const openai = getClient();
  if (!openai) {
    return `Professional news photograph about ${title}, ${category} category, editorial style, high quality`;
  }

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: "Sen haber görseli prompt uzmanısın. DALL-E için İngilizce, fotoğrafik, sansürsüz, editorial tarzda kısa prompt üret.",
      },
      {
        role: "user",
        content: `Haber: "${title}"\nKategori: ${category}\nJSON: {"prompt":"..."}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { prompt: string };
      if (parsed.prompt) return parsed.prompt;
    } catch { /* fallback */ }
  }

  return `Professional news photo: ${title}, editorial journalism style`;
}

export async function generateNewsImage(title: string, category: string): Promise<ImageGenerationResult> {
  const prompt = await generateImagePrompt(title, category);
  const openai = getClient();

  if (!openai) {
    return { url: generatePlaceholderCover(title, category), prompt };
  }

  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. Photorealistic news editorial photo, no text overlay.`,
      size: "1792x1024",
      quality: "standard",
      n: 1,
    });

    const url = result.data?.[0]?.url;
    if (url) return { url, prompt };
  } catch {
    /* fallback */
  }

  return { url: generatePlaceholderCover(title, category), prompt };
}

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export type { AIProcessedResult };
