import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { loadPrintables } from "@/lib/products";
import { productSlug } from "@/lib/product-details";
import { SITE_URL } from "@/lib/site";
import { WISH_CATEGORIES } from "@/lib/wishes";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/countdown", priority: 0.9, changeFrequency: "daily" },
    { path: "/card-maker", priority: 0.95, changeFrequency: "weekly" },
    { path: "/wishes", priority: 0.9, changeFrequency: "weekly" },
    { path: "/elf-name-generator", priority: 0.85, changeFrequency: "weekly" },
    { path: "/christmas-quiz", priority: 0.85, changeFrequency: "weekly" },
    { path: "/printables", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "monthly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "monthly" },
  ];
  const wishRoutes = WISH_CATEGORIES.map((c) => ({
    path: `/wishes/${c.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));
  // Published blog posts from Supabase; empty when the blog is not
  // configured yet (the /blog index above is always listed).
  const postRoutes = (await getAllPosts()).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  // Individual product pages (same products table as /printables;
  // loadPrintables falls back to the built-in list if the read fails).
  const { groups } = await loadPrintables();
  const productRoutes = groups.flatMap((g) =>
    g.products.map((p) => ({
      url: `${SITE_URL}/printables/${productSlug(p.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );
  return [
    ...[...staticRoutes, ...wishRoutes].map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...productRoutes,
    ...postRoutes,
  ];
}
