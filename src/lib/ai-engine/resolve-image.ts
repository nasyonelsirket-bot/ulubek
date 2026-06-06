import { generateNewsImage } from "./image";
import {
  createNewsCovers,
  createNewsCoversFromBufferLite,
  bufferFromSource,
} from "./image-optimizer";
import { fetchStockImage } from "./stock-image";
import { generatePlaceholderCover } from "./placeholder-image";
import { getSettings } from "@/lib/settings/store";
import { isHighQualityImageUrl } from "@/lib/utils/image-quality";
import { categories } from "@/data/categories";
import type { CoverComposeInput } from "./cover-compositor";

export type ImageSource = "source" | "stock" | "ai" | "placeholder";

export interface ImageResolutionResult {
  url: string;
  urlSquare?: string;
  urlStory?: string;
  prompt: string;
  provider: ImageSource;
}

export interface ResolveImageInput {
  title: string;
  categorySlug: string;
  categoryName?: string;
  categoryColor?: string;
  breaking?: boolean;
  sourceImageUrl?: string | null;
  articleId?: string;
}

function getCategoryMeta(slug: string) {
  const cat = categories.find((c) => c.slug === slug);
  return {
    name: cat?.name ?? "Gündem",
    color: cat?.color ?? "#c41e1e",
  };
}

function buildCoverInput(input: ResolveImageInput): CoverComposeInput {
  const meta = getCategoryMeta(input.categorySlug);
  return {
    title: input.title,
    categoryName: input.categoryName ?? meta.name,
    categoryColor: input.categoryColor ?? meta.color,
    breaking: input.breaking ?? false,
  };
}

function isRemoteImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Hızlı pipeline — önce kaynak görseli, yoksa stok/placeholder. */
export async function resolveArticleImageQuick(
  input: ResolveImageInput
): Promise<ImageResolutionResult> {
  const fileId = input.articleId ?? `img-${Date.now()}`;
  const coverInput = buildCoverInput(input);

  const sourceUrl = input.sourceImageUrl?.trim();
  if (sourceUrl && isRemoteImageUrl(sourceUrl)) {
    try {
      const buffer = await Promise.race([
        bufferFromSource(sourceUrl),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);

      if (buffer) {
        const covers = await Promise.race([
          createNewsCoversFromBufferLite(buffer, fileId, coverInput),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
        ]);
        if (covers) {
          return {
            url: covers.web,
            urlSquare: covers.square,
            urlStory: covers.story,
            prompt: sourceUrl,
            provider: "source",
          };
        }
      }

      // Netlify'da /api/media dosyaları kalıcı değil — kaynak URL'sini doğrudan kullan
      return {
        url: sourceUrl,
        prompt: sourceUrl,
        provider: "source",
      };
    } catch {
      return {
        url: sourceUrl,
        prompt: sourceUrl,
        provider: "source",
      };
    }
  }

  const stockUrl = await fetchStockImage(input.categorySlug, input.title);
  if (stockUrl) {
    const buf = await bufferFromSource(stockUrl);
    if (buf) {
      const covers = await createNewsCoversFromBufferLite(buf, `stock-${fileId}`, coverInput);
      if (covers) {
        return {
          url: covers.web,
          urlSquare: covers.square,
          urlStory: covers.story,
          prompt: `stock:${input.categorySlug}`,
          provider: "stock",
        };
      }
    }
    if (isRemoteImageUrl(stockUrl)) {
      return { url: stockUrl, prompt: `stock:${input.categorySlug}`, provider: "stock" };
    }
  }

  const placeholder = generatePlaceholderCover(input.title, input.categorySlug);
  const placeholderBuffer = await bufferFromSource(placeholder);
  if (placeholderBuffer) {
    const covers = await createNewsCoversFromBufferLite(placeholderBuffer, `ph-${fileId}`, coverInput);
    if (covers) {
      return {
        url: covers.web,
        urlSquare: covers.square,
        urlStory: covers.story,
        prompt: "placeholder-branded",
        provider: "placeholder",
      };
    }
  }

  return {
    url: placeholder,
    prompt: "placeholder",
    provider: "placeholder",
  };
}

/** @deprecated resolveArticleImageQuick kullanın */
export async function resolveArticleImageFast(
  input: ResolveImageInput
): Promise<ImageResolutionResult> {
  return resolveArticleImageQuick(input);
}

export async function resolveArticleImage(input: ResolveImageInput): Promise<ImageResolutionResult> {
  const settings = getSettings();
  const fileId = input.articleId ?? `img-${Date.now()}`;
  const coverInput = buildCoverInput(input);

  if (settings.useSourceImage && input.sourceImageUrl?.trim()) {
    const sourceUrl = input.sourceImageUrl.trim();
    if (isHighQualityImageUrl(sourceUrl) || sourceUrl.match(/\.(jpg|jpeg|png|webp)/i)) {
      const covers = await createNewsCovers(sourceUrl, fileId, coverInput);
      if (covers) {
        return {
          url: covers.web,
          urlSquare: covers.square,
          urlStory: covers.story,
          prompt: sourceUrl,
          provider: "source",
        };
      }
    }
    if (isRemoteImageUrl(sourceUrl)) {
      return { url: sourceUrl, prompt: sourceUrl, provider: "source" };
    }
  }

  if (settings.useStockImage) {
    const stockUrl = await fetchStockImage(input.categorySlug, input.title);
    if (stockUrl) {
      const covers = await createNewsCovers(stockUrl, `stock-${fileId}`, coverInput);
      if (covers) {
        return {
          url: covers.web,
          urlSquare: covers.square,
          urlStory: covers.story,
          prompt: `stock:${input.categorySlug}`,
          provider: "stock",
        };
      }
    }
  }

  if (settings.useAiImage) {
    const ai = await generateNewsImage(input.title, input.categorySlug);
    const buffer = await bufferFromSource(ai.url);
    if (buffer) {
      const covers = await createNewsCovers(buffer, `ai-${fileId}`, coverInput);
      if (covers) {
        return {
          url: covers.web,
          urlSquare: covers.square,
          urlStory: covers.story,
          prompt: ai.prompt,
          provider: "ai",
        };
      }
    }
  }

  const placeholderSvg = generatePlaceholderCover(input.title, input.categorySlug);
  const placeholderBuffer = await bufferFromSource(placeholderSvg);
  if (placeholderBuffer) {
    const covers = await createNewsCovers(placeholderBuffer, `ph-${fileId}`, coverInput);
    if (covers) {
      return {
        url: covers.web,
        urlSquare: covers.square,
        urlStory: covers.story,
        prompt: "placeholder-branded",
        provider: "placeholder",
      };
    }
  }

  return {
    url: generatePlaceholderCover(input.title, input.categorySlug),
    prompt: "placeholder",
    provider: "placeholder",
  };
}
