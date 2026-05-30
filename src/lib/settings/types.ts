export type AIProvider = "openai" | "gemini";
export type ImageProvider = "openai" | "gemini";
export type LogoPosition = "top-left" | "top-right";
export type CoverTitleStyle = "bold" | "compact" | "impact";

export interface AppSettings {
  aiProvider: AIProvider;
  imageProvider: ImageProvider;
  openaiApiKey: string;
  geminiApiKey: string;
  openaiModel: string;
  geminiModel: string;
  scanIntervalMin: number;
  scanLookbackDays: number;
  minWordCount: number;
  targetWordCount: number;
  useSourceImage: boolean;
  useStockImage: boolean;
  useAiImage: boolean;
  coverBrandingEnabled: boolean;
  coverWatermarkEnabled: boolean;
  coverLogoPosition: LogoPosition;
  coverTitleStyle: CoverTitleStyle;
  coverBreakingTagEnabled: boolean;
  coverLogoCustom: boolean;
  twitterApiKey: string;
  twitterApiSecret: string;
  twitterBearerToken: string;
  twitterAccounts: string;
  instagramAccessToken: string;
  instagramAccountId: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: "openai",
  imageProvider: "openai",
  openaiApiKey: "",
  geminiApiKey: "",
  openaiModel: "gpt-4o-mini",
  geminiModel: "gemini-2.0-flash",
  scanIntervalMin: 1,
  scanLookbackDays: 10,
  minWordCount: 700,
  targetWordCount: 1500,
  useSourceImage: true,
  useStockImage: true,
  useAiImage: true,
  coverBrandingEnabled: true,
  coverWatermarkEnabled: true,
  coverLogoPosition: "top-left",
  coverTitleStyle: "bold",
  coverBreakingTagEnabled: true,
  coverLogoCustom: false,
  twitterApiKey: "",
  twitterApiSecret: "",
  twitterBearerToken: "",
  twitterAccounts: "",
  instagramAccessToken: "",
  instagramAccountId: "",
};

export interface PublicSettings {
  aiProvider: AIProvider;
  imageProvider: ImageProvider;
  openaiModel: string;
  geminiModel: string;
  scanIntervalMin: number;
  scanLookbackDays: number;
  minWordCount: number;
  targetWordCount: number;
  openaiKeyConfigured: boolean;
  geminiKeyConfigured: boolean;
  openaiKeyPreview: string;
  geminiKeyPreview: string;
  useSourceImage: boolean;
  useStockImage: boolean;
  useAiImage: boolean;
  coverBrandingEnabled: boolean;
  coverWatermarkEnabled: boolean;
  coverLogoPosition: LogoPosition;
  coverTitleStyle: CoverTitleStyle;
  coverBreakingTagEnabled: boolean;
  coverLogoCustom: boolean;
  coverLogoUploaded: boolean;
  twitterKeyConfigured: boolean;
  twitterBearerConfigured: boolean;
  instagramConfigured: boolean;
  twitterAccounts: string;
  instagramAccountId: string;
}
