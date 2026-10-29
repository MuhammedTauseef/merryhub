import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/admin-posts";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** The storage bucket created by supabase/blog.sql (public reads). */
const BUCKET = "blog-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Accepted image types → the extension we store them under. */
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Uploads ONE cover image to the blog-images bucket and returns its
 * public URL. Guarded exactly like every other admin route: the caller's
 * session token and admin email are verified server-side first, and only
 * then is the service-role key used to write to storage.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file was sent." }, { status: 400 });
  }
  const ext = IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "That file is not an image we can use — please choose a JPG, PNG or WebP." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is too large — the limit is 5 MB." },
      { status: 400 },
    );
  }

  const base = slugify(file.name.replace(/\.[^.]*$/, "")) || "image";
  const path = `${Date.now()}-${base}.${ext}`;

  const supabase = getServiceSupabase()!;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
