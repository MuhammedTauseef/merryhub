import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { PRINTABLES_FAQS } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/printables",
  title: "Printables — Christmas Bundles, All-Year Packs & Small Packs",
  description:
    "Eighteen printable packs from $2 to $7: the Complete Christmas Bundle ($7), Christmas games, elf kits, planners, cards, tags and more. Free sample available.",
  ogTitle: "Printables — Christmas Bundles, All-Year Packs & Small Packs",
  ogDescription:
    "Eighteen printable packs from $2 to $7: the Complete Christmas Bundle ($7), Christmas games, elf kits, planners, cards, tags and more. Free sample available right now.",
});

const PACK_CONTENTS = [
  {
    icon: "💌",
    title: "12 printable greeting cards",
    text: "One A4 sheet per card: print, fold in half, and you have an A5 card with a blank inside for your own words. Six designs match our online card maker; six are print-only exclusives.",
  },
  {
    icon: "🏷️",
    title: "24 gift tags",
    text: "Two A4 sheets of 12 tags in four shapes, each with To and From lines and light dashed cut guides — cut out in minutes and tie onto every parcel.",
  },
  {
    icon: "❓",
    title: "The big Christmas quiz",
    text: "The same 12 questions as our online quiz, as a printable player sheet — plus a separate answer key with the story behind every answer.",
  },
  {
    icon: "🎲",
    title: "The Big Games Bundle — 11 games",
    text: "23 sheets: Christmas trivia (16 questions), a word search with solution, emoji pictionary, word scramble, categories, finish-the-phrase, a carol quiz, 10 bingo cards with a caller sheet, the Left–Right gift game, the dice gift exchange and White Elephant rules — plus a Secret Santa questionnaire sheet.",
  },
  {
    icon: "🎅",
    title: "The Santa set",
    text: "Three sheets that belong together: a fill-in letter FROM Santa, a letter TO Santa for children to complete, and an official Nice List certificate with the North Pole seal.",
  },
  {
    icon: "🧝",
    title: "The Elf Kit",
    text: "Everything for a visiting scout elf: an arrival letter, a goodbye letter for Christmas morning, 24 daily elf note cards (three sheets of eight) and an official elf report card to colour in and keep.",
  },
  {
    icon: "📅",
    title: "25 Advent activity cards",
    text: "One original, no-cost family activity for every day from 1 December to Christmas Day — cut them out and draw one each morning, or hide them inside an Advent calendar. Includes make-your-own blanks.",
  },
  {
    icon: "🍽️",
    title: "Table place cards",
    text: "One A4 sheet of eight fold-over tent cards with write-in name lines, so everyone finds their seat — and their cracker — without a fuss.",
  },
];

