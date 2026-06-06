import { ImageResponse } from "next/og";
import { getLogoBase64, getLogoDataUri } from "@/lib/seo/logo";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
        }}
      >
        <img
          src={getLogoDataUri(logoBase64)}
          alt="Ulubek Medya"
          width={32}
          height={32}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
