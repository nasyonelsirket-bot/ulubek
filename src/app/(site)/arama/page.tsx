import type { Metadata } from "next";
import SearchContent from "./SearchContent";
import Sidebar from "@/components/layout/Sidebar";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Haber Arama",
  description: "Ulubek Medya haber arama — son dakika ve güncel haberlerde arama yapın.",
  path: "/arama",
});

export default function SearchPage() {
  return (
    <div className="safe-bottom mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="font-headline mb-6 text-2xl font-extrabold text-[var(--navy)]">Haber Ara</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchContent />
        </div>
        <div className="hidden lg:col-span-1 lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
