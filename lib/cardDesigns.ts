import { cardFooterText } from "./site";

/** Deterministic PRNG so a design looks identical on every redraw. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CardData {
  to: string;
  message: string;
  from: string;
}

export interface CardDesign {
  id: string;
  name: string;
  headlineColor: string;
  textColor: string;
  subColor: string;
  footerColor: string;
  /** Vertical centre (0..1 of height) where the headline sits. */
  headlineY: number;
  drawBackground: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

function gradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stops: Array<[number, string]>,
  vertical = true,
): CanvasGradient {
  const g = vertical ? ctx.createLinearGradient(0, 0, 0, h) : ctx.createLinearGradient(0, 0, w, 0);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function snow(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, seed: number, alpha = 0.85) {
  const rng = mulberry32(seed);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let i = 0; i < count; i++) {
    const r = 1 + rng() * 3;
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function stars(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, seed: number) {
  const rng = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h * 0.55;
    const r = 1 + rng() * 2.2;
    ctx.fillStyle = `rgba(240,199,94,${0.5 + rng() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function pineTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, size: number, color: string) {
  ctx.fillStyle = color;
  const wHalf = size * 0.36;
  // three stacked tiers
  for (let t = 0; t < 3; t++) {
    const tierW = wHalf * (1 - t * 0.24);
    const tierTop = baseY - size * (0.98 - t * 0.26);
    const tierBottom = baseY - size * (0.52 - t * 0.26);
    ctx.beginPath();
    ctx.moveTo(x, tierTop);
    ctx.lineTo(x - tierW, tierBottom);
    ctx.lineTo(x + tierW, tierBottom);
    ctx.closePath();
    ctx.fill();
  }
  // trunk
  ctx.fillRect(x - size * 0.045, baseY - size * 0.06, size * 0.09, size * 0.08);
}

function treeRow(
  ctx: CanvasRenderingContext2D,
  w: number,
  baseY: number,
  color: string,
  seed: number,
  min: number,
  max: number,
) {
  const rng = mulberry32(seed);
  let x = -20;
  while (x < w + 20) {
    const size = min + rng() * (max - min);
    pineTree(ctx, x, baseY + rng() * 14, size, color);
    x += size * (0.55 + rng() * 0.5);
  }
}

function stringLights(ctx: CanvasRenderingContext2D, w: number, seed: number) {
  const rng = mulberry32(seed);
  const colors = ["#f0c75e", "#e4572e", "#7fb069", "#fff3d6", "#e63946"];
  for (let row = 0; row < 3; row++) {
    const yBase = 26 + row * 44;
    const sag = 34 + rng() * 22;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, yBase);
    ctx.quadraticCurveTo(w / 2, yBase + sag * 2, w + 10, yBase);
    ctx.stroke();
    const bulbs = 16;
    for (let i = 0; i <= bulbs; i++) {
      const t = i / bulbs;
      const x = -10 + (w + 20) * t;
      const y = (1 - t) * (1 - t) * yBase + 2 * (1 - t) * t * (yBase + sag * 2) + t * t * yBase;
      const c = colors[Math.floor(rng() * colors.length)];
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x, y + 8, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function wreath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const rng = mulberry32(99);
  // leafy ring: two offset rings of ellipses
  for (const ringR of [r, r * 0.82]) {
    const leaves = 42;
    for (let i = 0; i < leaves; i++) {
      const a = (i / leaves) * Math.PI * 2 + (ringR === r ? 0 : 0.07);
      const x = cx + Math.cos(a) * ringR;
      const y = cy + Math.sin(a) * ringR;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2 + (rng() - 0.5) * 0.5);
      ctx.fillStyle = i % 3 === 0 ? "#14634a" : "#0b3d2e";
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  // berries
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const x = cx + Math.cos(a) * r * 0.92;
    const y = cy + Math.sin(a) * r * 0.92;
    ctx.fillStyle = "#c0272d";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // gold bow at the bottom
  const bx = cx;
  const by = cy + r * 1.02;
  ctx.fillStyle = "#e3b341";
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx - 34, by - 16);
  ctx.lineTo(bx - 34, by + 18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + 34, by - 16);
  ctx.lineTo(bx + 34, by + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(bx, by, 9, 0, Math.PI * 2);
  ctx.fill();
}

export const CARD_DESIGNS: CardDesign[] = [
  {
    id: "midnight-pines",
    name: "Midnight Pines",
    headlineColor: "#f0c75e",
    textColor: "#fff9f0",
    subColor: "#ffe9a8",
    footerColor: "rgba(255,249,240,0.75)",
    headlineY: 0.24,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = gradient(ctx, w, h, [
        [0, "#04150e"],
        [0.45, "#0b3d2e"],
        [1, "#14532d"],
      ]);
      ctx.fillRect(0, 0, w, h);
      stars(ctx, w, h, 90, 11);
      // moon
      ctx.fillStyle = "#f7e7bd";
      ctx.beginPath();
      ctx.arc(w * 0.84, h * 0.16, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(4,21,14,0.10)";
      ctx.beginPath();
      ctx.arc(w * 0.84 - 14, h * 0.16 - 8, 9, 0, Math.PI * 2);
      ctx.arc(w * 0.84 + 12, h * 0.16 + 14, 6, 0, Math.PI * 2);
      ctx.fill();
      snow(ctx, w, h, 130, 12, 0.8);
      treeRow(ctx, w, h + 6, "#020d08", 13, 150, 260);
    },
  },
  {
    id: "crimson-cheer",
    name: "Crimson Cheer",
    headlineColor: "#ffe9a8",
    textColor: "#fff7ed",
    subColor: "#ffd9a0",
    footerColor: "rgba(255,247,237,0.8)",
    headlineY: 0.24,
    drawBackground(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h * 0.35, 80, w / 2, h * 0.5, w * 0.75);
      g.addColorStop(0, "#d43a31");
      g.addColorStop(0.55, "#b91c1c");
      g.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // gold bokeh
      const rng = mulberry32(21);
      for (let i = 0; i < 46; i++) {
        const r = 8 + rng() * 34;
        ctx.fillStyle = `rgba(240,199,94,${0.05 + rng() * 0.13})`;
        ctx.beginPath();
        ctx.arc(rng() * w, rng() * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      snow(ctx, w, h, 90, 22, 0.7);
      treeRow(ctx, w, h + 4, "rgba(255,243,214,0.92)", 23, 90, 170);
    },
  },
  {
    id: "golden-lights",
    name: "Golden Lights",
    headlineColor: "#f0c75e",
    textColor: "#fdf6e3",
    subColor: "#ffe9a8",
    footerColor: "rgba(253,246,227,0.7)",
    headlineY: 0.34,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = gradient(ctx, w, h, [
        [0, "#081426"],
        [0.6, "#0a1f38"],
        [1, "#123152"],
      ]);
      ctx.fillRect(0, 0, w, h);
      stars(ctx, w, h, 60, 31);
      stringLights(ctx, w, 32);
      snow(ctx, w, h, 110, 33, 0.75);
      treeRow(ctx, w, h + 6, "#050f1c", 34, 120, 210);
    },
  },
  {
    id: "snowy-day",
    name: "Snowy Day",
    headlineColor: "#991b1b",
    textColor: "#22302a",
    subColor: "#14634a",
    footerColor: "rgba(34,48,42,0.65)",
    headlineY: 0.22,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = gradient(ctx, w, h, [
        [0, "#bfdbfe"],
        [0.55, "#e3efff"],
        [1, "#ffffff"],
      ]);
      ctx.fillRect(0, 0, w, h);
      // soft sun
      ctx.fillStyle = "rgba(240,199,94,0.85)";
      ctx.beginPath();
      ctx.arc(w * 0.13, h * 0.15, 40, 0, Math.PI * 2);
      ctx.fill();
      // hills
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(w * 0.22, h * 1.06, w * 0.55, h * 0.30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.85, h * 1.08, w * 0.5, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      // trees on the hills
      const rng = mulberry32(41);
      for (let i = 0; i < 12; i++) {
        const x = rng() * w;
        const y = h * (0.82 + rng() * 0.14);
        pineTree(ctx, x, y, 60 + rng() * 70, i % 3 === 0 ? "#b91c1c" : "#14634a");
      }
      snow(ctx, w, h, 120, 42, 0.95);
    },
  },
  {
    id: "classic-wreath",
    name: "Classic Wreath",
    headlineColor: "#0b3d2e",
    textColor: "#22302a",
    subColor: "#991b1b",
    footerColor: "rgba(34,48,42,0.6)",
    headlineY: 0.56,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = gradient(ctx, w, h, [
        [0, "#fffdf6"],
        [1, "#f7ecd2"],
      ]);
      ctx.fillRect(0, 0, w, h);
      // faint corner sparkles
      stars(ctx, w, h, 26, 51);
      wreath(ctx, w / 2, h * 0.27, Math.min(w, h) * 0.155);
    },
  },
  {
    id: "candy-stripes",
    name: "Candy Stripes",
    headlineColor: "#f0c75e",
    textColor: "#fff9f0",
    subColor: "#ffe9a8",
    footerColor: "rgba(255,249,240,0.75)",
    headlineY: 0.26,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = "#0b3d2e";
      ctx.fillRect(0, 0, w, h);
      // striped frame
      const frame = Math.round(h * 0.075);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, frame);
      ctx.rect(0, h - frame, w, frame);
      ctx.rect(0, 0, frame, h);
      ctx.rect(w - frame, 0, frame, h);
      ctx.clip();
      ctx.fillStyle = "#fff7ed";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c0272d";
      const stripe = 56;
      for (let x = -h; x < w + h; x += stripe * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripe, 0);
        ctx.lineTo(x + stripe - h * 0.35, h);
        ctx.lineTo(x - h * 0.35, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "#e3b341";
      ctx.lineWidth = 4;
      ctx.strokeRect(frame + 8, frame + 8, w - frame * 2 - 16, h - frame * 2 - 16);
      const rng = mulberry32(61);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(240,199,94,${0.10 + rng() * 0.16})`;
        ctx.beginPath();
        ctx.arc(frame + 30 + rng() * (w - frame * 2 - 60), frame + 30 + rng() * (h - frame * 2 - 60), 5 + rng() * 14, 0, Math.PI * 2);
        ctx.fill();
      }
      snow(ctx, w, h, 80, 62, 0.8);
    },
  },
];

