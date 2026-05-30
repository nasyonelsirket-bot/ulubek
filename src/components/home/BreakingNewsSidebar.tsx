import Link from "next/link";
import RelativeTime from "@/components/ui/RelativeTime";
import type { PortalArticleItem } from "@/components/news/PortalArticleCard";
import PortalArticleCard from "@/components/news/PortalArticleCard";

interface BreakingNewsSidebarProps {
  items: PortalArticleItem[];
  title?: string;
}

export default function BreakingNewsSidebar({ items, title = "Son Dakika" }: BreakingNewsSidebarProps) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;

  return (
    <aside id="son-dakika" className="flex h-full flex-col rounded-lg border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-primary/20 bg-primary px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse-live" />
        </span>
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-white">{title}</h2>
      </div>

      <div className="border-b border-border p-3">
        <Link href={`/haber/${lead.slug}`} className="group block">
          {lead.category && (
            <span className="text-[10px] font-bold uppercase" style={{ color: lead.category.color }}>
              {lead.category.name}
            </span>
          )}
          <h3 className="font-headline mt-1 line-clamp-3 text-base font-bold leading-snug text-[var(--navy)] group-hover:text-primary">
            {lead.title}
          </h3>
          <RelativeTime date={lead.publishedAt} className="mt-1.5 text-[11px] text-muted-foreground" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {rest.slice(0, 8).map((item) => (
          <PortalArticleCard key={item.id} article={item} variant="horizontal" />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <Link href="/#son-dakika" className="text-xs font-bold uppercase text-primary hover:underline">
          Tüm son dakika →
        </Link>
      </div>
    </aside>
  );
}
