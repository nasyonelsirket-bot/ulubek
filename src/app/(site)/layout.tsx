import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import LiveNewsProvider from "@/components/live/LiveNewsProvider";
import ConditionalBreakingTicker from "@/components/live/ConditionalBreakingTicker";
import LiveBreakingAlert from "@/components/live/LiveBreakingAlert";
import JsonLd from "@/components/seo/JsonLd";
import { getBreakingNews } from "@/lib/services/articles";
import { serializeLiveArticle } from "@/lib/live/serialize";
import { getWebSocketClientUrl } from "@/lib/live/config.server";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/config";

export const revalidate = 120;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const breaking = await getBreakingNews();
  const initialBreaking = breaking.map(serializeLiveArticle);
  const websocketUrl = getWebSocketClientUrl();
  const siteUrl = getSiteUrl();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <LiveNewsProvider initialBreaking={initialBreaking} websocketUrl={websocketUrl}>
      <JsonLd data={websiteSchema} />
      <SiteHeader />
      <ConditionalBreakingTicker />
      <LiveBreakingAlert />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </LiveNewsProvider>
  );
}
