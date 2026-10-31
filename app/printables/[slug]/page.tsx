import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq, { type FaqItem } from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import ProductGallery from "@/components/ProductGallery";
import { FALLBACK_GROUPS, loadPrintables, type PrintableProduct } from "@/lib/products";
import { getProductDetails, productSlug } from "@/lib/product-details";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Product pages read the same products table as /printables (ISR,
// revalidates every 60 seconds, so admin edits reach the product page
// within about a minute). Slugs are derived from the product name
// (lib/product-details). The launch set is prerendered below; a
// product added later in /admin still renders on its first hit.
export const revalidate = 60;

export async function generateStaticParams() {
  return FALLBACK_GROUPS.flatMap((g) =>
    g.products.map((p) => ({ slug: productSlug(p.name) })),
  );
}

async function findProduct(slug: string) {
  const { groups } = await loadPrintables();
  const all = groups.flatMap((g) =>
    g.products.map((p) => ({ product: p, group: g.title })),
  );
  return all.find((entry) => productSlug(entry.product.name) === slug);
}

function priceNumber(price: string): string {
  const n = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await findProduct(slug);
  if (!found) return {};
  const { product } = found;
  const details = getProductDetails(slug);
  const base = pageMetadata({
    path: `/printables/${slug}`,
    title: `${product.name} — Printable Pack`,
    description: details?.meta ?? `${product.text} ${product.price}, instant PDF download.`,
    ogTitle: `${product.name} — Printable Pack`,
    ogDescription: details?.meta ?? `${product.text} ${product.price}, instant PDF download.`,
    image: product.imageUrls[0] || undefined,
  });
  return {
    ...base,
    // Product meta for Pinterest Rich Pins + catalog readers; the
    // price always comes from the products table, never from copy.
    other: {
      "product:price:amount": priceNumber(product.price),
      "product:price:currency": "USD",
      "product:availability": "in stock",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await findProduct(slug);
  if (!found) notFound();
  const { product, group } = found;
  const details = getProductDetails(slug);
  const url = `${SITE_URL}/printables/${slug}`;

  const { groups } = await loadPrintables();
  const everyone = groups.flatMap((g) => g.products);
  const related: PrintableProduct[] = [
    ...everyone.filter(
      (p) =>
        p.name !== product.name &&
        details &&
        getProductDetails(productSlug(p.name))?.category === details.category,
    ),
    ...everyone.filter(
      (p) =>
        p.name !== product.name &&
        (!details ||
          getProductDetails(productSlug(p.name))?.category !== details.category),
    ),
  ].slice(0, 3);

  const faqs: FaqItem[] = [
    {
      q: "How do I get the file?",
      a: "Checkout happens on Whop — tap the Buy button on this page. Right after payment, Whop delivers the PDF as an instant download, and it also stays in your Whop library. No physical item is shipped.",
    },
    {
      q: "What do I need to print it?",
      a: "An ordinary home printer and A4 paper (US Letter works too). Cards print one per sheet and fold in half; tags, activity cards and place cards have light cut guides. Colour looks best, but every sheet also works in greyscale.",
    },
    ...(details && details.fields > 0
      ? [
          {
            q: "Can I type into the PDF?",
            a: `Yes. This pack has ${details.fields} type-in fields — open it in any free PDF reader or browser, type the names and details, then print. The PDF also includes a link to a fully editable Canva version, where you can change every word, colour and layout with a free Canva account.`,
          },
        ]
      : [
          {
            q: "Do I need any software or an account?",
            a: "No. This is a print-and-play pack: download the PDF, print it, and use it. No software, no account and nothing to install.",
          },
        ]),
    {
      q: "Can I print more than one copy?",
      a: "Yes — the pack is licensed to you for personal use, so print as many copies as your own household, class or party needs. Please do not share, resell or upload the file itself; send friends to MerryHub so they can get their own copy.",
    },
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: details?.meta ?? product.text,
    image: product.imageUrls,
    category: details?.category ?? group,
    brand: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: priceNumber(product.price),
      availability: "https://schema.org/InStock",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Printables", item: `${SITE_URL}/printables` },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };

  const shareTitle = `${product.name} — ${product.price} printable pack`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="page-hero">
        <div className="wrap">
          <h1>{product.name}</h1>
          <p>{product.text}</p>
          <p style={{ fontSize: "1.35rem", fontWeight: 700 }}>{product.price} — instant download</p>
          <p>
            <a
              className="btn btn-red"
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              data-product={product.name}
            >
              Buy — {product.price} →
            </a>
          </p>
          <p className="hint">
            Secure checkout by Whop • Personal use • Print at home on A4 or US Letter.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="hint" style={{ marginBottom: 18 }}>
            <Link href="/">Home</Link> {" / "}
            <Link href="/printables">Printables</Link> {" / "}
            <span>{product.name}</span>
          </nav>

          {product.imageUrls.length > 0 && (
            <ProductGallery
              name={product.name}
              price={product.price}
              text={product.text}
              href={product.href}
              images={product.imageUrls}
            />
          )}

          <div className="prose mt-40">
            {details && (
              <>
                <h2>What&apos;s included</h2>
                <ul>
                  {details.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h2>Who this is for</h2>
                <p>{details.audience}</p>
              </>
            )}
            <h2>Details</h2>
            <ul>
              <li>
                <strong>Format:</strong> PDF — instant download after checkout
              </li>
              {details && (
                <li>
                  <strong>Pages:</strong> {details.pages} pages (plus an
                  Edit-in-Canva link page inside the file)
                </li>
              )}
              <li>
                <strong>Paper:</strong> A4 and US Letter — ordinary home printers
              </li>
              <li>
                <strong>Editing:</strong>{" "}
                {details && details.fields > 0
                  ? `${details.fields} type-in fields in the PDF, plus a fully editable Canva version linked inside the file`
                  : "Print-and-play — nothing to edit, install or sign up for"}
              </li>
              <li>
                <strong>Delivery:</strong> Instant, by Whop, right after checkout
              </li>
              <li>
                <strong>Licence:</strong> Personal use — print as many copies as
                your own household, class or party needs
              </li>
            </ul>
            <h2>How to use it</h2>
            <ol>
              <li>Tap Buy and check out securely on Whop.</li>
              <li>Download the PDF from Whop (it also stays in your Whop library).</li>
              {details && details.fields > 0 ? (
                <li>
                  Type into the fields if you like — or open the Canva link inside
                  the PDF for full editing — then print on A4 or US Letter.
                </li>
              ) : (
                <li>Print on A4 or US Letter, cut along the light guides where shown, and enjoy.</li>
              )}
            </ol>
            <h2>About digital downloads</h2>
            <p>
              This is a digital product — no physical item is shipped. Payments are
              processed by Whop, and Whop delivers the file right after checkout.
              Please look through the photos and the What&apos;s included list above
              before buying, so you know exactly what is in the file. The licence
              and the plain rules of the site are on our{" "}
              <Link href="/terms">Terms of Use</Link> page, and questions are welcome
              on the <Link href="/contact">contact page</Link>.
            </p>
          </div>

          <div className="coming-soon mt-40">
            <h2>
              {product.name} — {product.price}
            </h2>
            <p>{product.text}</p>
            <a
              className="btn btn-red"
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              data-product={product.name}
            >
              Buy — {product.price} →
            </a>
            <p className="hint mt-24">
              Secure checkout by Whop • Personal use • Print at home on A4 or US Letter.
            </p>
          </div>

          <div className="prose mt-40 center">
            <h2>Share this pack</h2>
            <div className="share-row">
              <a className="share-btn share-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Share on WhatsApp
              </a>
              <a className="share-btn share-facebook" href={facebookHref} target="_blank" rel="noopener noreferrer">
                Share on Facebook
              </a>
            </div>
          </div>

          <Faq items={faqs} />

          {related.length > 0 && (
            <div className="mt-40">
              <div className="prose">
                <h2>You may also like</h2>
              </div>
              <div className="blog-grid">
                {related.map((p) => (
                  <Link
                    key={p.name}
                    href={`/printables/${productSlug(p.name)}`}
                    className="category-card blog-card"
                  >
                    {p.imageUrls[0] && (
                      <img className="blog-card-img" src={p.imageUrls[0]} alt={p.name} />
                    )}
                    <h3>
                      {p.name} — {p.price}
                    </h3>
                    <p>{p.text}</p>
                    <p className="blog-read">See what&apos;s inside →</p>
                  </Link>
                ))}
              </div>
              <p className="center mt-24">
                <Link href="/printables">← See all printable packs</Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
