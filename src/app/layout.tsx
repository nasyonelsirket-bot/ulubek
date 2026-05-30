import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreakingNewsTicker from "@/components/layout/BreakingNewsTicker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ulubek Medya | Güvenilir Haber Kaynağınız",
    template: "%s | Ulubek Medya",
  },
  description:
    "Türkiye ve dünyadan en güncel haberler. Gündem, ekonomi, spor, teknoloji, sağlık ve daha fazlası Ulubek Medya'da.",
  keywords: ["haber", "gündem", "ekonomi", "spor", "teknoloji", "Türkiye", "Ulubek Medya"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ulubek Medya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-gray-50 font-sans antialiased">
        <Header />
        <BreakingNewsTicker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
