"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export const LOGO_PATH = "/logo.png";

const variants = {
  header: {
    width: 480,
    height: 140,
    className:
      "h-[72px] w-auto max-w-[min(280px,60vw)] object-contain sm:h-[96px] sm:max-w-[340px] md:h-[120px] md:max-w-[400px] lg:h-[140px] lg:max-w-[480px]",
  },
  footer: {
    width: 360,
    height: 90,
    className: "h-16 w-auto max-w-[300px] object-contain md:h-20 md:max-w-[360px]",
  },
  admin: {
    width: 240,
    height: 60,
    className: "h-12 w-auto max-w-[220px] object-contain",
  },
  login: {
    width: 480,
    height: 140,
    className: "h-24 w-auto max-w-[400px] object-contain md:h-[140px] md:max-w-[480px]",
  },
  compact: {
    width: 240,
    height: 56,
    className: "h-12 w-auto max-w-[200px] object-contain",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof variants;
  linked?: boolean;
  className?: string;
  priority?: boolean;
  showTransparencyWarning?: boolean;
}

function checkLogoTransparency(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(img.naturalWidth, 64);
        canvas.height = Math.min(img.naturalHeight, 64);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(true);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparentCorners = 0;
        const corners = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1],
        ];
        for (const [x, y] of corners) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] < 200) transparentCorners++;
        }
        resolve(transparentCorners >= 2);
      } catch {
        resolve(true);
      }
    };
    img.onerror = () => resolve(true);
    img.src = src;
  });
}

export default function Logo({
  variant = "header",
  linked = true,
  className,
  priority = false,
  showTransparencyWarning = variant === "header",
}: LogoProps) {
  const size = variants[variant];
  const [opaqueWarning, setOpaqueWarning] = useState(false);

  useEffect(() => {
    if (!showTransparencyWarning) return;
    checkLogoTransparency(LOGO_PATH).then((ok) => setOpaqueWarning(!ok));
  }, [showTransparencyWarning]);

  const image = (
    <Image
      src={LOGO_PATH}
      alt={`${SITE_NAME} — ${SITE_TAGLINE}`}
      width={size.width}
      height={size.height}
      className={cn(
        size.className,
        "bg-transparent",
        opaqueWarning && "logo-blend-fix rounded-sm",
        className
      )}
      style={{ objectFit: "contain" }}
      priority={priority || variant === "header"}
      quality={100}
      unoptimized
    />
  );

  const content = (
    <>
      {opaqueWarning && showTransparencyWarning && (
        <span
          className="absolute -bottom-5 left-0 z-10 hidden whitespace-nowrap text-[10px] font-medium text-amber-600 lg:block"
          role="status"
        >
          Şeffaf PNG yüklenmeli — geçici olarak arka plan gizlendi
        </span>
      )}
      {linked ? (
        <Link
          href="/"
          className="relative inline-flex shrink-0 items-center bg-transparent p-0"
          aria-label={`${SITE_NAME} ana sayfa`}
        >
          {image}
        </Link>
      ) : (
        <span className="relative inline-flex shrink-0 items-center bg-transparent">
          {image}
        </span>
      )}
    </>
  );

  return content;
}
