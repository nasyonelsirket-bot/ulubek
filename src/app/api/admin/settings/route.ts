import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublicSettings, saveSettings } from "@/lib/settings/store";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(getPublicSettings());
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await request.json();
  const partial: Record<string, unknown> = {};

  if (body.aiProvider) partial.aiProvider = body.aiProvider;
  if (body.imageProvider) partial.imageProvider = body.imageProvider;
  if (body.openaiModel) partial.openaiModel = body.openaiModel;
  if (body.geminiModel) partial.geminiModel = body.geminiModel;
  if (body.scanIntervalMin) partial.scanIntervalMin = Number(body.scanIntervalMin);
  if (body.scanLookbackDays) partial.scanLookbackDays = Number(body.scanLookbackDays);
  if (body.minWordCount) partial.minWordCount = Number(body.minWordCount);
  if (body.targetWordCount) partial.targetWordCount = Number(body.targetWordCount);
  if (typeof body.useSourceImage === "boolean") partial.useSourceImage = body.useSourceImage;
  if (typeof body.useStockImage === "boolean") partial.useStockImage = body.useStockImage;
  if (typeof body.useAiImage === "boolean") partial.useAiImage = body.useAiImage;
  if (typeof body.coverBrandingEnabled === "boolean") partial.coverBrandingEnabled = body.coverBrandingEnabled;
  if (typeof body.coverWatermarkEnabled === "boolean") partial.coverWatermarkEnabled = body.coverWatermarkEnabled;
  if (body.coverLogoPosition === "top-left" || body.coverLogoPosition === "top-right") {
    partial.coverLogoPosition = body.coverLogoPosition;
  }
  if (body.coverTitleStyle === "bold" || body.coverTitleStyle === "compact" || body.coverTitleStyle === "impact") {
    partial.coverTitleStyle = body.coverTitleStyle;
  }
  if (typeof body.coverBreakingTagEnabled === "boolean") partial.coverBreakingTagEnabled = body.coverBreakingTagEnabled;
  if (typeof body.coverLogoCustom === "boolean") partial.coverLogoCustom = body.coverLogoCustom;
  if (body.twitterApiKey?.trim()) partial.twitterApiKey = body.twitterApiKey.trim();
  if (body.twitterApiSecret?.trim()) partial.twitterApiSecret = body.twitterApiSecret.trim();
  if (body.twitterBearerToken?.trim()) partial.twitterBearerToken = body.twitterBearerToken.trim();
  if (typeof body.twitterAccounts === "string") partial.twitterAccounts = body.twitterAccounts;
  if (body.instagramAccessToken?.trim()) partial.instagramAccessToken = body.instagramAccessToken.trim();
  if (typeof body.instagramAccountId === "string") partial.instagramAccountId = body.instagramAccountId.trim();
  if (body.openaiApiKey?.trim()) partial.openaiApiKey = body.openaiApiKey.trim();
  if (body.geminiApiKey?.trim()) partial.geminiApiKey = body.geminiApiKey.trim();

  saveSettings(partial);
  return NextResponse.json(getPublicSettings());
}
