"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ana Sayfa", icon: Home, match: (p: string) => p === "/" },
  { href: "/kategori/gundem", label: "Gündem", icon: LayoutGrid, match: (p: string) => p.startsWith("/kategori") },
  { href: "/#son-dakika", label: "Canlı", icon: Zap, match: () => false },
  { href: "/arama", label: "Ara", icon: Search, match: (p: string) => p === "/arama" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Mobil menü"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const isLive = item.label === "Canlı";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground",
                isLive && "text-primary"
              )}
            >
              <span className={cn("relative flex h-7 w-7 items-center justify-center rounded-full", active && "bg-red-50")}>
                <Icon className="h-5 w-5" fill={isLive ? "currentColor" : "none"} strokeWidth={isLive ? 0 : 2} />
                {isLive && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
