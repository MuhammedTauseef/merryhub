/** The three /printables sections a product can belong to — the same
 *  titles PRODUCT_GROUP_META renders in lib/products.ts. Constraining
 *  group_name to this list means an admin typo can never orphan a
 *  product into a section the storefront does not render. */
export const PRODUCT_GROUPS = [
  "Christmas Bundles",
  "All-Year Printables",
  "Small Packs — $2–$3",
] as const;

export interface ProductInput {
  name: string;
  price_cents: number;
  whop_url: string;
  group_name: string;
  blurb: string;
  sort_order: number;
  visible: boolean;
  /** Gallery image URLs in display order; element 1 is the cover.
   *  Empty = the card renders with no image, exactly as before. */
  image_urls: string[];
  /** The product PDF's file name in the PRIVATE Supabase bucket
   *  `admin-files` — the admin panel's private Download copy. Empty =
   *  no file linked yet. Admin-only: never sent to the storefront. */
  file_name: string;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** "7", "$7", "7.50" → 700 / 750. Null when not a usable price. */
function parsePriceToCents(body: Record<string, unknown>): number | null {
  if (typeof body.price_cents === "number" && Number.isFinite(body.price_cents)) {
    return Math.round(body.price_cents);
  }
  const raw = str(body.price).replace(/^\$/, "").replace(/,/g, "");
  if (!raw) return null;
  const dollars = Number(raw);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

/** Any https URL — gallery images live in the site's Supabase storage,
 *  but the admin may paste any secure image link. */
function isHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

/** The gallery: an optional list of https image URLs, at most 6,
 *  display order preserved, blanks dropped. */
function parseImageUrls(body: Record<string, unknown>): string[] | { error: string } {
  const raw = body.image_urls;
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) return { error: "Gallery images must be a list of URLs." };
  const urls = raw
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u !== "");
  if (urls.length > 6) return { error: "A gallery can hold at most 6 images." };
  for (const u of urls) {
    if (u.length > 1000 || !isHttpsUrl(u)) {
      return { error: "Every gallery image must be an https:// URL." };
    }
  }
  return urls;
}

/** An https URL on whop.com (or a subdomain) — nothing else is a
 *  product link the storefront may send buyers to. */
function isWhopUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      (url.hostname === "whop.com" || url.hostname.endsWith(".whop.com"))
    );
  } catch {
    return false;
  }
}

/** A product PDF's file name in the private `admin-files` bucket: a
 *  bare `.pdf` name — it must END in `.pdf` and contain NO slashes (no
 *  folders, no traversal, no leading dot, no ".."). The empty string
 *  is valid and means "no file linked yet" (the Download button is
 *  then disabled). Mirrors PRODUCT_FILE_RE in the files route. */
const PRODUCT_FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.pdf$/;

function parseFileName(raw: unknown): string | { error: string } {
  const name = str(raw).slice(0, 200);
  if (name === "") return "";
  if (!PRODUCT_FILE_RE.test(name) || name.includes("..")) {
    return {
      error:
        "The PDF file name must be a plain .pdf file name with no folders — e.g. merryhub-games-bundle.pdf.",
    };
  }
  return name;
}

/**
 * Validates and normalises the admin payload for a product CREATE.
 * Returns the full row to store, or an error message. Anything not
 * matching the shape is dropped rather than trusted (same rule as
 * sanitizePostInput for blog posts).
 */
export function sanitizeProductInput(body: unknown): ProductInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid payload." };
  const b = body as Record<string, unknown>;

  const name = str(b.name).slice(0, 120);
  if (!name) return { error: "Name is required." };

  const price_cents = parsePriceToCents(b);
  if (price_cents === null || price_cents < 0) {
    return { error: "A valid price is required (e.g. 3 or 3.50)." };
  }

  const whop_url = str(b.whop_url).slice(0, 1000);
  if (!whop_url) return { error: "The Whop product URL is required." };
  if (!isWhopUrl(whop_url)) {
    return { error: "The Whop URL must be an https://whop.com link." };
  }

  const groupRaw = str(b.group_name);
  const group_name = (PRODUCT_GROUPS as readonly string[]).includes(groupRaw)
    ? groupRaw
    : PRODUCT_GROUPS[0];
  if (groupRaw && group_name !== groupRaw) {
    return { error: `Group must be one of: ${PRODUCT_GROUPS.join(", ")}.` };
  }

  const sort_order =
    typeof b.sort_order === "number" && Number.isFinite(b.sort_order)
      ? Math.round(b.sort_order)
      : 0;

  const image_urls = parseImageUrls(b);
  if (!Array.isArray(image_urls)) return image_urls;

  const file_name = parseFileName(b.file_name);
  if (typeof file_name !== "string") return file_name;

  return {
    name,
    price_cents,
    whop_url,
    group_name,
    blurb: str(b.blurb).slice(0, 300),
    sort_order,
    visible: typeof b.visible === "boolean" ? b.visible : true,
    image_urls,
    file_name,
  };
}

/**
 * Validates a PATCH payload: only the fields actually present are
 * checked and returned, so the admin can flip `visible` (or fix one
 * field) without resending the whole product. Requires at least one
 * updatable field besides the id.
 */
export function sanitizeProductPatch(
  body: unknown,
): Partial<ProductInput> | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid payload." };
  const b = body as Record<string, unknown>;
  const patch: Partial<ProductInput> = {};

  if ("name" in b) {
    const name = str(b.name).slice(0, 120);
    if (!name) return { error: "Name cannot be empty." };
    patch.name = name;
  }
  if ("price" in b || "price_cents" in b) {
    const price_cents = parsePriceToCents(b);
    if (price_cents === null || price_cents < 0) {
      return { error: "A valid price is required (e.g. 3 or 3.50)." };
    }
    patch.price_cents = price_cents;
  }
  if ("whop_url" in b) {
    const whop_url = str(b.whop_url).slice(0, 1000);
    if (!whop_url) return { error: "The Whop product URL cannot be empty." };
    if (!isWhopUrl(whop_url)) {
      return { error: "The Whop URL must be an https://whop.com link." };
    }
    patch.whop_url = whop_url;
  }
  if ("group_name" in b) {
    const group_name = str(b.group_name);
    if (!(PRODUCT_GROUPS as readonly string[]).includes(group_name)) {
      return { error: `Group must be one of: ${PRODUCT_GROUPS.join(", ")}.` };
    }
    patch.group_name = group_name;
  }
  if ("blurb" in b) patch.blurb = str(b.blurb).slice(0, 300);
  if ("sort_order" in b) {
    if (typeof b.sort_order !== "number" || !Number.isFinite(b.sort_order)) {
      return { error: "Sort order must be a number." };
    }
    patch.sort_order = Math.round(b.sort_order);
  }
  if ("visible" in b) {
    if (typeof b.visible !== "boolean") return { error: "Visible must be true or false." };
    patch.visible = b.visible;
  }
  if ("image_urls" in b) {
    const image_urls = parseImageUrls(b);
    if (!Array.isArray(image_urls)) return image_urls;
    patch.image_urls = image_urls;
  }
  if ("file_name" in b) {
    const file_name = parseFileName(b.file_name);
    if (typeof file_name !== "string") return file_name;
    patch.file_name = file_name;
  }

  if (Object.keys(patch).length === 0) return { error: "Nothing to update." };
  return patch;
}
