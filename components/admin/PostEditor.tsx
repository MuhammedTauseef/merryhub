"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi, adminUploadImage, type AdminPost } from "@/components/admin/api";
import { slugify } from "@/lib/admin-posts";
import { parsePostContent, serializePostContent } from "@/lib/post-content";
import type { PostRelatedLink } from "@/lib/posts";

const DEFAULT_RELATED = [
  { label: "Make a free Christmas card", href: "/card-maker" },
  { label: "Browse the Christmas wishes library", href: "/wishes" },
  { label: "See the printable cards & games pack", href: "/printables" },
  { label: "Check the Christmas countdown", href: "/countdown" },
];

const CONTENT_HELP =
  "One field for the whole article. Start each section with a heading line “## Heading”, write paragraphs as plain text (blank line between them), and use “- ” at the start of a line for bullets.";

function linksToText(links: PostRelatedLink[]): string {
  return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}

function textToLinks(text: string): PostRelatedLink[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      return { label: label ?? "", href: href ?? "" };
    })
    .filter((l) => l.label && l.href.startsWith("/"));
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("Guides");
  const [keyword, setKeyword] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [directAnswer, setDirectAnswer] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    Array.from({ length: 5 }, () => ({ q: "", a: "" })),
  );
  const [relatedText, setRelatedText] = useState(linksToText(DEFAULT_RELATED));
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    if (!postId) return;
    adminApi<{ post: AdminPost }>(`/api/admin/posts/${postId}`)
      .then(({ post }) => {
        setTitle(post.title);
        setSlug(post.slug);
        setSlugTouched(true);
        setCategory(post.category);
        setKeyword(post.target_keyword);
        setExcerpt(post.excerpt);
        setDirectAnswer(post.direct_answer);
        setHeroImage(post.hero_image ?? "");
        setContent(serializePostContent(post.sections ?? []));
        const rows = (post.faqs ?? []).slice(0, 5);
        while (rows.length < 5) rows.push({ q: "", a: "" });
        setFaqs(rows);
        setRelatedText(linksToText(post.related_links ?? []));
        setStatus(post.status);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "signed-out") router.replace("/admin/login");
        else setError(err instanceof Error ? err.message : "Could not load the post.");
      })
      .finally(() => setLoading(false));
  }, [postId, router]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function setFaq(index: number, field: "q" | "a", value: string) {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  }

  async function onHeroFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await adminUploadImage(file);
      setHeroImage(url);
    } catch (err) {
      if (err instanceof Error && err.message === "signed-out") router.replace("/admin/login");
      else setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Reset so picking the same file again re-triggers the change event.
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  }

  async function save(nextStatus: "draft" | "published") {
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      title,
      slug,
      category,
      target_keyword: keyword,
      excerpt,
      direct_answer: directAnswer,
      hero_image: heroImage,
      sections: parsePostContent(content),
      faqs: faqs.filter((f) => f.q.trim() && f.a.trim()),
      related_links: textToLinks(relatedText),
      status: nextStatus,
    };
    try {
      if (postId) {
        await adminApi(`/api/admin/posts/${postId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStatus(nextStatus);
        setNotice(nextStatus === "published" ? "Published — live on the blog now." : "Draft saved.");
      } else {
        const { post } = await adminApi<{ post: AdminPost }>("/api/admin/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/admin/blog/${post.id}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "signed-out") router.replace("/admin/login");
      else setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page-body">
        <div className="wrap">
          <p className="hint">Loading the post…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-body">
      <div className="wrap">
        <div className="admin-bar">
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>{postId ? "Edit post" : "New post"}</h1>
          <Link href="/admin" className="btn btn-outline-dark">
            ← All posts
          </Link>
        </div>

        <div className="panel mt-24">
          <div className="field">
            <label htmlFor="f-title">Title</label>
            <input
              id="f-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="What to Write in a Christmas Card"
            />
          </div>
          <div className="field">
            <label htmlFor="f-slug">Slug (page URL)</label>
            <input
              id="f-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
            />
            <p className="hint">The post will live at /blog/{slug || "…"}</p>
          </div>
          <div className="field">
            <label htmlFor="f-category">Category</label>
            <input
              id="f-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-keyword">Target keyword</label>
            <input
              id="f-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="what to write in a christmas card"
            />
          </div>
          <div className="field">
            <label htmlFor="f-excerpt">Excerpt / meta description</label>
            <textarea
              id="f-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
            />
            <p className="hint">{excerpt.length} characters — aim for 160 or fewer.</p>
          </div>
          <div className="field">
            <label htmlFor="f-answer">Direct answer (shown at the top)</label>
            <textarea
              id="f-answer"
              value={directAnswer}
              onChange={(e) => setDirectAnswer(e.target.value)}
              rows={3}
            />
            <p className="hint">{wordCount(directAnswer)} words — aim for 40–60.</p>
          </div>
          <div className="field">
            <label htmlFor="f-hero-file">Cover image</label>
            {heroImage && (
              <img src={heroImage} alt="Cover preview" className="admin-hero-preview" />
            )}
            <input
              id="f-hero-file"
              ref={heroFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => void onHeroFile(e.target.files?.[0])}
            />
            <div className="admin-actions">
              <button
                type="button"
                className="btn btn-outline-dark"
                disabled={uploading || saving}
                onClick={() => heroFileRef.current?.click()}
              >
                {uploading ? "Uploading…" : heroImage ? "Replace image" : "Upload image"}
              </button>
              {heroImage && (
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  disabled={uploading || saving}
                  onClick={() => {
                    setHeroImage("");
                    setUploadError("");
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            {uploadError && (
              <p role="alert" style={{ color: "var(--red-600)", fontWeight: 600 }}>
                {uploadError}
              </p>
            )}
            <p className="hint">
              JPG, PNG or WebP, up to 5 MB. The uploaded picture is stored with the post when you
              Save or Publish — it appears at the top of the article and on its blog card.
            </p>
          </div>
          <div className="field">
            <label htmlFor="f-content">Content</label>
            <textarea
              id="f-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.92rem" }}
              placeholder={"## First heading\nWrite the section here…\n\n- A bullet\n- Another bullet"}
            />
            <p className="hint">{CONTENT_HELP}</p>
          </div>

          <fieldset className="field" style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
            <legend style={{ fontWeight: 700, color: "var(--green-950)", marginBottom: 6 }}>
              FAQs (5 — shown on the page and used as FAQ schema)
            </legend>
            {faqs.map((faq, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  value={faq.q}
                  onChange={(e) => setFaq(i, "q", e.target.value)}
                  placeholder={`Question ${i + 1}`}
                  aria-label={`FAQ question ${i + 1}`}
                  style={{ marginBottom: 6 }}
                />
                <textarea
                  value={faq.a}
                  onChange={(e) => setFaq(i, "a", e.target.value)}
                  placeholder={`Answer ${i + 1}`}
                  aria-label={`FAQ answer ${i + 1}`}
                  rows={2}
                />
              </div>
            ))}
          </fieldset>

          <div className="field">
            <label htmlFor="f-related">Related links (one per line: Label | /path)</label>
            <textarea
              id="f-related"
              value={relatedText}
              onChange={(e) => setRelatedText(e.target.value)}
              rows={4}
            />
          </div>
          <div className="field">
            <label htmlFor="f-status">Status</label>
            <select
              id="f-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
            </select>
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--red-600)", fontWeight: 600 }}>
              {error}
            </p>
          )}
          {notice && (
            <p role="status" style={{ color: "var(--green-700)", fontWeight: 600 }}>
              {notice}
            </p>
          )}
          <div className="admin-actions">
            <button
              type="button"
              className="btn btn-outline-dark"
              disabled={saving}
              onClick={() => void save("draft")}
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              className="btn btn-gold"
              disabled={saving}
              onClick={() => void save("published")}
            >
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
