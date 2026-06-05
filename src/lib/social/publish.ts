import { getSettings } from "@/lib/settings/store";
import { getSiteUrl } from "@/lib/seo/config";

export interface SocialPublishInput {
  title: string;
  excerpt: string;
  slug: string;
  breaking?: boolean;
}

export interface SocialPublishResult {
  twitter: { attempted: boolean; success: boolean; error?: string };
  instagram: { attempted: boolean; success: boolean; error?: string };
}

function buildShareText(input: SocialPublishInput): string {
  const url = `${getSiteUrl()}/haber/${input.slug}`;
  const prefix = input.breaking ? "🔴 SON DAKİKA | " : "";
  const text = `${prefix}${input.title}\n\n${input.excerpt.slice(0, 200)}…\n\n${url}`;
  return text.slice(0, 280);
}

/** Twitter/X — Bearer token ile tweet oluştur (API v2). */
async function postToTwitter(text: string): Promise<void> {
  const settings = getSettings();
  const token = settings.twitterBearerToken?.trim();
  if (!token) throw new Error("Twitter Bearer token yapılandırılmamış");

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Twitter API ${res.status}: ${body.slice(0, 200)}`);
  }
}

/** Instagram Graph API — medya container + publish (link bio'da; caption'da metin). */
async function postToInstagram(caption: string, imageUrl: string): Promise<void> {
  const settings = getSettings();
  const token = settings.instagramAccessToken?.trim();
  const accountId = settings.instagramAccountId?.trim();
  if (!token || !accountId) throw new Error("Instagram token veya hesap ID eksik");

  const createRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${token}`,
    { method: "POST", signal: AbortSignal.timeout(20000) }
  );
  if (!createRes.ok) {
    const body = await createRes.text().catch(() => "");
    throw new Error(`Instagram media ${createRes.status}: ${body.slice(0, 200)}`);
  }

  const { id: creationId } = (await createRes.json()) as { id?: string };
  if (!creationId) throw new Error("Instagram media ID alınamadı");

  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media_publish?creation_id=${creationId}&access_token=${token}`,
    { method: "POST", signal: AbortSignal.timeout(15000) }
  );
  if (!publishRes.ok) {
    const body = await publishRes.text().catch(() => "");
    throw new Error(`Instagram publish ${publishRes.status}: ${body.slice(0, 200)}`);
  }
}

/**
 * Yeni haber yayınlandığında sosyal medyaya paylaş.
 * API anahtarları yoksa sessizce atlar — admin panelden sonradan eklenebilir.
 */
export async function publishArticleToSocial(
  input: SocialPublishInput & { image?: string | null }
): Promise<SocialPublishResult> {
  const settings = getSettings();
  const text = buildShareText(input);
  const result: SocialPublishResult = {
    twitter: { attempted: false, success: false },
    instagram: { attempted: false, success: false },
  };

  if (settings.twitterBearerToken?.trim()) {
    result.twitter.attempted = true;
    try {
      await postToTwitter(text);
      result.twitter.success = true;
    } catch (err) {
      result.twitter.error = err instanceof Error ? err.message : "Twitter hatası";
      console.error("[social/twitter]", result.twitter.error);
    }
  }

  if (settings.instagramAccessToken?.trim() && settings.instagramAccountId?.trim() && input.image) {
    result.instagram.attempted = true;
    try {
      const imageUrl = input.image.startsWith("http")
        ? input.image
        : `${getSiteUrl()}${input.image.startsWith("/") ? input.image : `/${input.image}`}`;
      await postToInstagram(text, imageUrl);
      result.instagram.success = true;
    } catch (err) {
      result.instagram.error = err instanceof Error ? err.message : "Instagram hatası";
      console.error("[social/instagram]", result.instagram.error);
    }
  }

  return result;
}
