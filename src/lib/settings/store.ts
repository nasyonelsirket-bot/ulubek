import { writeFileSync } from "node:fs";
import {
  ensureRuntimeDir,
  readRuntimeJson,
  runtimeFile,
  runtimeFileExists,
  writeRuntimeJson,
} from "@/lib/runtime/paths";
import type { AppSettings, PublicSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const CUSTOM_LOGO_NAME = "cover-logo.png";

function maskKey(key: string): string {
  if (!key || key.length < 8) return "";
  return `****${key.slice(-4)}`;
}

function mergeWithEnv(settings: AppSettings): AppSettings {
  return {
    ...settings,
    openaiApiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY || "",
    geminiApiKey: settings.geminiApiKey || process.env.GEMINI_API_KEY || "",
    newsApiKey: settings.newsApiKey || process.env.NEWS_API_KEY || "",
    openaiModel: settings.openaiModel || process.env.OPENAI_MODEL || DEFAULT_SETTINGS.openaiModel,
    geminiModel: settings.geminiModel || process.env.GEMINI_MODEL || DEFAULT_SETTINGS.geminiModel,
  };
}

export function getSettings(): AppSettings {
  try {
    const stored = readRuntimeJson<Partial<AppSettings>>("settings.json", {});
    if (Object.keys(stored).length === 0 && !runtimeFileExists("settings.json")) {
      return mergeWithEnv({ ...DEFAULT_SETTINGS });
    }
    return mergeWithEnv({ ...DEFAULT_SETTINGS, ...stored });
  } catch {
    return mergeWithEnv({ ...DEFAULT_SETTINGS });
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const next: AppSettings = { ...current, ...partial };

  if (partial.openaiApiKey === "") next.openaiApiKey = current.openaiApiKey;
  if (partial.geminiApiKey === "") next.geminiApiKey = current.geminiApiKey;
  if (partial.twitterApiKey === "") next.twitterApiKey = current.twitterApiKey;
  if (partial.twitterApiSecret === "") next.twitterApiSecret = current.twitterApiSecret;
  if (partial.twitterBearerToken === "") next.twitterBearerToken = current.twitterBearerToken;
  if (partial.instagramAccessToken === "") next.instagramAccessToken = current.instagramAccessToken;
  if (partial.newsApiKey === "") next.newsApiKey = current.newsApiKey;

  const payload = {
    aiProvider: next.aiProvider,
    imageProvider: next.imageProvider,
    openaiApiKey: next.openaiApiKey,
    geminiApiKey: next.geminiApiKey,
    openaiModel: next.openaiModel,
    geminiModel: next.geminiModel,
    scanIntervalMin: next.scanIntervalMin,
    scanLookbackDays: next.scanLookbackDays,
    minWordCount: next.minWordCount,
    targetWordCount: next.targetWordCount,
    useSourceImage: next.useSourceImage,
    useStockImage: next.useStockImage,
    useAiImage: next.useAiImage,
    coverBrandingEnabled: next.coverBrandingEnabled,
    coverWatermarkEnabled: next.coverWatermarkEnabled,
    coverLogoPosition: next.coverLogoPosition,
    coverTitleStyle: next.coverTitleStyle,
    coverBreakingTagEnabled: next.coverBreakingTagEnabled,
    coverLogoCustom: next.coverLogoCustom,
    twitterApiKey: next.twitterApiKey,
    twitterApiSecret: next.twitterApiSecret,
    twitterBearerToken: next.twitterBearerToken,
    twitterAccounts: next.twitterAccounts,
    instagramAccessToken: next.instagramAccessToken,
    instagramAccountId: next.instagramAccountId,
    newsApiKey: next.newsApiKey,
    newsApiEnabled: next.newsApiEnabled,
  };

  if (!writeRuntimeJson("settings.json", payload)) {
    try {
      ensureRuntimeDir();
      writeFileSync(runtimeFile("settings.json"), JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("[settings] save failed:", err);
    }
  }

  return next;
}

export function getPublicSettings(): PublicSettings {
  const s = getSettings();
  return {
    aiProvider: s.aiProvider,
    imageProvider: s.imageProvider,
    openaiModel: s.openaiModel,
    geminiModel: s.geminiModel,
    scanIntervalMin: s.scanIntervalMin,
    scanLookbackDays: s.scanLookbackDays,
    minWordCount: s.minWordCount,
    targetWordCount: s.targetWordCount,
    openaiKeyConfigured: !!s.openaiApiKey,
    geminiKeyConfigured: !!s.geminiApiKey,
    openaiKeyPreview: maskKey(s.openaiApiKey),
    geminiKeyPreview: maskKey(s.geminiApiKey),
    useSourceImage: s.useSourceImage,
    useStockImage: s.useStockImage,
    useAiImage: s.useAiImage,
    coverBrandingEnabled: s.coverBrandingEnabled,
    coverWatermarkEnabled: s.coverWatermarkEnabled,
    coverLogoPosition: s.coverLogoPosition,
    coverTitleStyle: s.coverTitleStyle,
    coverBreakingTagEnabled: s.coverBreakingTagEnabled,
    coverLogoCustom: s.coverLogoCustom,
    coverLogoUploaded: runtimeFileExists(CUSTOM_LOGO_NAME),
    twitterKeyConfigured: !!s.twitterApiKey,
    twitterBearerConfigured: !!s.twitterBearerToken,
    instagramConfigured: !!s.instagramAccessToken,
    twitterAccounts: s.twitterAccounts,
    instagramAccountId: s.instagramAccountId,
    newsApiKeyConfigured: !!s.newsApiKey,
    newsApiKeyPreview: maskKey(s.newsApiKey),
    newsApiEnabled: s.newsApiEnabled,
  };
}

export function getOpenAIKey(): string {
  return getSettings().openaiApiKey;
}

export function getGeminiKey(): string {
  return getSettings().geminiApiKey;
}

export function hasCustomCoverLogo(): boolean {
  return runtimeFileExists(CUSTOM_LOGO_NAME);
}
