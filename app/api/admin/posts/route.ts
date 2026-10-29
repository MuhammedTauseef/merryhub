import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sanitizePostInput } from "@/lib/admin-posts";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ADMIN_COLUMNS =
  "id,slug,title,excerpt,category,target_keyword,direct_answer,hero_image,sections,faqs,related_links,status,published_at,created_at,updated_at";

/** List ALL posts (drafts + published) for the admin panel. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_COLUMNS)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

/** Create a post. Sets published_at the first time it is published. */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const input = sanitizePostInput(await req.json().catch(() => null));
  if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...input,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select(ADMIN_COLUMNS)
    .single();
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "That slug is already used by another post." : error.message },
      { status },
    );
  }
  return NextResponse.json({ post: data }, { status: 201 });
}
