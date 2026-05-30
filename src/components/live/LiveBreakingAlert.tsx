"use client";

import Link from "next/link";
import { useLiveNews } from "./LiveNewsProvider";
import { X, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function LiveBreakingAlert() {
  const { newBreakingId, breakingNews } = useLiveNews();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const article = breakingNews.find((a) => a.id === newBreakingId);

  useEffect(() => {
    if (newBreakingId && newBreakingId !== dismissed) {
      setVisible(true);
    }
  }, [newBreakingId, dismissed]);

  if (!visible || !article || article.id === dismissed) return null;

  return (
    <div className="animate-slide-down fixed left-0 right-0 top-0 z-[100] mx-auto max-w-lg px-4 pt-4">
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 shadow-2xl ring-1 ring-red-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Son Dakika</p>
          <Link
            href={`/haber/${article.slug}`}
            className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-red-600"
            onClick={() => setVisible(false)}
          >
            {article.title}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(article.id);
            setVisible(false);
          }}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
