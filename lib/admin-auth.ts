import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminConfigured, isAdminEmail } from "@/lib/supabase";

/**
 * Server-side guard for every /api/admin route. NEVER trust the client:
 * the caller's Supabase access token (Authorization: Bearer …) is verified
 * against Supabase Auth, and the verified email must be on the ADMIN_EMAIL
 * allowlist. Returns the admin's email, or a ready NextResponse error.
 */
export async function requireAdmin(
  req: Request,
): Promise<{ email: string } | { error: NextResponse }> {
  if (!adminConfigured) {
    return {
      error: NextResponse.json(
        { error: "Admin is not configured (Supabase env vars missing)." },
        { status: 503 },
      ),
    };
  }
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.getUser(token);
  const email = data?.user?.email;
  if (error || !email) {
    return { error: NextResponse.json({ error: "Session invalid." }, { status: 401 }) };
  }
  if (!isAdminEmail(email)) {
    return { error: NextResponse.json({ error: "Not the admin account." }, { status: 403 }) };
  }
  return { email };
}
