"use client";

import { useState } from "react";

export default function WishCard({ wish, categoryTitle }: { wish: string; categoryTitle: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wish);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions) — select-free fallback: show the wish in a prompt.
      window.prompt("Copy this wish:", wish);
    }
  };

  const cardHref = `/card-maker?wish=${encodeURIComponent(wish)}`;

  return (
    <article className="wish-card">
      <p>{wish}</p>
      <div className="wish-actions">
        <button type="button" className={`chip-btn${copied ? " copied" : ""}`} onClick={copy}>
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
        <a className="chip-btn" href={cardHref} aria-label={`Make a card with this wish (${categoryTitle})`}>
          💌 Make a card with this
        </a>
      </div>
    </article>
  );
}
