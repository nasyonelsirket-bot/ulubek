"use client";

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
  const imageSrc = src?.trim() || generatePlaceholderCover(alt, categorySlug);
  const isDataUri = imageSrc.startsWith("data:");
  const isLocalMedia = imageSrc.startsWith("/api/media/");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      quality={90}
      unoptimized={isDataUri || isLocalMedia}
      className={cn("object-cover transition-transform duration-300", className)}
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
    />
  );
}
