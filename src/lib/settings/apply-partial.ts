import type { AppSettings } from "./types";

export function buildSettingsPartial(body: Record<string, unknown>): Partial<AppSettings> {
  const partial: Partial<AppSettings> = {};

  if (body.aiProvider === "openai" || body.aiProvider === "gemini") {
    partial.aiProvider = body.aiProvider;
  }
  if (body.imageProvider === "openai" || body.imageProvider === "gemini") {
    partial.imageProvider = body.imageProvider;
  }
  if (typeof body.openaiModel === "string" && body.openaiModel.trim()) {
    partial.openaiModel = body.openaiModel.trim();
  }
  if (typeof body.geminiModel === "string" && body.geminiModel.trim()) {
    partial.geminiModel = body.geminiModel.trim();
  }
  if (body.scanIntervalMin != null) partial.scanIntervalMin = Number(body.scanIntervalMin);
  if (body.scanLookbackDays != null) partial.scanLookbackDays = Number(body.scanLookbackDays);
  if (body.minWordCount != null) partial.minWordCount = Number(body.minWordCount);
  if (body.targetWordCount != null) partial.targetWordCount = Number(body.targetWordCount);
  if (typeof body.useSourceImage === "boolean") partial.useSourceImage = body.useSourceImage;
  if (typeof body.useStockImage === "boolean") partial.useStockImage = body.useStockImage;
  if (typeof body.useAiImage === "boolean") partial.useAiImage = body.useAiImage;
  if (typeof body.coverBrandingEnabled === "boolean") {
    partial.coverBrandingEnabled = body.coverBrandingEnabled;
  }
  if (typeof body.coverWatermarkEnabled === "boolean") {
    partial.coverWatermarkEnabled = body.coverWatermarkEnabled;
  }
  if (body.coverLogoPosition === "top-left" || body.coverLogoPosition === "top-right") {
    partial.coverLogoPosition = body.coverLogoPosition;
  }
  if (
    body.coverTitleStyle === "bold" ||
    body.coverTitleStyle === "compact" ||
    body.coverTitleStyle === "impact"
  ) {
    partial.coverTitleStyle = body.coverTitleStyle;
  }
  if (typeof body.coverBreakingTagEnabled === "boolean") {
    partial.coverBreakingTagEnabled = body.coverBreakingTagEnabled;
  }
  if (typeof body.coverLogoCustom === "boolean") partial.coverLogoCustom = body.coverLogoCustom;
  if (typeof body.twitterApiKey === "string" && body.twitterApiKey.trim()) {
    partial.twitterApiKey = body.twitterApiKey.trim();
  }
  if (typeof body.twitterApiSecret === "string" && body.twitterApiSecret.trim()) {
    partial.twitterApiSecret = body.twitterApiSecret.trim();
  }
  if (typeof body.twitterBearerToken === "string" && body.twitterBearerToken.trim()) {
    partial.twitterBearerToken = body.twitterBearerToken.trim();
  }
  if (typeof body.twitterAccounts === "string") partial.twitterAccounts = body.twitterAccounts;
  if (typeof body.instagramAccessToken === "string" && body.instagramAccessToken.trim()) {
    partial.instagramAccessToken = body.instagramAccessToken.trim();
  }
  if (typeof body.instagramAccountId === "string") {
    partial.instagramAccountId = body.instagramAccountId.trim();
  }
  if (typeof body.openaiApiKey === "string" && body.openaiApiKey.trim()) {
    partial.openaiApiKey = body.openaiApiKey.trim();
  }
  if (typeof body.geminiApiKey === "string" && body.geminiApiKey.trim()) {
    partial.geminiApiKey = body.geminiApiKey.trim();
  }

  return partial;
}
