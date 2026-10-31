import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate, getAllPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

// Posts come from Supabase and the rendered page is cached (ISR):
// it revalidates every 60 seconds, so a publish in the admin panel
// goes live within about a minute, with no redeploy.
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title: "Christmas Blog — Seasonal Guides, Ideas & How-Tos",
  description:
    "The MerryHub Christmas blog: seasonal guides and how-tos for cards, wishes, printables, party games and getting ready for Christmas Day.",
  ogTitle: "The MerryHub Christmas Blog",
  ogDescription:
    "Seasonal guides, ideas and how-tos for a calmer, merrier Christmas — from what to write in a card to running the perfect party games night.",
});

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>The MerryHub Christmas Blog</h1>
          <p>
            Seasonal guides, ideas and how-tos from the people behind the card maker — what to
            write, what to print, and how to get the fun parts of Christmas done without the
            last-minute scramble.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          {posts.length > 0 ? (
            <div className="blog-grid">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="category-card blog-card">
                  {post.heroImage && (
                    <img className="blog-card-img" src={post.heroImage} alt={post.title} />
                  )}
                  <p className="blog-meta">
                    <span className="blog-tag">{post.category}</span>
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  </p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <p className="blog-read">Read the guide →</p>
                </Link>
              ))}
            </div>
          ) : (
            <>
              <div className="prose">
                <h2>Our first guides are on their way</h2>
                <p>
                  The blog is brand new. We are writing the first seasonal guides now — what to
                  write in a Christmas card, how to run a Secret Santa everyone actually enjoys,
                  making the most of the printable pack, and getting your wishes out in Spanish and
                  Portuguese as well as English.
                </p>
                <p>
                  Every guide will be researched, original and written to be genuinely useful —
                  the same standard as the rest of MerryHub. While they are being finished, the
                  tools below are ready right now:
                </p>
              </div>
              <div className="tool-grid mt-40">
                <Link href="/card-maker" className="tool-card">
                  <span className="tool-icon" aria-hidden="true">
                    💌
                  </span>
                  <h3>Christmas Card Maker</h3>
                  <p>Add a name and a message, download a finished card picture, share it anywhere.</p>
                  <span className="tool-go">Make a card →</span>
                </Link>
                <Link href="/wishes" className="tool-card">
                  <span className="tool-icon" aria-hidden="true">
                    🎄
                  </span>
                  <h3>Christmas Wishes Library</h3>
                  <p>Original wishes for everyone on your list, in three languages — copy or card them.</p>
                  <span className="tool-go">Browse wishes →</span>
                </Link>
                <Link href="/printables" className="tool-card">
                  <span className="tool-icon" aria-hidden="true">
                    🎲
                  </span>
                  <h3>Printable Cards & Games</h3>
                  <p>The 55-page printable pack — cards, tags, games, Santa letters and the Elf Kit.</p>
                  <span className="tool-go">See the pack →</span>
                </Link>
                <Link href="/countdown" className="tool-card">
                  <span className="tool-icon" aria-hidden="true">
                    ⏳
                  </span>
                  <h3>Christmas Countdown</h3>
                  <p>Exactly how many days, hours and sleeps are left until Christmas Day.</p>
                  <span className="tool-go">See the countdown →</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
