import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "@/components/Faq";
import WishCard from "@/components/WishCard";
import { categoryFaqs } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";
import { WISH_CATEGORIES, getCategory } from "@/lib/wishes";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return WISH_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Christmas Wishes" };
  return pageMetadata({
    path: `/wishes/${cat.slug}`,
    title: cat.title,
    description: cat.metaDescription,
  });
}

export default async function WishCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const others = WISH_CATEGORIES.filter((c) => c.slug !== cat.slug);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>{cat.heading}</h1>
          <p>{cat.intro}</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <div className="wish-grid">
            {cat.wishes.map((w) => (
              <WishCard key={w.slice(0, 32)} wish={w} categoryTitle={cat.title} />
            ))}
          </div>

          <div className="prose mt-40 center">
            <h2>Make it a card</h2>
            <p>
              Any of these wishes looks even better on a card with their name on it. Tap{" "}
              <em>“Make a card with this”</em> on any wish, or open the{" "}
              <Link href="/card-maker">free Christmas card maker</Link> and choose your favourite
              design.
            </p>
          </div>

          <Faq items={categoryFaqs(cat)} />

          <div className="mt-40">
            <h2 style={{ textAlign: "center" }}>More Christmas wishes</h2>
            <div className="category-grid mt-24">
              {others.map((c) => (
                <Link key={c.slug} href={`/wishes/${c.slug}`} className="category-card">
                  <h3>{c.title}</h3>
                  <p>{c.wishes.length} wishes →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
