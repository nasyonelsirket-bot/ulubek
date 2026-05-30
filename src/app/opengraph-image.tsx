import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/seo/config";
import { getLogoBase64, getLogoDataUri } from "@/lib/seo/logo";

export const alt = "Ulubek Medya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBase64 = await getLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getLogoDataUri(logoBase64)}
          alt="Ulubek Medya"
          width={720}
          height={260}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 600,
            color: "#374151",
            letterSpacing: 2,
          }}
        >
          {SITE_TAGLINE.toUpperCase()}
        </p>
      </div>
    ),
    { ...size }
  );
}