const PRODUCT_GROUPS = [
  {
    title: "Christmas Bundles",
    intro: "Start here: the complete bundle, then the Christmas bundles for games, elves and cards.",
    products: [
      {
        name: "Complete Christmas Bundle",
        price: "$7",
        href: "https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/",
        text: "★ Featured bundle — 68 pages: games, elf kit, Advent cards, cards, gift tags and Santa letters.",
      },
      {
        name: "Christmas Games Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/christmas-games-bundle-15-printable-party-games-quiz-25-pages/",
        text: "15 printable party games and a quiz, 25 pages in total.",
      },
      {
        name: "Elf on the Shelf Kit + Advent Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/elf-on-the-shelf-kit-advent-activity-cards-bundle-printable-editable/",
        text: "The full elf kit plus 25 Advent activity cards.",
      },
      {
        name: "Cards, Gift Tags & Santa Letters Bundle",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-cards-gift-tags-santa-letters-bundle-printable-editable/",
        text: "Printable Christmas cards, gift tags and Santa letters.",
      },
    ],
  },
  {
    title: "All-Year Printables",
    intro: "Printables for birthdays, babies, planners and everyday occasions — not just Christmas.",
    products: [
      {
        name: "Baby Shower Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/baby-shower-printable-bundle-10-games-bingo-cards-tags-banner/",
        text: "10 games, bingo cards, tags and a banner for a baby shower.",
      },
      {
        name: "ADHD-Friendly Planner",
        price: "$4",
        href: "https://whop.com/merryhub/products/adhd-friendly-planner-for-adults-undated-printable-daily-weekly-reset/",
        text: "Undated daily and weekly planner with reset pages for adults.",
      },
      {
        name: "Birthday Party Bundle",
        price: "$3",
        href: "https://whop.com/merryhub/products/birthday-party-printable-bundle-games-bingo-cards-tags-banner/",
        text: "Games, bingo cards, tags and a banner for a birthday party.",
      },
      {
        name: "Kids Puzzle & Activity Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/kids-puzzle-activity-pack-printable-word-search-mazes-sudoku-ages-6-12/",
        text: "Word searches, mazes and sudoku for ages 6–12.",
      },
      {
        name: "2027 New Year Planner",
        price: "$3",
        href: "https://whop.com/merryhub/products/2027-new-year-planner-printable-goals-monthly-pages-january-weeks-a4/",
        text: "Goals, monthly pages and January weeks for 2027, A4.",
      },
      {
        name: "Christmas Wall Art Set",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-wall-art-set-of-6-prints-printable-8x10-festive-typography-decor/",
        text: "Set of 6 festive typography prints, 8×10.",
      },
      {
        name: "All-Occasion Cards & Tags",
        price: "$2",
        href: "https://whop.com/merryhub/products/all-occasion-printable-cards-gift-tags-12-cards-24-tags/",
        text: "12 printable cards and 24 gift tags for any occasion.",
      },
      {
        name: "Planners & Productivity Bundle", price: "$4", href: "https://whop.com/merryhub/planners-productivity-bundle-undated-daily-weekly-habit-goal-pages", text: "Undated daily, weekly, habit and goal pages, 28 A4 pages, editable in the PDF.", }, { name: "Christmas Gift Coupons",
        price: "$2",
        href: "https://whop.com/merryhub/products/christmas-gift-coupons-printable-16-coupons-4-blank-instant-download/",
        text: "16 printable gift coupons, plus 4 blank ones.",
      },
    ],
  },
  {
    title: "Small Packs — $2–$3",
    intro: "Smaller packs for one job: elf notes, party games, Advent and quiz night.",
    products: [
      {
        name: "Elf Notes & Letters Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/elf-notes-letters-pack-arrival-goodbye-24-notes-report-card/",
        text: "Arrival and goodbye letters, 24 notes and a report card.",
      },
      {
        name: "Party Games Mini-Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-party-games-mini-pack-10-printable-games-answer-keys/",
        text: "10 printable party games with answer keys.",
      },
      {
        name: "Advent Activity Cards",
        price: "$2",
        href: "https://whop.com/merryhub/products/advent-activity-cards-25-printable-cards-for-1-25-december/",
        text: "25 printable cards for 1–25 December.",
      },
      {
        name: "Gift Tags & Santa Letters Set",
        price: "$2",
        href: "https://whop.com/merryhub/products/gift-tags-santa-letters-set-24-tags-letters-editable/",
        text: "24 gift tags and Santa letters, editable.",
      },
      {
        name: "Christmas Quiz Night Pack",
        price: "$2",
        href: "https://whop.com/merryhub/products/christmas-quiz-night-pack-big-quiz-trivia-carols-keys/",
        text: "Big quiz, trivia and carols with answer keys.",
      },
    ],
  },
];

