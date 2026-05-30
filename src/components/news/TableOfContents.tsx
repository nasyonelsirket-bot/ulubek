"use client";

import { useEffect, useState } from "react";

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const nodes = doc.querySelectorAll("h2, h3");
    const items = Array.from(nodes).map((node, i) => ({
      id: `section-${i}`,
      text: node.textContent || "",
      level: node.tagName === "H2" ? 2 : 3,
    }));
    setHeadings(items);
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav className="rounded-xl bg-card p-5 ring-1 ring-border">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">İçindekiler</h2>
      <ol className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
