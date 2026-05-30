import Link from "next/link";
import { getBreakingNews } from "@/lib/data/articles";

export default function BreakingNewsTicker() {
  const breakingNews = getBreakingNews();

  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-600">
          Son Dakika
        </span>
        <div className="overflow-hidden">
          <div className="animate-ticker flex whitespace-nowrap">
            {[...breakingNews, ...breakingNews].map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/haber/${article.slug}`}
                className="mx-6 inline-block text-sm hover:underline"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
