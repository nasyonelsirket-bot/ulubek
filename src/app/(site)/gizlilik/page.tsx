import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Gizlilik Politikası",
  description: "Ulubek Medya gizlilik politikası ve kişisel verilerin korunması.",
  path: "/gizlilik",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
        <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
          <p>Son güncelleme: 30 Mayıs 2026</p>
          <p>
            Ulubek Medya olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu gizlilik politikası,
            web sitemizi kullanırken toplanan bilgilerin nasıl işlendiğini açıklamaktadır.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Toplanan Bilgiler</h2>
          <p>
            Web sitemizi ziyaret ettiğinizde, tarayıcı türü, IP adresi, ziyaret edilen sayfalar ve
            ziyaret süresi gibi teknik bilgiler otomatik olarak toplanabilir.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Çerezler</h2>
          <p>
            Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcı
            ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
          </p>
          <h2 className="text-xl font-bold text-gray-900">İletişim</h2>
          <p>
            Gizlilik politikamız hakkında sorularınız için{" "}
            <Link href="/iletisim" className="text-red-600 hover:underline">
              iletişim
            </Link>{" "}
            sayfamızdan bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
