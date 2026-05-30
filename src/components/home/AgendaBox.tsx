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
    <aside className="sticky top-28 h-full overflow-hidden rounded-lg border border-border bg-card shadow-md">
      <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-2.5">
        <TrendingUp className="h-4 w-4 text-white" />
        <h2 className="font-headline text-sm font-black uppercase tracking-wider text-white">Gündem</h2>
      </div>
      <ol className="divide-y divide-border">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={`/haber/${item.slug}`}
              className="group flex gap-2.5 px-4 py-3 transition-colors hover:bg-accent/40"
            >
              <span className="font-headline flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-black text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {item.category && (
                  <span
                    className="mb-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name}
                  </span>
                )}
                <p className="font-headline line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </p>
                <RelativeTime date={item.publishedAt} className="mt-0.5 block text-[11px] text-muted-foreground" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <div className="border-t border-border px-4 py-2">
        <Link href="/kategori/gundem" className="text-xs font-bold uppercase text-primary hover:underline">
          Tüm gündem →
        </Link>
      </div>
    </aside>
  );
}
