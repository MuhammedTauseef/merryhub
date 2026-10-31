"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The product card's photo gallery on /printables, Etsy-style: the card
 * shows the cover image; clicking it (or the "View photos" line) opens
 * a modal gallery ON THE SAME PAGE — no new route — with a large image,
 * prev/next arrows, a thumbnail strip, and the product's name, price,
 * blurb and Buy button. Closes via the ✕ button, the backdrop, or the
 * Escape key; arrow keys move between photos.
 *
 * MOBILE FIX (31 Oct 2026): the modal is rendered through a portal to
 * <body>. It used to be rendered inside the product card (.tool-card),
 * whose :hover transform (translateY(-3px)) makes the card the
 * containing block for fixed-position descendants — on a phone the tap
 * itself triggers that hover state, so the "fixed" overlay was laid out
 * over the card instead of the viewport: the panel hung off the card,
 * mixed with the scrolling page, the backdrop covered only a band, and
 * the Close button could sit off-screen ("close bhi nahe hoti"). The
 * portal escapes the card subtree entirely. The overlay/panel/image are
 * additionally hard-capped to the dynamic viewport (100dvw / 100dvh,
 * min-width: 0 on the flex children, width: 100% + object-fit: contain
 * on the photo), the page behind is scroll-locked while the modal is
 * open, and the ✕ Close button is fixed to the viewport's top-right
 * corner with a 44px tap target so it is always reachable.
 *
 * Rendered only for products that HAVE gallery images. A product with
 * an empty gallery renders the plain card it has always had — this
 * component returns null and the page shows no trace of it.
 */
export default function ProductGallery({
  name,
  price,
  text,
  href,
  images,
}: {
  name: string;
  price: string;
  text: string;
  href: string;
  images: string[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const count = images.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  // Portals need the document; only render the modal after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    // Lock the page behind the modal so it cannot drift sideways or
    // scroll while the gallery is open; restored on close.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go]);

  if (count === 0) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — photos`}
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
        maxHeight: "100dvh",
        boxSizing: "border-box",
        background: "rgba(12, 18, 14, 0.88)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* Close lives OUTSIDE the scrolling panel, fixed to the
          viewport's top-right corner, so it can never be scrolled
          or pushed off-screen. 44px tap target. */}
      <button
        type="button"
        data-fixed-close="true"
        onClick={() => setOpen(false)}
        aria-label="Close photos"
        autoFocus
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          right: 12,
          zIndex: 1001,
          width: 44,
          height: 44,
          minWidth: 44,
          minHeight: 44,
          padding: 0,
          borderRadius: "50%",
          border: "2px solid var(--line, #e8ddc9)",
          background: "var(--paper, #fffdf7)",
          color: "var(--ink, #22301f)",
          fontSize: 18,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(6, 35, 26, 0.35)",
        }}
      >
        ✕
      </button>

      <div
        data-panel="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper, #fffdf7)",
          color: "var(--ink, #22301f)",
          maxWidth: 860,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          borderRadius: 14,
          padding: 18,
          maxHeight: "calc(100dvh - 32px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h3 style={{ margin: 0, paddingRight: 40 }}>
          {name} — {price}
        </h3>

        <div
          style={{
            position: "relative",
            marginTop: 12,
            width: "100%",
            minWidth: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`${name} — photo ${index + 1} of ${count}`}
            style={{
              display: "block",
              margin: "0 auto",
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "68dvh",
              objectFit: "contain",
              borderRadius: 10,
              background: "rgba(0, 0, 0, 0.04)",
            }}
          />
          {count > 1 && (
            <>
              <button
                type="button"
                className="btn btn-small btn-outline-dark"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ←
              </button>
              <button
                type="button"
                className="btn btn-small btn-outline-dark"
                onClick={() => go(1)}
                aria-label="Next photo"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                →
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              maxWidth: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 4,
            }}
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                style={{
                  padding: 0,
                  border:
                    i === index
                      ? "2px solid var(--red-600, #b3352c)"
                      : "2px solid transparent",
                  borderRadius: 8,
                  background: "none",
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{
                    width: 72,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 6,
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <p style={{ marginTop: 12 }}>{text}</p>
        <a
          className="btn btn-red"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy — {price} →
        </a>
        <p className="hint mt-24">
          Secure checkout by Whop • Personal use • Print at home on A4 or US Letter.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-label={`View photos of ${name}`}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={name}
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "3 / 2",
            objectFit: "cover",
            borderRadius: 10,
            display: "block",
          }}
        />
        <span className="hint" style={{ display: "block", marginTop: 6 }}>
          📷 View photos ({count})
        </span>
      </button>

      {open && mounted && createPortal(modal, document.body)}
    </>
  );
}
