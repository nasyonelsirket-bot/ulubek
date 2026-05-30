import { getSettings } from "@/lib/settings/store";

export interface InstagramPost {
  id: string;
  caption: string;
  mediaUrl: string | null;
  permalink: string;
  timestamp: string;
}

export async function fetchInstagramPosts(limit = 10): Promise<InstagramPost[]> {
  const settings = getSettings();
  const token = settings.instagramAccessToken?.trim();
  const accountId = settings.instagramAccountId?.trim();

  if (!token || !accountId) return [];

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_url,permalink,timestamp&limit=${limit}&access_token=${token}`,
      { signal: AbortSignal.timeout(15000), next: { revalidate: 300 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data ?? []).map((item: Record<string, string>) => ({
      id: item.id,
      caption: item.caption ?? "",
      mediaUrl: item.media_url ?? null,
      permalink: item.permalink ?? "",
      timestamp: item.timestamp ?? "",
    }));
  } catch {
    return [];
  }
}
