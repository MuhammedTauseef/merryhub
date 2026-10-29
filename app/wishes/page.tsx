import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { WISHES_INDEX_FAQS } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";
import { WISH_CATEGORIES } from "@/lib/wishes";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/wishes",
  title: "Merry Christmas Wishes, Messages & Greetings",
  description:
    "Original Merry Christmas wishes for family, friends, boss, coworkers, partners and kids — plus funny and short one-liners. Copy any wish or turn it into a card.",
  ogTitle: "Merry Christmas Wishes, Messages & Greetings",
  ogDescription:
    "Heartfelt, funny, romantic and short Christmas wishes for everyone on your list. Copy or make a card, free.",
});

export default function WishesIndexPage() {
  const total = WISH_CATEGORIES.reduce((n, c) => n + c.wishes.length, 0);
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Merry Christmas Wishes</h1>
          <p>
            {total} original wishes, messages and greetings — written for real people and real
            relationships. Pick a collection, tap copy, and make someone's day.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <div className="category-grid">
            {WISH_CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/wishes/${c.slug}`} className="category-card">
                <h3>{c.title}</h3>
                <p>{c.wishes[0]}</p>
                <p style={{ marginTop: 10, color: "var(--red-600)", fontWeight: 700 }}>
                  {c.wishes.length} wishes →
                </p>
              </Link>
            ))}
          </div>
          <div className="prose mt-40 center">
            <p>
              Found the perfect words? Don't just text them —{" "}
              <Link href="/card-maker">put them on a beautiful card</Link> with the person's name
              on it. It takes a minute and means so much more.
            </p>
          </div>
          <Faq items={WISHES_INDEX_FAQS} heading="About these wishes" />
        </div>
      </section>
    </>
  );
}
