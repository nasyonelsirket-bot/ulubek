"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export const LOGO_PATH = "/logo.png";

const variants = {
  header: {
    width: 320,
    height: 70,
    className:
      "h-[52px] w-auto max-w-[min(220px,55vw)] object-contain sm:h-[58px] sm:max-w-[260px] md:h-[64px] md:max-w-[300px] lg:h-[70px] lg:max-w-[340px]",
  },
  footer: {
    width: 280,
    height: 62,
    className: "h-12 w-auto max-w-[240px] object-contain md:h-14 md:max-w-[280px]",
  },
  admin: {
    width: 200,
    height: 48,
    className: "h-10 w-auto max-w-[180px] object-contain",
  },
  login: {
    width: 320,
    height: 70,
    className: "h-16 w-auto max-w-[300px] object-contain md:h-[70px] md:max-w-[340px]",
  },
  compact: {
    width: 180,
    height: 40,
    className: "h-9 w-auto max-w-[160px] object-contain",
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
        "bg-transparent dark:brightness-[2.2] dark:contrast-[1.05]",
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
          Logo dosyası şeffaf değil, yeni PNG yüklenmeli
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
