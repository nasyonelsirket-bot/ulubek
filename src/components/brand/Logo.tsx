"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export const LOGO_PATH = "/logo.png";

const variants = {
  header: { width: 520, height: 120, className: "logo-wrap" },
  footer: { width: 320, height: 72, className: "h-14 w-auto object-contain md:h-16" },
  admin: { width: 220, height: 52, className: "h-11 w-auto object-contain" },
  login: { width: 480, height: 120, className: "h-24 w-auto object-contain md:h-28" },
  compact: { width: 200, height: 48, className: "h-10 w-auto object-contain" },
} as const;

interface LogoProps {
  variant?: keyof typeof variants;
  linked?: boolean;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  variant = "header",
  linked = true,
  className,
  priority = false,
}: LogoProps) {
  const size = variants[variant];
  const [opaqueWarning, setOpaqueWarning] = useState(false);

  useEffect(() => {
    if (variant !== "header") return;
    const img = document.createElement("img");
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 32, 32);
        const { data } = ctx.getImageData(0, 0, 32, 32);
        let transparent = 0;
        for (const i of [0, 31, 992, 1023]) {
          if (data[i * 4 + 3] < 200) transparent++;
        }
        setOpaqueWarning(transparent < 2);
      } catch { /* ignore */ }
    };
    img.src = LOGO_PATH;
  }, [variant]);

  const image = (
    <Image
      src={LOGO_PATH}
      alt={`${SITE_NAME} — ${SITE_TAGLINE}`}
      width={size.width}
      height={size.height}
      className={cn(
        variant === "header" ? "h-full w-auto max-w-none object-contain" : size.className,
        opaqueWarning && variant === "header" && "logo-blend-fix",
        className
      )}
      style={{ objectFit: "contain" }}
      priority={priority || variant === "header"}
      quality={100}
      unoptimized
    />
  );

  const inner = variant === "header" ? <span className={cn("logo-wrap", className)}>{image}</span> : image;

  if (linked) {
    return (
      <Link href="/" className="relative inline-flex shrink-0 items-center bg-transparent" aria-label={`${SITE_NAME} ana sayfa`}>
        {inner}
      </Link>
    );
  }

  return <span className="relative inline-flex shrink-0 items-center">{inner}</span>;
}
