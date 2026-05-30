import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Ulubek Medya ile iletişime geçin.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">İletişim</h1>
        <p className="mt-4 text-gray-600">
          Sorularınız, önerileriniz veya iş birliği teklifleriniz için bizimle iletişime geçebilirsiniz.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">İletişim Bilgileri</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Adres</dt>
                <dd className="mt-1 text-gray-900">
                  Levent Mah. Haber Sok. No:42
                  <br />
                  Beşiktaş / İstanbul
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-gray-900">+90 (212) 555 00 00</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                <dd className="mt-1">
                  <a href="mailto:info@ulubekmedya.com" className="text-red-600 hover:underline">
                    info@ulubekmedya.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Basın İletişim</dt>
                <dd className="mt-1">
                  <a href="mailto:basin@ulubekmedya.com" className="text-red-600 hover:underline">
                    basin@ulubekmedya.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">Mesaj Gönderin</h2>
            <form className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Mesajınızı yazın..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
