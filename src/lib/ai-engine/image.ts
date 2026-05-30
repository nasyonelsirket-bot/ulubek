import OpenAI from "openai";
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
    const fallback = categoryFallbackImage(category);
    return { url: fallback, prompt };
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

  return { url: categoryFallbackImage(category), prompt };
}

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function categoryFallbackImage(category: string): string {
  const map: Record<string, string> = {
    gundem: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=675&fit=crop",
    ekonomi: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=675&fit=crop",
    spor: "https://images.unsplash.com/photo-1574629810360-7efbc5751737?w=1200&h=675&fit=crop",
    teknoloji: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop",
    saglik: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop",
    dunya: "https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=1200&h=675&fit=crop",
  };
  return map[category] ?? map.gundem;
}

export type { AIProcessedResult };
