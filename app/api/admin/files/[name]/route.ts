import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Admin-only download links for the paid files.
 * The PDFs live in the PRIVATE Supabase bucket `admin-files` (no public URL).
 * This route checks the caller is the signed-in admin, then returns a
 * short-lived signed URL (2 minutes) — enough to start the download, useless
 * to share. Buyers get the same files through Whop after payment.
 *
 * Two kinds of name are served:
 *  - the two pack shortcuts below ("full-pack", "editable-premium") —
 *    unchanged from the original route;
 *  - a product PDF file name (e.g. "merryhub-games-bundle.pdf") — served
 *    ONLY when that exact name is currently stored in `products.file_name`
 *    for some product. The products table IS the allowlist: there is no
 *    second hardcoded list to drift out of date, and removing a product
 *    (or clearing its file_name in the admin form) revokes its download
 *    here immediately. Hidden products are included on purpose — this is
 *    the admin's own copy — which is why the lookup uses the service-role
 *    client (it bypasses the storefront's visible-only RLS).
 */
const PACK_FILES: Record<string, { path: string; label: string }> = {
  "full-pack": { path: "merryhub-printable-pack-full.pdf", label: "Full pack (55 pages)" },
  "editable-premium": { path: "merryhub-editable-premium-pack.pdf", label: "Editable Premium" },
};

/** A product PDF file name as stored on products.file_name: a bare
 *  `.pdf` name — no folders, no traversal, no leading dot, no "..".
 *  Anything else is refused before the database is even asked (and a
 *  name that passes this shape but is stored on no product is a 404). */
const PRODUCT_FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.pdf$/;

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { name } = await params;

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let file = PACK_FILES[name];
  if (!file) {
    if (!PRODUCT_FILE_RE.test(name) || name.includes("..")) {
      return NextResponse.json({ error: "Unknown file." }, { status: 404 });
    }
    const { data, error } = await supabase
      .from("products")
      .select("name")
      .eq("file_name", name)
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      return NextResponse.json({ error: "Unknown file." }, { status: 404 });
    }
    file = { path: name, label: data.name };
  }

  const { data, error } = await supabase.storage
    .from("admin-files")
    .createSignedUrl(file.path, 120);
  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: `Could not create the download link (${error?.message ?? "no URL"}).` },
      { status: 502 },
    );
  }
  return NextResponse.json({ url: data.signedUrl, label: file.label });
}
