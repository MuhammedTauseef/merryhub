"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The product card's photo gallery on /printables, Etsy-style: the card
 * shows the cover image; clicking it (or the "View photos" line) opens
 * a modal gallery ON THE SAME PAGE — no new route — with a large image,
 * prev/next arrows, a thumbnail strip, and the product's name, price,
 * blurb and Buy button. Closes via the ✕ button, the backdrop, or the
 * Escape key; arrow keys move between photos.
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
  const count = images.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (count === 0) return null;

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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — photos`}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(12, 18, 14, 0.88)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--paper, #fffdf7)",
              color: "var(--ink, #22301f)",
              maxWidth: 860,
              width: "100%",
              borderRadius: 14,
              padding: 18,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {name} — {price}
              </h3>
              <button
                type="button"
                className="btn btn-small btn-outline-dark"
                onClick={() => setOpen(false)}
                aria-label="Close photos"
                autoFocus
              >
                ✕ Close
              </button>
            </div>

            <div style={{ position: "relative", marginTop: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[index]}
                alt={`${name} — photo ${index + 1} of ${count}`}
                style={{
                  display: "block",
                  margin: "0 auto",
                  maxWidth: "100%",
                  maxHeight: "58vh",
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
                  overflowX: "auto",
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
      )}
    </>
  );
}
