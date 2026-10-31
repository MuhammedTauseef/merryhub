"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi, type AdminPost } from "@/components/admin/api";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase";

export default function AdminHomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { posts } = await adminApi<{ posts: AdminPost[] }>("/api/admin/posts");
      setPosts(posts);
      setError("");
    } catch (err) {
      if (err instanceof Error && err.message === "signed-out") {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (supabaseConfigured) void load();
    else setLoading(false);
  }, [load]);

  async function onDelete(post: AdminPost) {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    try {
      await adminApi(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function onSignOut() {
    await getBrowserSupabase()?.auth.signOut();
    router.replace("/admin/login");
  }

  async function onDownloadPack(name: "full-pack" | "editable-premium") {
    try {
      const { url } = await adminApi<{ url: string }>(`/api/admin/files/${name}`);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    }
  }

  return (
    <section className="page-body">
      <div className="wrap">
        <div className="admin-bar">
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>Blog posts</h1>
          <div className="admin-actions">
            <Link href="/admin/blog/new" className="btn btn-gold">
              + New post
            </Link>
            <button type="button" className="btn btn-outline-dark" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>

        {supabaseConfigured && (
          <div className="panel mt-24">
            <h2 style={{ marginTop: 0, fontSize: "1.15rem" }}>Pack files — admin only</h2>
            <p className="hint" style={{ marginTop: 0 }}>
              Your private copies of the paid pack. These buttons work only while you are
              signed in as the admin — the files have no public link. Buyers get the same
              files from Whop after payment.
            </p>
            <div className="admin-actions">
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => void onDownloadPack("full-pack")}
              >
                ⬇ Full pack (55 pages)
              </button>
              <button
                type="button"
                className="btn btn-green"
                onClick={() => void onDownloadPack("editable-premium")}
              >
                ⬇ Editable Premium
              </button>
            </div>
          </div>
        )}

        {!supabaseConfigured ? (
          <p className="hint mt-24">
            The admin panel is not configured yet. Set the Supabase env vars first (see
            ADMIN-SETUP.md in the project).
          </p>
        ) : loading ? (
          <p className="hint mt-24">Loading posts…</p>
        ) : error ? (
          <p role="alert" style={{ color: "var(--red-600)", fontWeight: 600 }} className="mt-24">
            {error}
          </p>
        ) : posts.length === 0 ? (
          <p className="hint mt-24">
            No posts yet. Click “New post” to write the first one — drafts stay invisible until
            you publish them.
          </p>
        ) : (
          <div className="panel mt-24" style={{ padding: 0, overflow: "hidden" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <strong>{post.title}</strong>
                      <br />
                      <span className="hint">/blog/{post.slug}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-${post.status}`}>{post.status}</span>
                    </td>
                    <td>{new Date(post.updated_at).toLocaleDateString("en-GB")}</td>
                    <td>
                      <div className="admin-actions">
                        {post.status === "published" && (
                          <Link href={`/blog/${post.slug}`} className="btn btn-small btn-outline-dark">
                            View
                          </Link>
                        )}
                        <Link href={`/admin/blog/${post.id}`} className="btn btn-small btn-green">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-small btn-red"
                          onClick={() => void onDelete(post)}
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

        {supabaseConfigured && (
          <>
            <div className="admin-bar mt-40">
              <h2 style={{ margin: 0, fontSize: "1.35rem" }}>Products</h2>
            </div>
            <ProductsAdmin />
          </>
        )}
      </div>
    </section>
  );
}
