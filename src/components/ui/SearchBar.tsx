"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  compact?: boolean;
  className?: string;
}

export default function SearchBar({ compact = false, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Haber ara..."
        className={cn(
          "w-full rounded-full border border-border bg-secondary/60 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20",
          compact ? "py-1.5 pl-3 pr-9 text-xs" : "py-2 pl-4 pr-10 text-sm"
        )}
      />
      <button
        type="submit"
        aria-label="Ara"
        className={cn(
          "absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700",
          compact ? "h-6 w-6" : "h-8 w-8"
        )}
      >
        <svg className={compact ? "h-3 w-3" : "h-4 w-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
