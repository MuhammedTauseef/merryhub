import { getBrowserSupabase } from "@/lib/supabase";

/** A blog_posts row as the admin API returns it. */
export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  target_keyword: string;
  direct_answer: string;
  hero_image: string;
  sections: { h2: string; paragraphs?: string[]; bullets?: string[] }[];
  faqs: { q: string; a: string }[];
  related_links: { href: string; label: string }[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A products row as the admin API returns it. */
export interface AdminProduct {
  id: string;
  name: string;
  price_cents: number;
  whop_url: string;
  group_name: string;
  blurb: string;
  sort_order: number;
  visible: boolean;
  /** Gallery image URLs in display order; element 1 is the cover. */
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

/** Current session's access token, or null when signed out/unconfigured. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Calls an /api/admin route with the session token attached. The server
 * re-verifies the token and the admin email on every call — this helper is
 * only plumbing, never the security check.
 */
export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("signed-out");
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    if (res.status === 401) throw new Error("signed-out");
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return body;
}

/**
 * Uploads one cover image via /api/admin/upload (multipart, so it cannot
 * go through adminApi's JSON path) and returns its public URL.
 */
export async function adminUploadImage(file: File): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("signed-out");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    if (res.status === 401) throw new Error("signed-out");
    throw new Error(body.error ?? `Upload failed (${res.status})`);
  }
  if (!body.url) throw new Error("Upload failed — no URL returned.");
  return body.url;
}