export default function PrintablesPage() {
  const shareTitle = "Printables — Christmas Bundles, All-Year Packs & Small Packs";
  const shareUrl = `${SITE_URL}/printables`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Printables</h1>
          <p>
            Eighteen printable packs, from $2 to $7 — led by the Complete Christmas Bundle
            at $7. Buy once, download instantly, print as many copies as you need. A free
            sample is ready below, right now.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          {PRODUCT_GROUPS.map((group) => (
            <div key={group.title} className="mt-40">
              <h2 style={{ textAlign: "center" }}>{group.title}</h2>
              <p className="section-lede" style={{ textAlign: "center", color: "var(--muted)", maxWidth: 620, margin: "0 auto 30px" }}>
                {group.intro}
              </p>
              <div className="tool-grid">
                {group.products.map((product) => (
                  <div className="tool-card" key={product.name}>
                    <h3>{product.name} — {product.price}</h3>
                    <p>{product.text}</p>
                    <a
                      className="btn btn-red"
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy — {product.price} →
                    </a>
                    <p className="hint mt-24">
                      Secure checkout by Whop • Personal use • Print at home on A4 or US Letter.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="coming-soon mt-40">
            <div style={{ fontSize: "2.6rem" }} aria-hidden="true">
              🎁
            </div>
            <h2>Try the free sample</h2>
            <p>
              Two real pages from the Complete Christmas Bundle, free: the Midnight Pines card
              sheet (print it, fold it, write in it) and the first sheet of 12 gift tags.
            </p>
            <a
              className="btn btn-gold"
              href="/printables/merryhub-printables-sample.pdf"
              download
            >
              Download the free sample (PDF)
            </a>
            <p className="hint mt-24">
              PDF • 2 A4 pages • 334 KB • No email sign-up, no catch.
            </p>
          </div>

          <h2 style={{ textAlign: "center" }} className="mt-40">What&apos;s inside the Complete Christmas Bundle</h2>
          <p className="section-lede" style={{ textAlign: "center", color: "var(--muted)", maxWidth: 620, margin: "0 auto 30px" }}>
            One purchase, print as many copies as your Christmas needs. No shipping, no waiting —
            just download, print and cut.
          </p>
          <div className="tool-grid">
            {PACK_CONTENTS.map((item) => (
              <div className="tool-card" key={item.title}>
                <span className="tool-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="coming-soon mt-40">
            <div style={{ fontSize: "2.6rem" }} aria-hidden="true">
              ✍️
            </div>
            <h2>New: the Editable Premium edition</h2>
            <p>
              The Complete Christmas Bundle includes a second, editable copy of the name-it items — 13 pages
              with 70 fillable fields. Open the PDF, type the names, then print: no handwriting
              to redo, no spelling mistakes on the big night.
            </p>
            <ul style={{ textAlign: "left", maxWidth: 520, margin: "0 auto" }}>
              <li><strong>Santa&apos;s letter</strong> — the child&apos;s name, age and proud-of moment</li>
              <li><strong>Nice List certificate</strong> — the name in big letters, plus the date</li>
              <li><strong>All 24 gift tags</strong> — To and From on every tag</li>
              <li><strong>Table place cards</strong> — every guest&apos;s name, typed</li>
              <li><strong>The Elf letters</strong> — the child&apos;s name and the elf&apos;s name</li>
            </ul>
            <p className="hint mt-24">
              Works in any free PDF reader or browser. The games, quiz and activity cards stay
              print-and-play — those are for pencils, not keyboards.
            </p>
          </div>

          <div className="prose mt-40">
            <h2>Free while you wait</h2>
            <p>
              Alongside the sample, two MerryHub favourites are free right here: the{" "}
              <Link href="/card-maker">online card maker</Link> (make a card picture in seconds,
              send it anywhere) and the <Link href="/christmas-quiz">Christmas quiz</Link> — which
              you can play on screen or print straight from the page, answer key included.
            </p>
            <h2>How printables work</h2>
            <p>
              Printable files are PDFs designed for ordinary home printers on A4 or Letter paper.
              Cards print one per sheet and fold to a standard greeting-card size, tags and place
              cards have light cut guides, and everything is ink-friendly — festive, but not a
              whole cartridge&apos;s worth of festive. Colour is lovely, but every sheet works in
              greyscale too.
            </p>
          </div>

          <div className="prose mt-40 center">
            <h2>Share these printables</h2>
            <div className="share-row">
              <a className="share-btn share-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Share on WhatsApp
              </a>
              <a className="share-btn share-facebook" href={facebookHref} target="_blank" rel="noopener noreferrer">
                Share on Facebook
              </a>
            </div>
          </div>

          <Faq items={PRINTABLES_FAQS} heading="Printable packs questions" />
        </div>
      </section>
    </>
  );
}
