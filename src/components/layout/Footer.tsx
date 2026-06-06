import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { categories } from "@/data/categories";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <footer className="safe-bottom mt-auto border-t border-border bg-white">
      <div className="page-shell py-8 md:py-10">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo variant="footer" linked />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Gençlerin haber adresi. Hızlı, net, güvenilir — Türkiye&apos;den ve dünyadan son dakika.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategoriler</h3>
            <ul className="space-y-2">
              {navCategories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/kategori/${category.slug}`}
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Site</h3>
            <ul className="space-y-2">
              <li><Link href="/hakkimizda" className="text-sm font-medium hover:text-primary">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-sm font-medium hover:text-primary">İletişim</Link></li>
              <li><Link href="/gizlilik" className="text-sm font-medium hover:text-primary">Gizlilik</Link></li>
              <li><Link href="/kullanim-kosullari" className="text-sm font-medium hover:text-primary">Koşullar</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Takip Et</h3>
            <div className="flex gap-2">
              {["X", "IG", "YT", "TT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-bold transition-colors hover:bg-primary hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground" suppressHydrationWarning>
          © {currentYear} Ulubek Medya — Haber burada başlar.
        </p>
      </div>
    </footer>
  );
}
