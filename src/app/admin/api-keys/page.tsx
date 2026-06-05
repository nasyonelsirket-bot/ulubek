import { getPublicSettings } from "@/lib/settings/store";
import SocialApiSettings from "@/components/admin/SocialApiSettings";
import NewsApiSettings from "@/components/admin/NewsApiSettings";

export default function AdminApiKeysPage() {
  const settings = getPublicSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Anahtarları</h1>
        <p className="text-sm text-muted-foreground">
          NewsAPI, Twitter/X ve Instagram Graph API yapılandırması
        </p>
      </div>
      <NewsApiSettings initial={settings} />
      <SocialApiSettings initial={settings} />
    </div>
  );
}
