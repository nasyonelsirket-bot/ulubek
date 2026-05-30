import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";

export const LOGO_PATH = "/logo.png";

const variants = {
  header: { width: 240, height: 88, className: "h-12 w-auto md:h-14" },
  footer: { width: 220, height: 80, className: "h-11 w-auto" },
  admin: { width: 180, height: 66, className: "h-9 w-auto" },
  login: { width: 260, height: 96, className: "h-16 w-auto" },
  compact: { width: 160, height: 58, className: "h-8 w-auto" },
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

  const image = (
    <Image
      src={LOGO_PATH}
      alt={`${SITE_NAME} — ${SITE_TAGLINE}`}
      width={size.width}
      height={size.height}
      className={cn(size.className, className)}
      priority={priority || variant === "header"}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="inline-block shrink-0">
        {image}
      </Link>
    );
  }

  return image;
}
