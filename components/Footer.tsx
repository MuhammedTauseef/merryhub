import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { WISH_CATEGORIES } from "@/lib/wishes";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-col">
          <p className="footer-logo">
            🎄 {SITE_NAME}
          </p>
          <p className="footer-blurb">
            Free Christmas fun for everyone: a card maker that spreads smiles, a
            big library of original wishes in five languages, elf names, a
            printable quiz and a live countdown — no sign-up, no fuss.
          </p>
        </div>
        <div className="footer-col">
          <h3>Christmas Tools</h3>
          <ul>
            <li>
              <Link href="/card-maker">Christmas Card Maker</Link>
            </li>
            <li>
              <Link href="/wishes">Christmas Wishes</Link>
            </li>
            <li>
              <Link href="/elf-name-generator">Elf Name Generator</Link>
            </li>
            <li>
              <Link href="/christmas-quiz">Christmas Quiz (Printable)</Link>
            </li>
            <li>
              <Link href="/countdown">Christmas Countdown</Link>
            </li>
            <li>
              <Link href="/printables">Printable Cards & Games</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Christmas Wishes</h3>
          <ul>
            {WISH_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/wishes/${c.slug}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h3>About {SITE_NAME}</h3>
          <ul>
            <li>
              <Link href="/blog">Christmas Blog</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <p>
          © {year} {SITE_NAME}. Made with love for the most wonderful time of
          the year.
        </p>
      </div>
    </footer>
  );
}
