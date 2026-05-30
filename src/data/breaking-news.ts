import { getAllRawArticles } from "./articles";
import type { RawArticle } from "./types";

export function getBreakingNewsArticles(): RawArticle[] {
  return getAllRawArticles().filter(
    (article) => article.breaking && (article.status ?? "PUBLISHED") === "PUBLISHED"
  );
}

export const breakingNews = getBreakingNewsArticles();
