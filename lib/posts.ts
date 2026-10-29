import type { FaqItem } from "@/components/Faq";
import { getAnonSupabase } from "@/lib/supabase";

/**
 * The MerryHub blog's data layer. Posts live in the Supabase `blog_posts`
 * table (see supabase/blog.sql) and are managed from the /admin panel —
 * publishing in admin goes live on the public site with NO redeploy (the
 * blog pages revalidate every 60 seconds).
 *
 * If the Supabase env vars are absent, every read returns empty and the
 * blog shows its graceful empty state; the rest of the site never notices.
 *
 * Content rules for anything published (the house SEO/AEO/GEO standard):
 * excerpt ≤160 chars and unique; direct_answer 40–60 words; exactly 5 real
 * FAQs (the same data renders visibly and as FAQPage schema); original,
 * researched writing only — never copied.
 */
export interface PostSection {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface PostRelatedLink {
  href: string;
  label: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Card excerpt AND meta description (≤160 characters). */
  excerpt: string;
  /** ISO publish date, YYYY-MM-DD. */
  date: string;
  category: string;
  /** The researched target keyword this article was written for. */
  keyword: string;
  /** 40–60 word direct answer, rendered near the top of the article. */
  directAnswer: string;
  /** Cover image URL (Supabase blog-images bucket); "" when none set. */
  heroImage: string;
  sections: PostSection[];
  /** Exactly 5 — rendered visibly AND as FAQPage JSON-LD from this data. */
  faqs: FaqItem[];
  /** Internal links to the tool pages this article points readers to. */
  relatedLinks: PostRelatedLink[];
}

interface PostRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  target_keyword: string;
  direct_answer: string;
  hero_image: string | null;
  sections: PostSection[] | null;
  faqs: FaqItem[] | null;
  related_links: PostRelatedLink[] | null;
  published_at: string | null;
  created_at: string;
}

const POST_COLUMNS =
  "slug,title,excerpt,category,target_keyword,direct_answer,hero_image,sections,faqs,related_links,published_at,created_at";

function rowToPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: (row.published_at ?? row.created_at).slice(0, 10),
    category: row.category,
    keyword: row.target_keyword,
    directAnswer: row.direct_answer,
    heroImage: row.hero_image ?? "",
    sections: Array.isArray(row.sections) ? row.sections : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    relatedLinks: Array.isArray(row.related_links) ? row.related_links : [],
  };
}

/** All published posts, newest first. Empty when unconfigured or on error. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = getAnonSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return (data as PostRow[]).map(rowToPost);
}

/** One published post by slug. Undefined when missing/unconfigured. */
export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const supabase = getAnonSupabase();
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToPost(data as PostRow);
}

/** "2026-11-03" → "3 November 2026", in UTC so the server render and the
 *  reader always see the same date. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
