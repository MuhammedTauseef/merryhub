import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/card-maker", label: "Card Maker" },
  { href: "/wishes", label: "Wishes" },
  { href: "/elf-name-generator", label: "Elf Names" },
  { href: "/christmas-quiz", label: "Quiz" },
  { href: "/countdown", label: "Countdown" },
  { href: "/printables", label: "Printables" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label={`${SITE_NAME} home`}>
          <span className="logo-tree" aria-hidden="true">
            🎄
          </span>
          <span className="logo-text">
            Merry<span className="logo-accent">Hub</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
