import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Kullanım Koşulları",
  description: "Ulubek Medya web sitesi kullanım koşulları ve yasal bilgiler.",
  path: "/kullanim-kosullari",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900">Kullanım Koşulları</h1>
        <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
          <p>Son güncelleme: 30 Mayıs 2026</p>
          <p>
            Ulubek Medya web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Telif Hakları</h2>
          <p>
            Sitede yer alan tüm içerik, görseller ve tasarımlar Ulubek Medya&apos;ya aittir. İzinsiz
            kopyalanması ve dağıtılması yasaktır.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Sorumluluk Reddi</h2>
          <p>
            Sitede yer alan haberler bilgilendirme amaçlıdır. Ulubek Medya, haberlerin doğruluğu
            konusunda azami özeni gösterse de, haberlerdeki bilgilerin kullanımından doğabilecek
            sonuçlardan sorumlu tutulamaz.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Değişiklikler</h2>
          <p>
            Ulubek Medya, kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı
            tutar. Güncel koşullar için bu sayfayı düzenli olarak kontrol etmenizi öneririz.
          </p>
          <p>
            Sorularınız için{" "}
            <Link href="/iletisim" className="text-red-600 hover:underline">
              iletişim
            </Link>{" "}
            sayfamızı ziyaret edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
