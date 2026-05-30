import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",

  // Netlify'da /kategori/gundem/ gibi URL'ler icin
  trailingSlash: true,

  outputFileTracingRoot: path.join(__dirname),

  images: {
    // Static export icin zorunlu
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
