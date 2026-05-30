import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Ulubek Medya hakkında bilgi edinin.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Hakkımızda</h1>
        <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">Ulubek Medya</strong>, Türkiye&apos;nin önde gelen dijital haber
            platformlarından biridir. 2020 yılında kurulan haber portalımız, okuyucularına tarafsız, doğru ve
            güncel haberleri ulaştırmayı misyon edinmiştir.
          </p>
          <p>
            Gündem, ekonomi, spor, teknoloji, sağlık, dünya ve kültür-sanat kategorilerinde geniş bir
            haber yelpazesi sunuyoruz. Deneyimli editör kadromuz ve muhabirlerimiz, haberleri titizlikle
            doğrulayarak yayınlamaktadır.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Misyonumuz</h2>
          <p>
            Toplumun doğru bilgiye erişim hakkını savunarak, kaliteli gazetecilik anlayışıyla habercilik
            yapmak ve okuyucularımıza güvenilir bir haber kaynağı olmak.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Vizyonumuz</h2>
          <p>
            Dijital medyada öncü ve güvenilir bir marka olarak, teknolojinin sunduğu imkânları kullanarak
            haberciliği geleceğe taşımak.
          </p>
          <h2 className="text-xl font-bold text-gray-900">Değerlerimiz</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Tarafsızlık ve objektiflik</li>
            <li>Doğruluk ve güvenilirlik</li>
            <li>Hızlı ve güncel habercilik</li>
            <li>Okuyucu odaklı yaklaşım</li>
            <li>Etik gazetecilik ilkeleri</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
