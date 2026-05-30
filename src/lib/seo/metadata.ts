import type { Metadata } from "next";
import {
  getSiteUrl,
  getTwitterHandle,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
} from "./config";

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function defaultOgImage() {
  return {
    url: absoluteUrl("/logo.png"),
    width: 1200,
    height: 630,
    alt: SITE_NAME,
  };
}

export function getDefaultMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const twitterHandle = getTwitterHandle();
  const ogImage = defaultOgImage();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} — Son Dakika Haberleri`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: siteUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [ogImage.url],
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export interface PageMetadataInput {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const desc = description || SITE_DESCRIPTION;
  const ogImage = defaultOgImage();
  const twitterHandle = getTwitterHandle();

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage.url],
      ...(twitterHandle ? { site: twitterHandle } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export interface ArticleMetadataInput {
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  excerpt?: string | null;
  image?: string | null;
  publishedAt: Date;
  updatedAt: Date;
  categoryName: string;
  tags: string[];
}

export function buildArticleMetadata(article: ArticleMetadataInput): Metadata {
  const url = absoluteUrl(`/haber/${article.slug}`);
  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || undefined;
  const twitterHandle = getTwitterHandle();

  const images = article.image
    ? [{ url: article.image, alt: title }]
    : [defaultOgImage()];

  return {
    title,
    description,
    keywords: article.tags.length > 0 ? article.tags : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.categoryName,
      tags: article.tags.length > 0 ? article.tags : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((img) => img.url),
      ...(twitterHandle ? { site: twitterHandle } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
