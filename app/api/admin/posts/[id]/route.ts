import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sanitizePostInput } from "@/lib/admin-posts";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ADMIN_COLUMNS =
  "id,slug,title,excerpt,category,target_keyword,direct_answer,hero_image,sections,faqs,related_links,status,published_at,created_at,updated_at";

type Ctx = { params: Promise<{ id: string }> };

/** One post (any status) for the editor. */
export async function GET(req: Request, { params }: Ctx) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ post: data });
}

/** Update a post. published_at is set on first publish and preserved after. */
export async function PUT(req: Request, { params }: Ctx) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const input = sanitizePostInput(await req.json().catch(() => null));
  if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });
  const supabase = getServiceSupabase()!;

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const published_at =
    input.status === "published" ? (existing.published_at ?? new Date().toISOString()) : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...input, published_at })
    .eq("id", id)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "That slug is already used by another post." : error.message },
      { status },
    );
  }
  return NextResponse.json({ post: data });
}

/** Delete a post permanently. */
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const supabase = getServiceSupabase()!;
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
