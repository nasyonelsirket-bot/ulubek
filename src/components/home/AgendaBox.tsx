import Link from "next/link";
import { TrendingUp } from "lucide-react";
import RelativeTime from "@/components/ui/RelativeTime";

interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | Date;
  category?: { name: string; color: string };
}

interface AgendaBoxProps {
  items: AgendaItem[];
}

export default function AgendaBox({ items }: AgendaBoxProps) {
  return (
    <aside className="sticky top-24 overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border">
      <div className="flex items-center gap-2 border-b border-border bg-primary px-5 py-3">
        <TrendingUp className="h-4 w-4 text-primary-foreground" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary-foreground">Gündem</h2>
      </div>
      <ol className="divide-y divide-border">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={`/haber/${item.slug}`}
              className="group flex gap-3 px-5 py-4 transition-colors hover:bg-accent/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {item.category && (
                  <span
                    className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name}
                  </span>
                )}
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </p>
                <RelativeTime date={item.publishedAt} className="mt-1 block text-xs text-muted-foreground" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <div className="border-t border-border px-5 py-3">
        <Link href="/" className="text-xs font-semibold text-primary hover:underline">
          Tüm gündemi gör →
        </Link>
      </div>
    </aside>
  );
}
