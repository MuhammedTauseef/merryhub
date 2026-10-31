"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 conversion signal for the one action that matters commercially:
 * a click on an outbound Whop (Buy) link. One delegated listener in the
 * root layout covers every Buy button — /printables cards, gallery
 * modals, product pages and the homepage's featured cards. Buttons
 * that carry a data-product attribute report the product name; no
 * personal data is collected, and a missing/blocked gtag simply means
 * the event is skipped — the click itself is never intercepted.
 */
export default function BuyClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.(
        'a[href*="whop.com"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      try {
        window.gtag?.("event", "buy_click", {
          product_name: anchor.getAttribute("data-product") ?? undefined,
          link_url: anchor.href,
          page_path: window.location.pathname,
        });
      } catch {
        // Analytics must never break a click.
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
