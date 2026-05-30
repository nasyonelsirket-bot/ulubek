import { ImageResponse } from "next/og";
import { getLogoBase64, getLogoDataUri } from "@/lib/seo/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoBase64 = await getLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          padding: 16,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getLogoDataUri(logoBase64)}
          alt="Ulubek Medya"
          width={148}
          height={54}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
