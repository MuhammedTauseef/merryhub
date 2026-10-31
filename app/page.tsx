import type { Metadata } from "next";
import Link from "next/link";
import CardMaker from "@/components/CardMaker";
import ProductGallery from "@/components/ProductGallery";
import { FALLBACK_GROUPS, type PrintableProduct } from "@/lib/products";
import Snowfall from "@/components/Snowfall";
import { getCountdownParts, longDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION } from "@/lib/site";
import { WISH_CATEGORIES, getCategory } from "@/lib/wishes";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "MerryHub — Christmas Card Maker, Wishes & Countdown 2026",
  description: SITE_DESCRIPTION,
  absoluteTitle: true,
});

const TOOLS = [
  {
    href: "/wishes",
    icon: "✨",
    title: "Christmas Wishes Library",
    text: "Original wishes for family, friends, your boss, clients, teachers and kids — plus full collections in Spanish and Portuguese.",
    go: "Find a wish →",
  },
  {
    href: "/elf-name-generator",
    icon: "🧝",
    title: "Elf Name Generator",
    text: "Your name plus your birth month equals your official North Pole elf name — and a workshop job title to match. Silly, shareable, addictive.",
    go: "Meet your elf self →",
  },
  {
    href: "/christmas-quiz",
    icon: "❓",
    title: "The Big Christmas Quiz",
    text: "Twelve festive questions with an answer key. Play on screen or print it for the table — perfect for parties, classrooms and offices.",
    go: "Play the quiz →",
  },
  {
    href: "/countdown",
    icon: "⏰",
    title: "Christmas Countdown",
    text: "How many days until Christmas? The live answer in days, hours, minutes and seconds — plus Christmas Eve, Boxing Day and New Year dates.",
    go: "Watch it tick →",
  },
];


/**
 * Homepage product galleries (owner orders 31 Oct 2026 — "Frontpage par
 * bhi jin product images hai wo sary show hon" + "Front page jis product
 * click kary link isi product par ly jay"). The 8 products shown on this
 * page get the SAME 5-photo galleries as /printables: the data comes
 * from the same source /printables uses (FALLBACK_GROUPS in lib/products,
 * the mirror of the products table), so the two pages cannot drift.
 *
 * Click rule: each card's own cover image and its name link DIRECTLY to
 * that product's own Whop page. Under the cover sits the gallery's
 * "📷 View photos (5)" line, which opens the full-screen gallery modal
 * in place (components/ProductGallery, unmodified). ProductGallery's
 * trigger normally shows its own cover above that line; the homepage
 * card already shows its cover (the Whop link), so the scoped style
 * below hides ONLY the trigger's duplicate cover image. The modal
 * itself is portaled to <body>, outside .hp-gallery, and is untouched.
 */
const GALLERY_BY_NAME = new Map<string, PrintableProduct>(
  FALLBACK_GROUPS.flatMap((g) => g.products).map((p) => [p.name, p]),
);

function HomeGallery({ name }: { name: string }) {
  const p = GALLERY_BY_NAME.get(name);
  if (!p) return null;
  return (
    <div className="hp-gallery">
      <ProductGallery
        name={p.name}
        price={p.price}
        text={p.text}
        href={p.href}
        images={p.imageUrls}
      />
    </div>
  );
}

