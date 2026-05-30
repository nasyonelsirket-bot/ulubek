import { getPublicSettings } from "@/lib/settings/store";
import SocialApiSettings from "@/components/admin/SocialApiSettings";

export default function AdminApiKeysPage() {
  const settings = getPublicSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Anahtarları</h1>
        <p className="text-sm text-muted-foreground">Twitter/X ve Instagram Graph API yapılandırması</p>
      </div>
      <SocialApiSettings initial={settings} />
    </div>
  );
}
