import Link from "next/link";

interface NewsSectionHeadProps {
  title: string;
  href?: string;
  linkLabel?: string;
  badge?: string;
}

export default function NewsSectionHead({
  title,
  href,
  linkLabel = "Tümü",
  badge,
}: NewsSectionHeadProps) {
  return (
    <div className="news-section-head">
      <div className="flex items-center gap-2">
        <h2 className="news-section-title">{title}</h2>
        {badge && <span className="news-badge news-badge-live">{badge}</span>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-primary hover:text-white"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
