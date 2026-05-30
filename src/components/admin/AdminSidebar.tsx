"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  LogOut,
  Rss,
  ListOrdered,
  ScanSearch,
  Clock,
  CheckCircle2,
  Sparkles,
  Search,
  ImageIcon,
  ScrollText,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/queue", label: "Haber Kuyruğu", icon: ListOrdered },
  { href: "/admin/scanned", label: "Taranan Haberler", icon: ScanSearch },
  { href: "/admin/pending", label: "Yayın Bekleyenler", icon: Clock },
  { href: "/admin/published", label: "Yayınlananlar", icon: CheckCircle2 },
  { href: "/admin/articles", label: "Haberler", icon: Newspaper },
  { href: "/admin/sources", label: "Kaynak Yönetimi", icon: Rss },
  { href: "/admin/ai", label: "AI Ayarları", icon: Sparkles },
  { href: "/admin/seo", label: "SEO Yönetimi", icon: Search },
  { href: "/admin/images", label: "Görsel Yönetimi", icon: ImageIcon },
  { href: "/admin/logs", label: "Sistem Logları", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="flex min-h-[72px] items-center border-b px-4 py-2">
        <Logo variant="admin" linked={false} />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
        <Link href="/" className="mt-2 block text-center text-xs text-muted-foreground hover:text-red-600">
          Siteye Dön →
        </Link>
      </div>
    </aside>
  );
}
