import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePlaceholderCover } from "./placeholder-image";
import { getOpenAIKey, getGeminiKey, getSettings } from "@/lib/settings/store";

export interface ImageGenerationResult {
  url: string;
  prompt: string;
  provider: string;
}

const IMAGE_SIZE = "1792x1024";

export async function generateImagePrompt(title: string, category: string): Promise<string> {
  const settings = getSettings();
  const openaiKey = getOpenAIKey();

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const res = await openai.chat.completions.create({
        model: settings.openaiModel,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content:
              "Sen haber kapak görseli prompt uzmanısın. 1200x675 haber kapağı için İngilizce, fotoğrafik, editorial tarzda prompt üret.",
          },
          { role: "user", content: `Haber: "${title}"\nKategori: ${category}\nJSON: {"prompt":"..."}` },
        ],
        response_format: { type: "json_object" },
      });
      const raw = res.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as { prompt: string };
        if (parsed.prompt) return parsed.prompt;
      }
    } catch { /* fallback */ }
  }

  const geminiKey = getGeminiKey();
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: settings.geminiModel });
      const res = await model.generateContent(
        `Haber kapağı için İngilizce DALL-E prompt üret (1200x675 editorial photo): "${title}" / ${category}. Sadece prompt metni döndür.`
      );
      const text = res.response.text()?.trim();
      if (text) return text.slice(0, 500);
    } catch { /* fallback */ }
  }

  return `Professional Turkish news cover photo about ${title}, ${category}, photorealistic editorial journalism, 1200x675 aspect ratio`;
}

async function generateWithOpenAI(prompt: string): Promise<string | null> {
  const key = getOpenAIKey();
  if (!key) return null;
  const openai = new OpenAI({ apiKey: key });
  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${prompt}. Photorealistic news editorial cover photo 1200x675, no text overlay, no watermark.`,
    size: IMAGE_SIZE,
    quality: "standard",
    n: 1,
  });
  return result.data?.[0]?.url ?? null;
}

async function generateWithGemini(prompt: string): Promise<string | null> {
  const key = getGeminiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Generate a photorealistic news cover image: ${prompt}` }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] } as never,
    });
    for (const part of result.response.candidates?.[0]?.content?.parts ?? []) {
      if ("inlineData" in part && part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  } catch { /* imagen not available on all keys */ }
  return null;
}

export async function generateNewsImage(title: string, category: string): Promise<ImageGenerationResult> {
  const settings = getSettings();
  const prompt = await generateImagePrompt(title, category);

  if (settings.imageProvider === "gemini") {
    const url = await generateWithGemini(prompt);
    if (url) return { url, prompt, provider: "gemini" };
    const fallback = await generateWithOpenAI(prompt);
    if (fallback) return { url: fallback, prompt, provider: "openai-fallback" };
  } else {
    const url = await generateWithOpenAI(prompt);
    if (url) return { url, prompt, provider: "openai" };
    const fallback = await generateWithGemini(prompt);
    if (fallback) return { url: fallback, prompt, provider: "gemini-fallback" };
  }

  return { url: generatePlaceholderCover(title, category), prompt, provider: "placeholder" };
}
