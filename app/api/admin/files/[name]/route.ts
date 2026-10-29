import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Admin-only download links for the paid pack files.
 * The PDFs live in the PRIVATE Supabase bucket `admin-files` (no public URL).
 * This route checks the caller is the signed-in admin, then returns a
 * short-lived signed URL (2 minutes) — enough to start the download, useless
 * to share. Buyers get the same files through Whop after payment.
 */
const FILES: Record<string, { path: string; label: string }> = {
  "full-pack": { path: "merryhub-printable-pack-full.pdf", label: "Full pack (55 pages)" },
  "editable-premium": { path: "merryhub-editable-premium-pack.pdf", label: "Editable Premium" },
};

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { name } = await params;
  const file = FILES[name];
  if (!file) {
    return NextResponse.json({ error: "Unknown file." }, { status: 404 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
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
