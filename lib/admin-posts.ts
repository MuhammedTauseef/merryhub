import type { FaqItem } from "@/components/Faq";
import type { PostRelatedLink, PostSection } from "@/lib/posts";

/** "What to Write in a Christmas Card!" → "what-to-write-in-a-christmas-card" */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  target_keyword: string;
  direct_answer: string;
  hero_image: string;
  sections: PostSection[];
  faqs: FaqItem[];
  related_links: PostRelatedLink[];
  status: "draft" | "published";
}

/**
 * Validates and normalises the editor's payload for a create/update.
 * Returns the row to store, or an error message. Anything not matching the
 * shape is dropped rather than trusted.
 */
export function sanitizePostInput(body: unknown): PostInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid payload." };
  const b = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const title = str(b.title);
  if (!title) return { error: "Title is required." };
  const slug = slugify(str(b.slug) || title);
  if (!slug) return { error: "Slug is required." };

  const sections: PostSection[] = Array.isArray(b.sections)
    ? (b.sections as PostSection[])
        .filter((s) => s && typeof s.h2 === "string" && s.h2.trim())
        .map((s) => ({
          h2: s.h2.trim(),
          paragraphs: Array.isArray(s.paragraphs)
            ? s.paragraphs.filter((p): p is string => typeof p === "string" && p.trim() !== "")
            : undefined,
          bullets: Array.isArray(s.bullets)
            ? s.bullets.filter((x): x is string => typeof x === "string" && x.trim() !== "")
            : undefined,
        }))
    : [];

  const faqs: FaqItem[] = Array.isArray(b.faqs)
    ? (b.faqs as FaqItem[])
        .filter((f) => f && typeof f.q === "string" && typeof f.a === "string" && f.q.trim() && f.a.trim())
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
    : [];

  const related_links: PostRelatedLink[] = Array.isArray(b.related_links)
    ? (b.related_links as PostRelatedLink[])
        .filter(
          (l) =>
            l && typeof l.href === "string" && typeof l.label === "string" &&
            l.href.startsWith("/") && l.label.trim(),
        )
        .map((l) => ({ href: l.href.trim(), label: l.label.trim() }))
    : [];

  // Cover image: only a full http(s) URL (as returned by the upload
  // route) or empty — anything else is dropped rather than trusted.
  const heroRaw = str(b.hero_image).slice(0, 1000);
  const hero_image = /^https?:\/\//i.test(heroRaw) ? heroRaw : "";

  return {
    slug,
    title,
    excerpt: str(b.excerpt).slice(0, 300),
    category: str(b.category) || "Guides",
    target_keyword: str(b.target_keyword),
    direct_answer: str(b.direct_answer),
    hero_image,
    sections,
    faqs,
    related_links,
    status: b.status === "published" ? "published" : "draft",
  };
}
