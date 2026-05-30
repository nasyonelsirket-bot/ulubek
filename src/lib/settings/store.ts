import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { AppSettings, PublicSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const SETTINGS_FILE = path.join(RUNTIME_DIR, "settings.json");
const CUSTOM_LOGO = path.join(RUNTIME_DIR, "cover-logo.png");

function ensureDir() {
  if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return "";
  return `****${key.slice(-4)}`;
}

function mergeWithEnv(settings: AppSettings): AppSettings {
  return {
    ...settings,
    openaiApiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY || "",
    geminiApiKey: settings.geminiApiKey || process.env.GEMINI_API_KEY || "",
    openaiModel: settings.openaiModel || process.env.OPENAI_MODEL || DEFAULT_SETTINGS.openaiModel,
    geminiModel: settings.geminiModel || process.env.GEMINI_MODEL || DEFAULT_SETTINGS.geminiModel,
  };
}

export function getSettings(): AppSettings {
  try {
    if (!existsSync(SETTINGS_FILE)) return mergeWithEnv({ ...DEFAULT_SETTINGS });
    const stored = JSON.parse(readFileSync(SETTINGS_FILE, "utf-8")) as Partial<AppSettings>;
    return mergeWithEnv({ ...DEFAULT_SETTINGS, ...stored });
  } catch {
    return mergeWithEnv({ ...DEFAULT_SETTINGS });
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  ensureDir();
  const current = getSettings();
  const next: AppSettings = { ...current, ...partial };

  if (partial.openaiApiKey === "") next.openaiApiKey = current.openaiApiKey;
  if (partial.geminiApiKey === "") next.geminiApiKey = current.geminiApiKey;

  writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(
      {
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
      },
      null,
      2
    ),
    "utf-8"
  );

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
    coverLogoUploaded: existsSync(CUSTOM_LOGO),
  };
}

export function getOpenAIKey(): string {
  return getSettings().openaiApiKey;
}

export function getGeminiKey(): string {
  return getSettings().geminiApiKey;
}

export function hasCustomCoverLogo(): boolean {
  return existsSync(CUSTOM_LOGO);
}
