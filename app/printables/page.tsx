import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { PRINTABLES_FAQS } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/printables",
  title: "Printable Christmas Cards & Games — Free Sample",
  description:
    "55 print-ready A4 pages: greeting cards, gift tags, a quiz, an 11-game bundle, Santa letters, an Elf Kit and Advent cards — plus a type-in edition. Free sample.",
  ogTitle: "Printable Christmas Cards, Games & Elf Kit — Free Sample",
  ogDescription:
    "55 pages of print-at-home Christmas joy: cards, tags, games, Santa letters, an Elf Kit and Advent activity cards — plus an editable edition for typed names. Free sample available right now.",
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

export default function PrintablesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Printable Christmas Cards & Games</h1>
          <p>
            The MerryHub Printable Pack is finished: 55 print-ready A4 pages of cards, tags,
            games and North Pole paperwork — plus the Editable Premium edition, on sale here
            for $2. A free sample is ready below, right now.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <h2 style={{ textAlign: "center" }}>What's inside the pack</h2>
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
              Every pack now includes a second, editable copy of the name-it items — 13 pages
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

          <div className="coming-soon mt-40">
            <div style={{ fontSize: "2.6rem" }} aria-hidden="true">
              🎁
            </div>
            <h2>Try the free sample</h2>
            <p>
              Two real pages from the pack, free: the Midnight Pines card sheet (print it, fold
              it, write in it) and the first sheet of 12 gift tags. If your printer likes these,
              it will love the other 53 pages.
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

          <div className="coming-soon mt-40">
            <div style={{ fontSize: "2.6rem" }} aria-hidden="true">
              🛍️
            </div>
            <h2>The full pack — $2</h2>
            <p>
              Both editions, one small price: the complete 55-page print-and-play pack AND the
              Editable Premium edition with 70 type-in name fields. Pay once, download
              instantly, print as many copies as your Christmas needs.
            </p>
            <a
              className="btn btn-red"
              href="https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get the Full Pack — $2
            </a>
            <p className="hint mt-24">
              Secure checkout by Whop • Both PDFs are delivered to you right after payment •
              Personal use • Print at home on A4 or US Letter.
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
              whole cartridge's worth of festive. Colour is lovely, but every sheet works in
              greyscale too.
            </p>
          </div>

          <Faq items={PRINTABLES_FAQS} heading="Printable pack questions" />
        </div>
      </section>
    </>
  );
}
