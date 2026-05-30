import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import { getDefaultMetadata } from "@/lib/seo/metadata";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-headline",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = getDefaultMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${barlowCondensed.variable} ${sourceSans.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
