"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/card-maker", label: "Card Maker" },
  { href: "/wishes", label: "Wishes" },
  { href: "/elf-name-generator", label: "Elf Names" },
  { href: "/christmas-quiz", label: "Quiz" },
  { href: "/countdown", label: "Countdown" },
  { href: "/printables", label: "Printables" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav id="main-nav-panel" className="nav-panel" aria-label="Main">
          <div className="wrap nav-panel-inner">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
