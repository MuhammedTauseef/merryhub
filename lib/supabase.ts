import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase wiring for the MerryHub blog (the site's only database feature).
 *
 * Env contract (see ADMIN-SETUP.md):
 * - NEXT_PUBLIC_SUPABASE_URL       — project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY  — anon key: public reads (RLS allows
 *   SELECT on published posts only) + the admin login session
 * - SUPABASE_SERVICE_ROLE_KEY      — server-only key used by the admin API
 *   routes AFTER the caller's session and admin email have been verified;
 *   never exposed to the browser
 * - ADMIN_EMAIL                    — the single admin's email (allowlist,
 *   comma-separated if ever more than one)
 *
 * When the public env vars are absent the whole blog degrades gracefully:
 * clients come back null, reads return empty, and the rest of the site is
 * completely unaffected.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(URL && ANON_KEY);
export const adminConfigured = Boolean(URL && ANON_KEY && SERVICE_ROLE_KEY);

let browserClient: SupabaseClient | null = null;

/** Browser client (admin login + session). Null when not configured. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!browserClient) browserClient = createClient(URL!, ANON_KEY!);
  return browserClient;
}

let anonClient: SupabaseClient | null = null;

/** Server-side anon client for public reads of published posts. */
export function getAnonSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!anonClient) {
    anonClient = createClient(URL!, ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anonClient;
}

let serviceClient: SupabaseClient | null = null;

/** Server-only service-role client. Bypasses RLS, so it must ONLY be used
 *  in admin API routes after requireAdmin() has verified the caller. */
export function getServiceSupabase(): SupabaseClient | null {
  if (!adminConfigured) return null;
  if (!serviceClient) {
    serviceClient = createClient(URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

/** The admin email allowlist (ADMIN_EMAIL, comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
