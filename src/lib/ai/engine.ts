import type { AIProcessInput, AIProcessedResult } from "./types";
import { processWithOpenAI, isOpenAIAvailable } from "./openai";
import { processWithGemini, isGeminiAvailable } from "./gemini";
import { processWithLocalEngine } from "./local-engine";
import { getSettings } from "@/lib/settings/store";

export async function processArticleWithAI(input: AIProcessInput): Promise<AIProcessedResult> {
  const { aiProvider } = getSettings();

  if (aiProvider === "gemini" && isGeminiAvailable()) {
    try {
      return await processWithGemini(input);
    } catch {
      if (isOpenAIAvailable()) return processWithOpenAI(input);
      return processWithLocalEngine(input);
    }
  }

  if (isOpenAIAvailable()) {
    return processWithOpenAI(input);
  }

  if (isGeminiAvailable()) {
    try {
      return await processWithGemini(input);
    } catch {
      return processWithLocalEngine(input);
    }
  }

  return processWithLocalEngine(input);
}

export function getActiveAIProvider(): string {
  const s = getSettings();
  if (s.aiProvider === "gemini" && isGeminiAvailable()) return "gemini";
  if (isOpenAIAvailable()) return "openai";
  if (isGeminiAvailable()) return "gemini";
  return "local";
}