export function getDesign(id: string): CardDesign {
  return CARD_DESIGNS.find((d) => d.id === id) ?? CARD_DESIGNS[0];
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

/** Draws the complete card (background + texts + footer) at w×h. */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  design: CardDesign,
  data: CardData,
  w: number,
  h: number,
  host?: string,
) {
  design.drawBackground(ctx, w, h);
  const scale = w / 1200;
  const cx = w / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // headline
  ctx.fillStyle = design.headlineColor;
  ctx.font = `700 ${Math.round(88 * scale)}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("Merry Christmas", cx, h * design.headlineY);

  let y = h * design.headlineY + 92 * scale;

  if (data.to.trim()) {
    ctx.fillStyle = design.subColor;
    ctx.font = `italic 600 ${Math.round(44 * scale)}px Georgia, serif`;
    ctx.fillText(`For ${data.to.trim()}`, cx, y);
    y += 66 * scale;
  }

  const message =
    data.message.trim() || "Wishing you a Christmas filled with warmth, laughter and love.";
  ctx.fillStyle = design.textColor;
  ctx.font = `${Math.round(41 * scale)}px Georgia, serif`;
  const lines = wrapLines(ctx, message, w * 0.78);
  const lineHeight = 58 * scale;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }

  if (data.from.trim()) {
    ctx.fillStyle = design.subColor;
    ctx.font = `italic ${Math.round(37 * scale)}px Georgia, serif`;
    ctx.fillText(`— With love, ${data.from.trim()}`, cx, h - 108 * scale);
  }

  // footer — the sharing loop
  ctx.fillStyle = design.footerColor;
  ctx.font = `600 ${Math.round(25 * scale)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText(cardFooterText(host), cx, h - 42 * scale);
}
