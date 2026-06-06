"use client";

import { useState } from "react";
import Image from "next/image";
import { generatePlaceholderCover } from "@/lib/ai-engine/placeholder-image";
import { cn } from "@/lib/utils";

interface ArticleImageProps {
  src?: string | null;
  alt: string;
  categorySlug?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ArticleImage({
  src,
  alt,
  categorySlug = "gundem",
  fill = true,
  className,
  sizes,
  priority = false,
}: ArticleImageProps) {
  const placeholder = generatePlaceholderCover(alt, categorySlug);
  const initialSrc = src?.trim() || placeholder;
  const [imageSrc, setImageSrc] = useState(initialSrc);

  const isDataUri = imageSrc.startsWith("data:");
  const isLocalMedia = imageSrc.startsWith("/api/media/");
  const isRemote = imageSrc.startsWith("http://") || imageSrc.startsWith("https://");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      quality={90}
      unoptimized={isDataUri || isLocalMedia || isRemote}
      className={cn("object-cover transition-transform duration-300", className)}
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
      onError={() => {
        if (imageSrc !== placeholder) setImageSrc(placeholder);
      }}
    />
  );
}
