import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-red-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Sayfa Bulunamadı</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
