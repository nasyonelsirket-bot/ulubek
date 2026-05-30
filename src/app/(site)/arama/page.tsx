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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchContent />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
