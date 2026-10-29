import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { WISH_CATEGORIES } from "@/lib/wishes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/countdown", priority: 0.9, changeFrequency: "daily" },
    { path: "/card-maker", priority: 0.95, changeFrequency: "weekly" },
    { path: "/wishes", priority: 0.9, changeFrequency: "weekly" },
    { path: "/elf-name-generator", priority: 0.85, changeFrequency: "weekly" },
    { path: "/christmas-quiz", priority: 0.85, changeFrequency: "weekly" },
    { path: "/printables", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  ];
  const wishRoutes = WISH_CATEGORIES.map((c) => ({
    path: `/wishes/${c.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));
  return [...staticRoutes, ...wishRoutes].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
