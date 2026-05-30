import { getArticleById } from "@/lib/services/articles";
import { broadcastLiveEvent } from "@/lib/live/broadcast";
import { serializeLiveArticle } from "@/lib/live/serialize";

export async function notifyArticlePublished(articleId: string): Promise<void> {
  const article = await getArticleById(articleId);
  if (!article || article.status !== "PUBLISHED") return;

  const live = serializeLiveArticle(article);
  const timestamp = new Date().toISOString();

  await broadcastLiveEvent({ type: "NEW_ARTICLE", article: live, timestamp });

  if (article.breaking) {
    await broadcastLiveEvent({ type: "BREAKING_NEWS", article: live, timestamp });
  }
}
