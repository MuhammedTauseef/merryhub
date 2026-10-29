"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CARD_DESIGNS, drawCard, getDesign, type CardData } from "@/lib/cardDesigns";
import { SITE_NAME } from "@/lib/site";

const CARD_W = 1200;
const CARD_H = 800;

function Swatch({
  designId,
  selected,
  onSelect,
}: {
  designId: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const design = getDesign(designId);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawCard(
      ctx,
      design,
      { to: "For You", message: "Wishing you a joyful Christmas!", from: "" },
      canvas.width,
      canvas.height,
      "merryhub",
    );
  }, [design]);

  return (
    <button
      type="button"
      className={`swatch${selected ? " selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Design: ${design.name}`}
    >
      <canvas ref={ref} width={300} height={200} />
      <span className="swatch-name">{design.name}</span>
    </button>
  );
}

export default function CardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [designId, setDesignId] = useState(CARD_DESIGNS[0].id);
  const [data, setData] = useState<CardData>({ to: "", message: "", from: "" });
  const [notice, setNotice] = useState<string>("");
  const [showShareLinks, setShowShareLinks] = useState(false);

  // Prefill from /wishes "Make a card with this" links: ?wish=...&to=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wish = params.get("wish");
    const to = params.get("to");
    if (wish || to) {
      setData((d) => ({
        to: to ? to.slice(0, 40) : d.to,
        message: wish ? wish.slice(0, 220) : d.message,
        from: d.from,
      }));
    }
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawCard(ctx, getDesign(designId), data, CARD_W, CARD_H, window.location.host);
  }, [designId, data]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merryhub-christmas-card.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash("Your card picture is downloading — send it to someone you love! 🎄");
    }, "image/png");
  };

  const shareText = `🎄 I made you a Christmas card on ${SITE_NAME}! Make your own free card here:`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/card-maker` : "";

  const share = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) {
      const file = new File([blob], "merryhub-christmas-card.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
        try {
          await navigator.share({ files: [file], title: "Merry Christmas!", text: shareText });
          return;
        } catch {
          /* user cancelled — fall through to links */
        }
      } else if (navigator.share) {
        try {
          await navigator.share({ title: "Merry Christmas!", text: `${shareText} ${shareUrl}` });
          return;
        } catch {
          /* fall through */
        }
      }
    }
    setShowShareLinks(true);
    flash("Use the WhatsApp or Facebook buttons below to share your card.");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash("Link copied — paste it anywhere to share MerryHub.");
    } catch {
      flash(shareUrl);
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="maker-grid">
      <div className="panel">
        <div className="field">
          <label>1 · Pick a design</label>
          <div className="design-swatches">
            {CARD_DESIGNS.map((d) => (
              <Swatch
                key={d.id}
                designId={d.id}
                selected={d.id === designId}
                onSelect={() => setDesignId(d.id)}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="card-to">2 · Who is it for?</label>
          <input
            id="card-to"
            type="text"
            maxLength={40}
            placeholder="e.g. Grandma, Team Sunshine, My Best Friend"
            value={data.to}
            onChange={(e) => setData((d) => ({ ...d, to: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="card-message">3 · Your message</label>
          <textarea
            id="card-message"
            maxLength={220}
            placeholder="Wishing you a Christmas filled with warmth, laughter and love."
            value={data.message}
            onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
          />
          <p className="hint">{data.message.length}/220 — or pick a ready-made wish from the library.</p>
        </div>
        <div className="field">
          <label htmlFor="card-from">4 · From</label>
          <input
            id="card-from"
            type="text"
            maxLength={40}
            placeholder="Your name"
            value={data.from}
            onChange={(e) => setData((d) => ({ ...d, from: e.target.value }))}
          />
        </div>
        <button type="button" className="btn btn-red" onClick={download} style={{ width: "100%" }}>
          ⬇ Download card as a picture
        </button>
        <button type="button" className="btn btn-gold mt-24" onClick={share} style={{ width: "100%" }}>
          📤 Share this card
        </button>
        {notice && (
          <p className="placeholder-note mt-24" role="status">
            {notice}
          </p>
        )}
      </div>

      <div>
        <div className="card-preview-wrap">
          <canvas ref={canvasRef} width={CARD_W} height={CARD_H} className="card-preview" aria-label="Preview of your Christmas card" />
        </div>
        <div className="share-row">
          <a className="share-btn share-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <a className="share-btn share-facebook" href={facebookHref} target="_blank" rel="noopener noreferrer">
            Share on Facebook
          </a>
          <button type="button" className="share-btn share-copy" onClick={copyLink}>
            Copy link
          </button>
        </div>
        {showShareLinks && (
          <p className="hint center mt-24">
            Tip: download the card picture first, then attach it in WhatsApp or Facebook so your
            friends see the actual card — it carries a little “Made with {SITE_NAME}” note so they
            can make their own.
          </p>
        )}
      </div>
    </div>
  );
}
