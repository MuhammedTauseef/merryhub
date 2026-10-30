import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { formatPostDate, getAllPosts, getPost } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Posts come from Supabase at request time, so a publish in the admin
// panel goes live without a redeploy.
export const dynamic = "force-dynamic";

// The editor's content format allows **bold** spans (like the other
// projects' editors). Stored text keeps the markers so editing stays
// lossless; rendering converts them to <strong> — never show raw **.
function renderInline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    ogTitle: post.title,
    ogDescription: post.excerpt,
    // The post's cover image when it has one; otherwise the site default.
    image: post.heroImage || undefined,
    ogType: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const shareTitle = post.title;
  const shareUrl = url;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    ...(post.heroImage ? { image: post.heroImage } : {}),
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  const others = (await getAllPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={articleSchema} />
      <section className="page-hero">
        <div className="wrap">
          <p className="blog-meta blog-meta-hero">
            <span className="blog-tag">{post.category}</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <article className="prose">
            {post.heroImage && (
              <img className="blog-hero-img" src={post.heroImage} alt={post.title} />
            )}
            <div className="direct-answer">
              <p>
                <strong>Quick answer:</strong> {post.directAnswer}
              </p>
            </div>

            {post.sections.map((section) => (
              <section key={section.h2}>
                <h2>{section.h2}</h2>
                {section.paragraphs?.map((para, i) => (
                  <p key={i}>{renderInline(para)}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((b) => (
                      <li key={b}>{renderInline(b)}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {post.relatedLinks.length > 0 && (
              <>
                <h2>Try it on MerryHub</h2>
                <ul>
                  {post.relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-40 center">
              <h2>Share this post</h2>
              <div className="share-row">
                <a className="share-btn share-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  Share on WhatsApp
                </a>
                <a className="share-btn share-facebook" href={facebookHref} target="_blank" rel="noopener noreferrer">
                  Share on Facebook
                </a>
              </div>
            </div>
          </article>

          <Faq items={post.faqs} heading="Frequently asked questions" />

          {others.length > 0 && (
            <div className="mt-40">
              <div className="prose">
                <h2>Keep reading</h2>
              </div>
              <div className="blog-grid">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/blog/${other.slug}`}
                    className="category-card blog-card"
                  >
                    {other.heroImage && (
                      <img className="blog-card-img" src={other.heroImage} alt={other.title} />
                    )}
                    <p className="blog-meta">
                      <span className="blog-tag">{other.category}</span>
                      <time dateTime={other.date}>{formatPostDate(other.date)}</time>
                    </p>
                    <h3>{other.title}</h3>
                    <p>{other.excerpt}</p>
                    <p className="blog-read">Read the guide →</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
