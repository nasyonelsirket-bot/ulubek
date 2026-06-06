import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getDefaultMetadata } from "@/lib/seo/metadata";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

// headline = aynı aile, CSS'te font-weight:800 ile vurgu

export const metadata: Metadata = getDefaultMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
