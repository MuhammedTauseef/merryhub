import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sanitizeProductInput, sanitizeProductPatch } from "@/lib/admin-products";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ADMIN_COLUMNS =
  "id,name,price_cents,whop_url,group_name,blurb,sort_order,visible,image_urls,file_name,created_at,updated_at";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** List ALL products (visible + hidden) for the admin panel. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

/** Create a product. When sort_order is not sent, the product goes to
 *  the end of its group (max sort_order in the group + 10). */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const input = sanitizeProductInput(body);
  if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });
  const supabase = getServiceSupabase()!;

  if (!(body && typeof body === "object" && "sort_order" in body)) {
    const { data: last } = await supabase
      .from("products")
      .select("sort_order")
      .eq("group_name", input.group_name)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    input.sort_order = (last?.sort_order ?? 0) + 10;
  }

  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}

/** Update any field(s) of one product — body: { id, ...fields }.
 *  A partial patch is fine (e.g. just { id, visible: false }). */
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const id =
    body && typeof body === "object" ? (body as Record<string, unknown>).id : undefined;
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "A valid product id is required." }, { status: 400 });
  }
  const patch = sanitizeProductPatch(body);
  if ("error" in patch) return NextResponse.json({ error: patch.error }, { status: 400 });
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "Product not found." : error.message },
      { status },
    );
  }
  return NextResponse.json({ product: data });
}

/** Delete a product permanently — body: { id } (or ?id=…).
 *  This removes the product from THIS WEBSITE only; the product on
 *  Whop is not changed. */
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => null);
  const fromBody =
    body && typeof body === "object" ? (body as Record<string, unknown>).id : undefined;
  const id = typeof fromBody === "string" ? fromBody : new URL(req.url).searchParams.get("id");
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "A valid product id is required." }, { status: 400 });
  }
  const supabase = getServiceSupabase()!;
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
