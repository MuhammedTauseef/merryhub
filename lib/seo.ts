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
  /** When true, `title` is used verbatim (no "| MerryHub" suffix). */
  absoluteTitle?: boolean;
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
  absoluteTitle,
}: PageMetaInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description: ogDescription ?? description,
    },
  };
}
