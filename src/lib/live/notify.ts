import { prisma } from "@/lib/prisma";
import { broadcastLiveEvent } from "./broadcast";
import { serializeLiveArticle } from "./serialize";

export async function notifyArticlePublished(articleId: string): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId, status: "PUBLISHED" },
    include: { category: { select: { name: true, slug: true, color: true } } },
  });

  if (!article) return;

  const live = serializeLiveArticle(article);
  const timestamp = new Date().toISOString();

  await broadcastLiveEvent({ type: "NEW_ARTICLE", article: live, timestamp });

  if (article.breaking) {
    await broadcastLiveEvent({ type: "BREAKING_NEWS", article: live, timestamp });
  }
}