export default function HomePage() {
  const parts = getCountdownParts();
  const totalWishes = WISH_CATEGORIES.reduce((n, c) => n + c.wishes.length, 0);
  const teaserCats = ["for-family", "for-friends", "short-and-sweet"]
    .map((slug) => getCategory(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <style>{`.hp-gallery > button > img { display: none !important; }`}</style>
      <section className="hero hero-maker">
        <Snowfall />
        <div className="wrap hero-content">
          <h1>
            Make a <span className="gold">Christmas card</span> in 10 seconds
          </h1>
          <p className="lede">
            Pick a design, type their name, download the picture, share it anywhere. No sign-up,
            no cost — just a card that actually has their name on it.
          </p>
          <div className="hero-maker-box">
            <CardMaker />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>More ways to spread the merry</h2>
          <p className="section-lede">
            The card maker is the star, but the whole workshop is open — everything free,
            everything instant.
          </p>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="tool-card">
                <span className="tool-icon" aria-hidden="true">
                  {t.icon}
                </span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <span className="tool-go">{t.go}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <h2>Words that warm the season</h2>
          <p className="section-lede">
            {totalWishes} original Christmas wishes across {WISH_CATEGORIES.length} collections —
            copy one as it is, or tap “Make a card with this” and it lands straight on a card.
          </p>
          <div className="teaser-wishes">
            {teaserCats.map((c) => (
              <div className="teaser-wish" key={c.slug}>
                “{c.wishes[0]}”
                <span>From {c.title}</span>
              </div>
            ))}
          </div>
          <div className="category-chips mt-40">
            {WISH_CATEGORIES.map((c) => {
              const raw = c.title.replace(/^Christmas Wishes\s*/, "");
              const label = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : c.title;
              return (
                <Link key={c.slug} href={`/wishes/${c.slug}`} className="chip-btn">
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="center mt-24">
            <Link href="/wishes" className="btn btn-red">
              Browse all Christmas wishes
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Printables for paper instead of pixels</h2>
          <p className="section-lede">
            Two ways in: a free sample to try right now, and the Complete Christmas Bundle —
            games, elf kit, Advent, cards, tags and Santa letters in one download.
          </p>
          <div className="tool-grid">
            <div className="tool-card">
              <span className="tool-icon" aria-hidden="true">🆓</span>
              <h3>Free printable sample</h3>
              <p>
                A greeting card and a gift-tags sheet from the pack — download, print, and
                see the quality for yourself. No email needed.
              </p>
              <a href="/printables/merryhub-printables-sample.pdf" className="tool-go" download>
                Download the free sample →
              </a>
            </div>
            <div className="tool-card">
              <a href="https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/" target="_blank" rel="noreferrer" aria-label="Complete Christmas Bundle on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-complete-christmas-bundle.webp" alt="Complete Christmas Bundle" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Complete Christmas Bundle" />
              <span className="tool-icon" aria-hidden="true">🎁</span>
              <h3><a href="https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Complete Christmas Bundle — $7</a></h3>
              <p>
                68 pages: party games, an Elf Kit, Advent activity cards, cards, gift tags
                and Santa letters — PLUS the editable edition with 70 type-in name fields.
              </p>
              <a
                href="https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/"
                target="_blank"
                rel="noreferrer"
                className="tool-go"
              >
                Get the Complete Christmas Bundle — $7 →
              </a>
            </div>
          </div>
          <div className="center mt-24">
            <Link href="/printables" className="btn btn-outline-dark">
              Browse all printables
            </Link>
          </div>
        </div>
      </section>

      <section className="section"><div className="wrap"><h2>Small packs, tiny prices — $2 each</h2><div className="tool-grid"><div className="tool-card"><a href="https://whop.com/merryhub/products/advent-activity-cards-25-printable-cards-for-1-25-december/" target="_blank" rel="noreferrer" aria-label="Advent Activity Cards on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-advent-activity-cards.png" alt="Advent Activity Cards" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Advent Activity Cards" /><h3><a href="https://whop.com/merryhub/products/advent-activity-cards-25-printable-cards-for-1-25-december/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Advent Activity Cards</a></h3><p>$2</p><a href="https://whop.com/merryhub/products/advent-activity-cards-25-printable-cards-for-1-25-december/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $2</a></div><div className="tool-card"><a href="https://whop.com/merryhub/products/christmas-quiz-night-pack-big-quiz-trivia-carols-keys/" target="_blank" rel="noreferrer" aria-label="Christmas Quiz Night Pack on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-quiz-night-pack.png" alt="Christmas Quiz Night Pack" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Christmas Quiz Night Pack" /><h3><a href="https://whop.com/merryhub/products/christmas-quiz-night-pack-big-quiz-trivia-carols-keys/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Christmas Quiz Night Pack</a></h3><p>$2</p><a href="https://whop.com/merryhub/products/christmas-quiz-night-pack-big-quiz-trivia-carols-keys/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $2</a></div><div className="tool-card"><a href="https://whop.com/merryhub/products/gift-tags-santa-letters-set-24-tags-letters-editable/" target="_blank" rel="noreferrer" aria-label="Gift Tags & Santa Letters Set on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-gift-tags-santa-letters.png" alt="Gift Tags & Santa Letters Set" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Gift Tags & Santa Letters Set" /><h3><a href="https://whop.com/merryhub/products/gift-tags-santa-letters-set-24-tags-letters-editable/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Gift Tags & Santa Letters Set</a></h3><p>$2</p><a href="https://whop.com/merryhub/products/gift-tags-santa-letters-set-24-tags-letters-editable/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $2</a></div><div className="tool-card"><a href="https://whop.com/merryhub/products/christmas-gift-coupons-printable-16-coupons-4-blank-instant-download/" target="_blank" rel="noreferrer" aria-label="Christmas Gift Coupons on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-gift-coupons.png" alt="Christmas Gift Coupons" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Christmas Gift Coupons" /><h3><a href="https://whop.com/merryhub/products/christmas-gift-coupons-printable-16-coupons-4-blank-instant-download/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Christmas Gift Coupons</a></h3><p>$2</p><a href="https://whop.com/merryhub/products/christmas-gift-coupons-printable-16-coupons-4-blank-instant-download/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $2</a></div></div><div className="center mt-24"><Link href="/printables" className="btn btn-red">Browse all printables</Link></div></div></section><section className="section"><div className="wrap"><h2>Planners & productivity</h2><div className="tool-grid"><div className="tool-card"><a href="https://whop.com/merryhub/products/adhd-friendly-planner-for-adults-undated-printable-daily-weekly-reset/" target="_blank" rel="noreferrer" aria-label="ADHD-Friendly Planner on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-adhd-planner.png" alt="ADHD-Friendly Planner" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="ADHD-Friendly Planner" /><h3><a href="https://whop.com/merryhub/products/adhd-friendly-planner-for-adults-undated-printable-daily-weekly-reset/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>ADHD-Friendly Planner</a></h3><p>Undated daily and weekly pages with gentle structure — plan without the pressure.</p><p>$4</p><a href="https://whop.com/merryhub/products/adhd-friendly-planner-for-adults-undated-printable-daily-weekly-reset/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $4</a></div><div className="tool-card"><a href="https://whop.com/merryhub/products/2027-new-year-planner-printable-goals-monthly-pages-january-weeks-a4/" target="_blank" rel="noreferrer" aria-label="2027 New Year Planner on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-new-year-planner.png" alt="2027 New Year Planner" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="2027 New Year Planner" /><h3><a href="https://whop.com/merryhub/products/2027-new-year-planner-printable-goals-monthly-pages-january-weeks-a4/" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>2027 New Year Planner</a></h3><p>Goals, monthly pages and January weeks for a strong start to 2027.</p><p>$3</p><a href="https://whop.com/merryhub/products/2027-new-year-planner-printable-goals-monthly-pages-january-weeks-a4/" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $3</a></div><div className="tool-card"><a href="https://whop.com/merryhub/planners-productivity-bundle-undated-daily-weekly-habit-goal-pages" target="_blank" rel="noreferrer" aria-label="Planners & Productivity Bundle on Whop">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://ffbqjncgkknnfdrhqjyt.supabase.co/storage/v1/object/public/blog-images/covers/merryhub-planners-productivity.png" alt="Planners & Productivity Bundle" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 14 }}/></a><HomeGallery name="Planners & Productivity Bundle" /><h3><a href="https://whop.com/merryhub/planners-productivity-bundle-undated-daily-weekly-habit-goal-pages" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Planners & Productivity Bundle</a></h3><p>Undated daily, weekly, habit and goal pages — 28 A4 pages, editable in the PDF.</p><p>$4</p><a href="https://whop.com/merryhub/planners-productivity-bundle-undated-daily-weekly-habit-goal-pages" target="_blank" rel="noreferrer" className="btn btn-red">Buy — $4 →</a></div></div><div className="center mt-24"><Link href="/printables" className="btn btn-red">Browse all printables</Link></div></div></section><section className="section section-alt">
        <div className="wrap prose center">
          <h2>Christmas Day {parts.christmasYear} falls on {longDate(parts.target)}</h2>
          <p>
            {parts.isChristmasDay
              ? "And it's today — merry Christmas! Send that card now, while the day is still young."
              : `That's ${parts.days} day${parts.days === 1 ? "" : "s"} of anticipation to enjoy. However you celebrate — a big family table, a quiet evening, a video call across the miles — MerryHub is here to help you spread a little more joy on the way there.`}{" "}
            When you need paper instead of pixels, the{" "}
            <Link href="/printables">Complete Christmas Bundle</Link> is ready — with a free sample to
            download right now.
          </p>
          <div className="hero-cta">
            <Link href="/christmas-quiz" className="btn btn-green">
              ❓ Play the Christmas quiz
            </Link>
            <Link href="/elf-name-generator" className="btn btn-outline-dark">
              🧝 Find your elf name
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
