import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { getAllCategories } from "@/lib/services/articles";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const categories = await getAllCategories();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" linked />
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Türkiye ve dünyadan en güncel, tarafsız ve güvenilir haberleri okuyucularımıza ulaştırıyoruz.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Kategoriler</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link href={`/kategori/${category.slug}`} className="text-sm transition-colors hover:text-red-400">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Kurumsal</h3>
            <ul className="space-y-2">
              <li><Link href="/hakkimizda" className="text-sm transition-colors hover:text-red-400">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-sm transition-colors hover:text-red-400">İletişim</Link></li>
              <li><Link href="/gizlilik" className="text-sm transition-colors hover:text-red-400">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari" className="text-sm transition-colors hover:text-red-400">Kullanım Koşulları</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Bizi Takip Edin</h3>
            <div className="flex gap-3">
              {["X", "Facebook", "Instagram", "YouTube"].map((social) => (
                <a key={social} href="#" aria-label={social} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-bold transition-colors hover:bg-red-600 hover:text-white">
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p suppressHydrationWarning>&copy; {currentYear} Ulubek Medya. Tüm hakları saklıdır.</p>
        </div>
      </div>
      <div className="h-1.5 bg-[#f5a623]" aria-hidden />
    </footer>
  );
}
