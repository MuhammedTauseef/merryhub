import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface PageMetaInput {
  /** Route path, e.g. "/countdown". Used for the canonical URL and OG URL. */
  path: string;
  /** Page <title> (without the "| MerryHub" template suffix). */
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Optional share image URL. When omitted, the site-wide default
   *  (app/opengraph-image) is used, exactly as before. */
  image?: string;
  /** When true, `title` is used verbatim (no "| MerryHub" suffix). */
  absoluteTitle?: boolean;
  /** OpenGraph type; "article" for blog posts. Defaults to "website". */
  ogType?: "website" | "article";
}

/**
 * Builds complete, consistent metadata for a page: canonical URL,
 * per-page OpenGraph and per-page Twitter card (so inner pages no longer
 * fall back to the site-wide defaults).
 */
export function pageMetadata({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  absoluteTitle,
  ogType,
}: PageMetaInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: ogType ?? "website",
      siteName: SITE_NAME,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      url,
      // Always emit a share image: pages without their own cover use the
      // site-wide generated image. (Next only auto-attaches the
      // opengraph-image file convention to the homepage; inner pages that
      // set their own openGraph would otherwise ship with no og:image.)
      images: [{ url: image ?? `${SITE_URL}/opengraph-image`, alt: ogTitle ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [image ?? `${SITE_URL}/opengraph-image`],
    },
  };
}
