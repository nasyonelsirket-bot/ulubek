import { getSettings } from "@/lib/settings/store";

export interface TwitterPost {
  id: string;
  text: string;
  createdAt: string;
  authorUsername: string;
}

export async function fetchTwitterPosts(limit = 10): Promise<TwitterPost[]> {
  const settings = getSettings();
  if (!settings.twitterBearerToken?.trim()) return [];

  const accounts = settings.twitterAccounts
    .split(",")
    .map((a) => a.trim().replace("@", ""))
    .filter(Boolean);

  if (accounts.length === 0) return [];

  const posts: TwitterPost[] = [];

  for (const username of accounts.slice(0, 5)) {
    try {
      const userRes = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}?user.fields=username`,
        {
          headers: { Authorization: `Bearer ${settings.twitterBearerToken}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!userRes.ok) continue;
      const userData = await userRes.json();
      const userId = userData.data?.id;
      if (!userId) continue;

      const tweetsRes = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=${Math.min(limit, 10)}&tweet.fields=created_at,text`,
        {
          headers: { Authorization: `Bearer ${settings.twitterBearerToken}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!tweetsRes.ok) continue;
      const tweetsData = await tweetsRes.json();

      for (const tweet of tweetsData.data ?? []) {
        posts.push({
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          authorUsername: username,
        });
      }
    } catch {
      continue;
    }
  }

  return posts.slice(0, limit);
}
