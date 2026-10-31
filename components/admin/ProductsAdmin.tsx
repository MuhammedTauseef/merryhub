"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminProduct } from "@/components/admin/api";
import { PRODUCT_GROUPS } from "@/lib/admin-products";

/** 700 → "$7"; 750 → "$7.50" (display copy of lib/products' formatPrice,
 *  kept local so this client component does not import the server
 *  data layer). */
function priceText(priceCents: number): string {
  const dollars = priceCents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** 700 → "7"; 750 → "7.5" — the price field's editable text. */
function centsToField(priceCents: number): string {
  return (priceCents / 100).toFixed(2).replace(/\.?0+$/, "");
}

/**
 * The Products section of /admin: every product on /printables, with
 * edit / add / delete and a visibility toggle. All calls go through
 * /api/admin/products, which re-verifies the admin session server-side.
 * Deleting here removes the product from THIS WEBSITE only — the Whop
 * product itself is never touched.
 */
export default function ProductsAdmin() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  // One form serves both Add and Edit; editingId === null means Add.
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [whopUrl, setWhopUrl] = useState("");
  const [groupName, setGroupName] = useState<string>(PRODUCT_GROUPS[0]);
  const [blurb, setBlurb] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [visible, setVisible] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { products } = await adminApi<{ products: AdminProduct[] }>("/api/admin/products");
      setProducts(products);
      setError("");
    } catch (err) {
      if (err instanceof Error && err.message === "signed-out") {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  function openAdd() {
    setEditingId(null);
    setName("");
    setPrice("");
    setWhopUrl("");
    setGroupName(PRODUCT_GROUPS[0]);
    setBlurb("");
    setSortOrder("");
    setVisible(true);
    setNotice("");
    setFormOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(centsToField(product.price_cents));
    setWhopUrl(product.whop_url);
    setGroupName(product.group_name);
    setBlurb(product.blurb);
    setSortOrder(String(product.sort_order));
    setVisible(product.visible);
    setNotice("");
    setFormOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload: Record<string, unknown> = {
      name,
      price,
      whop_url: whopUrl,
      group_name: groupName,
      blurb,
      visible,
    };
    if (sortOrder.trim() !== "") payload.sort_order = Number(sortOrder);
    try {
      if (editingId) {
        await adminApi("/api/admin/products", {
          method: "PATCH",
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        setNotice(`Saved “${name}” — /printables is updated straight away.`);
      } else {
        await adminApi("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice(`Added “${name}” — it is live on /printables now.`);
      }
      setFormOpen(false);
      setEditingId(null);
      await load();
    } catch (err) {
      if (err instanceof Error && err.message === "signed-out") {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Delete “${product.name}” from this website?\n\n` +
        "This removes the product from this website only. The product on Whop is not changed — delete it on Whop separately if needed.",
    );
    if (!confirmed) return;
    try {
      await adminApi("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id: product.id }),
      });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setNotice(`Deleted “${product.name}” from the website. Its Whop product was not changed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="mt-24">
      <div className="admin-actions" style={{ marginBottom: 16 }}>
        <button type="button" className="btn btn-gold" onClick={openAdd}>
          + Add product
        </button>
        <a
          className="btn btn-outline-dark"
          href="https://whop.com/merryhub/products"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the Whop store ↗
        </a>
      </div>

      <p className="hint" style={{ marginTop: 0 }}>
        These are the products shown on <strong>/printables</strong>. Editing a price, blurb or
        link here updates the website straight away — the price and product on Whop itself are
        changed on Whop. Hide a product to remove its card without deleting it.
      </p>

      {notice && (
        <p role="status" style={{ color: "var(--green-700)", fontWeight: 600 }}>
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--red-600)", fontWeight: 600 }}>
          {error}
        </p>
      )}

      {formOpen && (
        <form className="panel mt-24" onSubmit={onSave}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit product" : "Add product"}</h3>
          <div className="field">
            <label htmlFor="p-name">Name</label>
            <input
              id="p-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Complete Christmas Bundle"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="p-price">Price (US dollars)</label>
            <input
              id="p-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="7"
              required
            />
            <p className="hint">The price shown on the website card — keep it the same as the price on Whop.</p>
          </div>
          <div className="field">
            <label htmlFor="p-whop">Whop product URL</label>
            <input
              id="p-whop"
              type="text"
              value={whopUrl}
              onChange={(e) => setWhopUrl(e.target.value)}
              placeholder="https://whop.com/merryhub/products/…"
              required
            />
            <p className="hint">The card&apos;s Buy button sends buyers to this exact Whop page.</p>
          </div>
          <div className="field">
            <label htmlFor="p-group">Group (section on /printables)</label>
            <select
              id="p-group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            >
              {PRODUCT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-blurb">Blurb (the card&apos;s one-line description)</label>
            <textarea
              id="p-blurb"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={2}
            />
          </div>
          <div className="field">
            <label htmlFor="p-sort">Sort order (position inside the group)</label>
            <input
              id="p-sort"
              type="text"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="Auto — end of the group"
            />
            <p className="hint">Lower numbers come first. Leave blank on a new product to put it last in its group.</p>
          </div>
          <div className="field">
            <label htmlFor="p-visible" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                id="p-visible"
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
              Visible on /printables
            </label>
            <p className="hint">Untick to hide the card without deleting the product.</p>
          </div>
          <div className="admin-actions">
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="hint mt-24">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="hint mt-24">
          No products found. If the database seed has not run yet, /printables keeps showing its
          built-in list — run supabase/products-table.sql, then reload this page.
        </p>
      ) : (
        <div className="panel mt-24" style={{ padding: 0, overflow: "hidden" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Group</th>
                <th>Visible</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    {product.blurb && (
                      <>
                        <br />
                        <span className="hint">{product.blurb}</span>
                      </>
                    )}
                  </td>
                  <td>{priceText(product.price_cents)}</td>
                  <td>{product.group_name}</td>
                  <td>
                    <span
                      className={`status-pill ${product.visible ? "status-published" : "status-draft"}`}
                    >
                      {product.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>{new Date(product.updated_at).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div className="admin-actions">
                      <a
                        className="btn btn-small btn-outline-dark"
                        href={product.whop_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open on Whop ↗
                      </a>
                      <button
                        type="button"
                        className="btn btn-small btn-green"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-red"
                        onClick={() => void onDelete(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
