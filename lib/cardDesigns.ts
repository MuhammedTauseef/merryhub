import { cardFooterText } from "./site";

/**
 * Card designs v2 (2026-10-30) — high-level upgrade of the card-maker artwork.
 * Drop-in replacement for lib/cardDesigns.ts: same exports, same CardDesign
 * contract, same drawCard() text composition (positions, fonts, sizes, wrap).
 * Only the artwork (drawBackground + palettes + headlineY where noted) changed.
 * All artwork is drawn relative to w/h so the 300×200 picker swatch and the
 * 1200×800 download render the identical composition, and every scene keeps
 * the fixed text zones clear (headline band, message block, from/footer strip).
 */

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

/* ------------------------------------------------------------------ */
/* Shared toolkit (all sizes relative to w/h — swatch == full size)    */
/* ------------------------------------------------------------------ */

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

function radial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  stops: Array<[number, string]>,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Four-point star flare (the sparkle on quality card art). */
function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 0.9,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function starDots(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  seed: number,
  maxY = 0.55,
) {
  const rng = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h * maxY;
    const r = (0.6 + rng() * 1.9) * (h / 800);
    ctx.fillStyle = `rgba(245,214,130,${0.35 + rng() * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(r, 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
  // a few true sparkles among the dots
  for (let i = 0; i < Math.round(count / 9); i++) {
    sparkle(ctx, rng() * w, rng() * h * maxY, (5 + rng() * 6) * (h / 800), "#ffe9a8", 0.55 + rng() * 0.4);
  }
}

/** Layered snowfall: fine dots + a few drawn six-arm flakes. */
function snowFall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  seed: number,
  alpha = 0.85,
  color = "255,255,255",
) {
  const rng = mulberry32(seed);
  const s = h / 800;
  for (let i = 0; i < count; i++) {
    const r = (0.8 + rng() * 2.6) * s;
    ctx.fillStyle = `rgba(${color},${alpha * (0.35 + rng() * 0.65)})`;
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, Math.max(r, 0.6), 0, Math.PI * 2);
    ctx.fill();
  }
  const flakes = Math.round(count / 16);
  ctx.strokeStyle = `rgba(${color},${alpha})`;
  ctx.lineWidth = Math.max(1.1 * s, 0.7);
  for (let i = 0; i < flakes; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (4.5 + rng() * 4) * s;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rng() * Math.PI);
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      const bx = Math.cos(ang) * r * 0.62;
      const by = Math.sin(ang) * r * 0.62;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ang + 0.7) * r * 0.34, by + Math.sin(ang + 0.7) * r * 0.34);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ang - 0.7) * r * 0.34, by + Math.sin(ang - 0.7) * r * 0.34);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/** A pine tree with curved, scalloped tiers and a snow line on each tier. */
function pineDetailed(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  size: number,
  body: string,
  snowCol: string | null,
  seed: number,
) {
  const rng = mulberry32(seed);
  ctx.fillStyle = "rgba(20,12,6,0.85)";
  ctx.fillRect(x - size * 0.032, baseY - size * 0.055, size * 0.064, size * 0.06);
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const f = i / (tiers - 1); // 0 = bottom tier
    const halfW = size * 0.37 * (1 - f * 0.52);
    const apexY = baseY - size * (0.40 + f * 0.205);
    const botY = baseY - size * (0.05 + f * 0.205);
    const jx = (rng() - 0.5) * size * 0.02;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x + jx, apexY);
    ctx.quadraticCurveTo(x + jx - halfW * 0.55, apexY + (botY - apexY) * 0.45, x + jx - halfW, botY - size * 0.03);
    // scalloped lower edge: three drooping arcs
    for (let sc = 0; sc < 3; sc++) {
      const x0 = x + jx - halfW + (sc / 3) * halfW * 2;
      const x1 = x + jx - halfW + ((sc + 1) / 3) * halfW * 2;
      ctx.quadraticCurveTo((x0 + x1) / 2, botY + size * 0.035, x1, botY - size * 0.03);
    }
    ctx.quadraticCurveTo(x + jx + halfW * 0.55, apexY + (botY - apexY) * 0.45, x + jx, apexY);
    ctx.fill();
    if (snowCol) {
      ctx.strokeStyle = snowCol;
      ctx.lineWidth = Math.max(size * 0.012, 0.7);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + jx - halfW * 0.52, apexY + (botY - apexY) * 0.47);
      ctx.quadraticCurveTo(x + jx - halfW * 0.2, apexY + (botY - apexY) * 0.18, x + jx, apexY + size * 0.012);
      ctx.quadraticCurveTo(x + jx + halfW * 0.2, apexY + (botY - apexY) * 0.18, x + jx + halfW * 0.52, apexY + (botY - apexY) * 0.47);
      ctx.stroke();
    }
  }
}

/**
 * A row of detailed pines along the bottom. Sizes are fractions of h.
 * `gap` (fractions of w) leaves a clear window — used to keep the centred
 * from/footer strip free of silhouettes.
 */
function forestRow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: {
    baseY: number; // fraction of h
    color: string;
    snow: string | null;
    seed: number;
    min: number; // fraction of h
    max: number;
    gap?: [number, number];
    step?: number;
  },
) {
  const rng = mulberry32(opts.seed);
  const baseY = opts.baseY * h;
  let x = -0.02 * w;
  while (x < w * 1.02) {
    const size = (opts.min + rng() * (opts.max - opts.min)) * h;
    const cxTree = x + size * 0.2;
    const inGap = opts.gap && cxTree > opts.gap[0] * w && cxTree < opts.gap[1] * w;
    if (!inGap) {
      pineDetailed(ctx, cxTree, baseY + rng() * h * 0.012, size, opts.color, opts.snow, opts.seed * 1000 + Math.round(x));
    }
    x += size * (opts.step ?? 0.62) * (0.75 + rng() * 0.5);
  }
}

/** Glossy bauble with highlight, gold cap and hanging string. */
function bauble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  base: string,
  dark: string,
  stringTo?: number,
) {
  if (stringTo !== undefined) {
    ctx.strokeStyle = "rgba(240,199,94,0.75)";
    ctx.lineWidth = Math.max(r * 0.07, 0.8);
    ctx.beginPath();
    ctx.moveTo(x, stringTo);
    ctx.lineTo(x, y - r * 1.12);
    ctx.stroke();
  }
  ctx.fillStyle = "#c9973f";
  ctx.fillRect(x - r * 0.28, y - r * 1.24, r * 0.56, r * 0.24);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.25, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.36, y - r * 0.44, r * 0.20, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function berryCluster(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const pts: Array<[number, number, number]> = [
    [0, 0, 0.42],
    [-0.5, 0.28, 0.34],
    [0.48, 0.3, 0.36],
  ];
  for (const [dx, dy, rr] of pts) {
    const bx = x + dx * s;
    const by = y + dy * s;
    const r = rr * s;
    const g = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.35, r * 0.15, bx, by, r);
    g.addColorStop(0, "#e8604c");
    g.addColorStop(0.55, "#c0272d");
    g.addColorStop(1, "#7e1414");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(bx - r * 0.32, by - r * 0.38, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Pointed holly leaf with a centre vein. len = full length. */
function hollyLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  wid: number,
  rot: number,
  color: string,
  vein: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  ctx.quadraticCurveTo(-len * 0.28, -wid * 0.95, 0, -wid * 0.42);
  ctx.quadraticCurveTo(len * 0.16, -wid * 0.88, len / 2, 0);
  ctx.quadraticCurveTo(len * 0.16, wid * 0.88, 0, wid * 0.42);
  ctx.quadraticCurveTo(-len * 0.28, wid * 0.95, -len / 2, 0);
  ctx.fill();
  ctx.strokeStyle = vein;
  ctx.lineWidth = Math.max(len * 0.03, 0.6);
  ctx.beginPath();
  ctx.moveTo(-len * 0.42, 0);
  ctx.lineTo(len * 0.42, 0);
  ctx.stroke();
  ctx.restore();
}

/** Ribbon bow with loops, notched tails and a gold knot. w = total width. */
function ribbonBow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  wdt: number,
  main = "#c0272d",
  shade = "#7e1414",
  light = "#e0483c",
) {
  const hgt = wdt * 0.34;
  // tails
  ctx.fillStyle = shade;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * wdt * 0.06, cy + hgt * 0.2);
    ctx.lineTo(cx + dir * wdt * 0.34, cy + hgt * 1.15);
    ctx.lineTo(cx + dir * wdt * 0.20, cy + hgt * 1.22);
    ctx.lineTo(cx + dir * wdt * 0.13, cy + hgt * 0.72);
    ctx.lineTo(cx + dir * wdt * 0.02, cy + hgt * 1.05);
    ctx.closePath();
    ctx.fill();
  }
  // loops
  for (const dir of [-1, 1]) {
    const g = ctx.createLinearGradient(cx, cy - hgt, cx + dir * wdt * 0.5, cy + hgt * 0.6);
    g.addColorStop(0, light);
    g.addColorStop(0.55, main);
    g.addColorStop(1, shade);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx + dir * wdt * 0.27, cy, wdt * 0.27, hgt * 0.62, dir * -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.ellipse(cx + dir * wdt * 0.24, cy + hgt * 0.05, wdt * 0.15, hgt * 0.34, dir * -0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  // knot
  const kg = ctx.createRadialGradient(cx - wdt * 0.03, cy - hgt * 0.2, 1, cx, cy, wdt * 0.11);
  kg.addColorStop(0, "#ffe9a8");
  kg.addColorStop(0.6, "#e3b341");
  kg.addColorStop(1, "#9a6b14");
  ctx.fillStyle = kg;
  ctx.beginPath();
  ctx.arc(cx, cy, wdt * 0.105, 0, Math.PI * 2);
  ctx.fill();
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  const g = ctx.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.42, w / 2, h * 0.52, Math.max(w, h) * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Soft warm lift behind the headline so the gold type feels foil-printed. */
function headlineGlow(ctx: CanvasRenderingContext2D, w: number, h: number, yFrac: number) {
  radial(ctx, w / 2, h * yFrac, w * 0.36, [
    [0, "rgba(240,199,94,0.13)"],
    [0.6, "rgba(240,199,94,0.05)"],
    [1, "rgba(240,199,94,0)"],
  ]);
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ------------------------------------------------------------------ */
/* The six designs                                                     */
/* ------------------------------------------------------------------ */

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
        [0, "#03120c"],
        [0.45, "#0b3d2e"],
        [0.78, "#114a33"],
        [1, "#17573a"],
      ]);
      ctx.fillRect(0, 0, w, h);
      // aurora ribbons — broad, very soft diagonal light
      ctx.save();
      ctx.translate(w * 0.34, h * 0.10);
      ctx.rotate(-0.42);
      radial(ctx, 0, 0, w * 0.42, [
        [0, "rgba(45,212,191,0.10)"],
        [0.55, "rgba(45,212,191,0.04)"],
        [1, "rgba(45,212,191,0)"],
      ]);
      ctx.restore();
      ctx.save();
      ctx.translate(w * 0.62, h * 0.16);
      ctx.rotate(-0.42);
      radial(ctx, 0, 0, w * 0.34, [
        [0, "rgba(134,239,172,0.07)"],
        [1, "rgba(134,239,172,0)"],
      ]);
      ctx.restore();
      starDots(ctx, w, h, 95, 11, 0.5);
      // moon with halo and soft craters
      const mx = w * 0.845;
      const my = h * 0.155;
      const mr = h * 0.058;
      radial(ctx, mx, my, mr * 3.1, [
        [0, "rgba(247,231,189,0.30)"],
        [0.4, "rgba(247,231,189,0.10)"],
        [1, "rgba(247,231,189,0)"],
      ]);
      const mg = ctx.createRadialGradient(mx - mr * 0.35, my - mr * 0.3, mr * 0.2, mx, my, mr);
      mg.addColorStop(0, "#fdf6da");
      mg.addColorStop(0.75, "#f3dfae");
      mg.addColorStop(1, "#e6cd8d");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(190,160,95,0.20)";
      for (const [dx, dy, rr] of [
        [-0.3, -0.15, 0.17],
        [0.25, 0.3, 0.12],
        [0.05, -0.45, 0.09],
        [-0.5, 0.35, 0.08],
      ] as Array<[number, number, number]>) {
        ctx.beginPath();
        ctx.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, Math.PI * 2);
        ctx.fill();
      }
      headlineGlow(ctx, w, h, 0.24);
      snowFall(ctx, w, h, 130, 12, 0.75);
      // distant ridge
      ctx.fillStyle = "#07271b";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.90);
      ctx.quadraticCurveTo(w * 0.28, h * 0.845, w * 0.52, h * 0.885);
      ctx.quadraticCurveTo(w * 0.78, h * 0.92, w, h * 0.875);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      // layered forest — near row parts around the centred signature strip
      forestRow(ctx, w, h, { baseY: 1.0, color: "#0a3524", snow: null, seed: 13, min: 0.15, max: 0.27 });
      forestRow(ctx, w, h, { baseY: 1.005, color: "#051f14", snow: "rgba(214,238,226,0.26)", seed: 14, min: 0.21, max: 0.36 });
      forestRow(ctx, w, h, {
        baseY: 1.01,
        color: "#020c07",
        snow: "rgba(226,244,234,0.40)",
        seed: 15,
        min: 0.27,
        max: 0.46,
        gap: [0.335, 0.665],
      });
      // gold dust near the treeline
      const rng = mulberry32(16);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = `rgba(240,199,94,${0.25 + rng() * 0.5})`;
        ctx.beginPath();
        ctx.arc(rng() * w, h * (0.86 + rng() * 0.13), 0.8 + rng() * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      vignette(ctx, w, h, 0.22);
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
      const g = ctx.createRadialGradient(w / 2, h * 0.36, 60, w / 2, h * 0.5, w * 0.78);
      g.addColorStop(0, "#dd4237");
      g.addColorStop(0.5, "#b91c1c");
      g.addColorStop(1, "#6d0f0f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // warm gold bokeh — soft radial discs, not flat circles
      const rng = mulberry32(21);
      for (let i = 0; i < 38; i++) {
        const x = rng() * w;
        const y = rng() * h;
        const r = (0.015 + rng() * 0.05) * h;
        radial(ctx, x, y, r, [
          [0, `rgba(255,205,110,${0.10 + rng() * 0.10})`],
          [1, "rgba(255,205,110,0)"],
        ]);
      }
      for (let i = 0; i < 7; i++) {
        sparkle(ctx, rng() * w, rng() * h * 0.6, (5 + rng() * 7) * (h / 800), "#ffd9a0", 0.5 + rng() * 0.35);
      }
      // garland swag across the top with baubles, berries and a centre bow
      const swag = (x0: number, x1: number, dip: number) => {
        const steps = 26;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = x0 + (x1 - x0) * t;
          const y = h * 0.012 + Math.sin(t * Math.PI) * dip * h;
          const s = h * 0.016 * (0.75 + 0.45 * Math.sin(t * Math.PI));
          hollyLeaf(ctx, x, y + s * 0.4, s * 2.1, s * 1.05, Math.PI / 2 + (i % 2 ? 0.5 : -0.5), i % 3 ? "#0b3d2e" : "#14634a", "rgba(6,30,20,0.55)");
        }
        for (let i = 1; i < 6; i++) {
          const t = i / 6;
          const x = x0 + (x1 - x0) * t;
          const y = h * 0.012 + Math.sin(t * Math.PI) * dip * h;
          if (i % 2) {
            bauble(ctx, x, y + h * 0.020, h * 0.0115, "#e3b341", "#7a5210");
          } else {
            berryCluster(ctx, x, y + h * 0.018, h * 0.016);
          }
        }
      };
      swag(w * 0.015, w * 0.5, 0.055);
      swag(w * 0.5, w * 0.985, 0.055);
      ribbonBow(ctx, w * 0.5, h * 0.075, w * 0.052, "#c9973f", "#7a5210", "#f5d67a");
      headlineGlow(ctx, w, h, 0.24);
      snowFall(ctx, w, h, 80, 22, 0.5);
      // deep-red forest (v1's cream trees washed the footer out) with snow dusting
      forestRow(ctx, w, h, { baseY: 1.0, color: "#8f1512", snow: null, seed: 23, min: 0.13, max: 0.23 });
      forestRow(ctx, w, h, {
        baseY: 1.01,
        color: "#570c0b",
        snow: "rgba(255,240,214,0.38)",
        seed: 24,
        min: 0.19,
        max: 0.32,
        gap: [0.35, 0.65],
      });
      // warm lights dotted on the front trees + soft ground shade for the footer
      const rng2 = mulberry32(25);
      for (let i = 0; i < 30; i++) {
        const x = rng2() * w;
        if (x > w * 0.35 && x < w * 0.65) continue;
        ctx.fillStyle = `rgba(255,205,110,${0.5 + rng2() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, h * (0.82 + rng2() * 0.16), 1 + rng2() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      const shade = ctx.createLinearGradient(0, h * 0.86, 0, h);
      shade.addColorStop(0, "rgba(43,4,4,0)");
      shade.addColorStop(1, "rgba(43,4,4,0.38)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      vignette(ctx, w, h, 0.18);
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
        [0, "#060f1f"],
        [0.55, "#0a2038"],
        [1, "#14355c"],
      ]);
      ctx.fillRect(0, 0, w, h);
      starDots(ctx, w, h, 55, 31, 0.3);
      // three swags of glowing string lights (halo + core, no shadowBlur)
      const bulbCols: Array<[string, string]> = [
        ["#ffd166", "#b97e10"],
        ["#ff7a66", "#a52a1c"],
        ["#9ad79b", "#3f7a3c"],
        ["#fff3d6", "#c9a44e"],
        ["#ffb056", "#a85e10"],
      ];
      const rngL = mulberry32(32);
      const rows: Array<[number, number]> = [
        [0.028, 0.045],
        [0.082, 0.055],
        [0.136, 0.05],
      ];
      for (const [baseF, sagF] of rows) {
        const yBase = baseF * h;
        const sag = sagF * h;
        ctx.strokeStyle = "rgba(205,225,255,0.38)";
        ctx.lineWidth = Math.max(1.6 * (h / 800), 0.8);
        ctx.beginPath();
        ctx.moveTo(-w * 0.01, yBase);
        ctx.quadraticCurveTo(w / 2, yBase + sag * 2, w * 1.01, yBase);
        ctx.stroke();
        const bulbs = 17;
        for (let i = 0; i <= bulbs; i++) {
          const t = i / bulbs;
          const x = -w * 0.01 + w * 1.02 * t;
          const y = (1 - t) * (1 - t) * yBase + 2 * (1 - t) * t * (yBase + sag * 2) + t * t * yBase;
          const [core] = bulbCols[Math.floor(rngL() * bulbCols.length)];
          const r = h * 0.0085;
          radial(ctx, x, y + r * 1.6, r * 3.4, [
            [0, "rgba(255,225,160,0.5)"],
            [0.35, "rgba(255,205,110,0.16)"],
            [1, "rgba(255,205,110,0)"],
          ]);
          ctx.fillStyle = "#2b2b2b";
          ctx.fillRect(x - r * 0.32, y + r * 0.4, r * 0.64, r * 0.6);
          const bg = ctx.createRadialGradient(x - r * 0.3, y + r * 1.35, r * 0.2, x, y + r * 1.7, r * 1.05);
          bg.addColorStop(0, "#ffffff");
          bg.addColorStop(0.3, core);
          bg.addColorStop(1, "rgba(0,0,0,0.25)");
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(x, y + r * 1.7, r * 1.02, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      headlineGlow(ctx, w, h, 0.34);
      snowFall(ctx, w, h, 105, 33, 0.7);
      // snowy ground
      ctx.fillStyle = "#081a30";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.905);
      ctx.quadraticCurveTo(w * 0.3, h * 0.865, w * 0.55, h * 0.90);
      ctx.quadraticCurveTo(w * 0.8, h * 0.93, w, h * 0.885);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      // cottage silhouettes with lit windows, flanking the text column
      const cottage = (x: number, yBase: number, cw: number, chh: number, seed: number) => {
        const rng = mulberry32(seed);
        ctx.fillStyle = "#040b16";
        ctx.fillRect(x, yBase - chh, cw, chh);
        ctx.beginPath();
        ctx.moveTo(x - cw * 0.1, yBase - chh);
        ctx.lineTo(x + cw * 0.5, yBase - chh * 1.42);
        ctx.lineTo(x + cw * 1.1, yBase - chh);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(230,242,255,0.85)";
        ctx.lineWidth = Math.max(chh * 0.045, 1);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - cw * 0.06, yBase - chh * 1.02);
        ctx.lineTo(x + cw * 0.5, yBase - chh * 1.40);
        ctx.lineTo(x + cw * 1.06, yBase - chh * 1.02);
        ctx.stroke();
        // chimney + smoke curls
        ctx.fillStyle = "#040b16";
        ctx.fillRect(x + cw * 0.68, yBase - chh * 1.52, cw * 0.13, chh * 0.3);
        for (let sIdx = 0; sIdx < 3; sIdx++) {
          radial(ctx, x + cw * 0.75 + sIdx * cw * 0.07, yBase - chh * (1.6 + sIdx * 0.16), cw * 0.075, [
            [0, "rgba(210,225,245,0.20)"],
            [1, "rgba(210,225,245,0)"],
          ]);
        }
        // lit windows + door
        const win = (wx: number, wy: number) => {
          radial(ctx, wx, wy, cw * 0.14, [
            [0, "rgba(255,205,110,0.35)"],
            [1, "rgba(255,205,110,0)"],
          ]);
          ctx.fillStyle = "#ffd98a";
          ctx.fillRect(wx - cw * 0.055, wy - cw * 0.07, cw * 0.11, cw * 0.14);
          ctx.strokeStyle = "rgba(4,11,22,0.8)";
          ctx.lineWidth = 1;
          ctx.strokeRect(wx - cw * 0.055, wy - cw * 0.07, cw * 0.11, cw * 0.14);
        };
        win(x + cw * 0.26, yBase - chh * 0.62);
        if (rng() > 0.3) win(x + cw * 0.74, yBase - chh * 0.62);
        ctx.fillStyle = "#0a1c33";
        ctx.fillRect(x + cw * 0.44, yBase - chh * 0.34, cw * 0.13, chh * 0.34);
      };
      cottage(w * 0.045, h * 0.985, w * 0.115, h * 0.115, 71);
      cottage(w * 0.175, h * 0.978, w * 0.085, h * 0.088, 72);
      cottage(w * 0.845, h * 0.982, w * 0.105, h * 0.105, 73);
      // lamp posts framing the signature strip
      for (const lx of [w * 0.315, w * 0.685]) {
        ctx.strokeStyle = "#040b16";
        ctx.lineWidth = Math.max(h * 0.005, 2);
        ctx.beginPath();
        ctx.moveTo(lx, h * 0.975);
        ctx.lineTo(lx, h * 0.845);
        ctx.stroke();
        radial(ctx, lx, h * 0.83, h * 0.052, [
          [0, "rgba(255,214,130,0.55)"],
          [0.4, "rgba(255,190,90,0.18)"],
          [1, "rgba(255,190,90,0)"],
        ]);
        ctx.fillStyle = "#ffe1a0";
        ctx.beginPath();
        ctx.arc(lx, h * 0.83, h * 0.0105, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#040b16";
        ctx.beginPath();
        ctx.moveTo(lx - h * 0.014, h * 0.822);
        ctx.lineTo(lx, h * 0.806);
        ctx.lineTo(lx + h * 0.014, h * 0.822);
        ctx.closePath();
        ctx.fill();
      }
      pineDetailed(ctx, w * 0.255, h * 0.985, h * 0.16, "#040b16", "rgba(220,238,255,0.4)", 74);
      pineDetailed(ctx, w * 0.955, h * 0.99, h * 0.185, "#040b16", "rgba(220,238,255,0.4)", 75);
      pineDetailed(ctx, w * 0.775, h * 0.978, h * 0.12, "#040b16", "rgba(220,238,255,0.35)", 76);
      vignette(ctx, w, h, 0.16);
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
        [0, "#a9cdf5"],
        [0.5, "#dcecfd"],
        [1, "#f7fbff"],
      ]);
      ctx.fillRect(0, 0, w, h);
      // sun with a soft halo
      radial(ctx, w * 0.115, h * 0.125, h * 0.16, [
        [0, "rgba(250,214,120,0.75)"],
        [0.35, "rgba(250,214,120,0.28)"],
        [1, "rgba(250,214,120,0)"],
      ]);
      const sg = ctx.createRadialGradient(w * 0.115 - h * 0.016, h * 0.125 - h * 0.016, 2, w * 0.115, h * 0.125, h * 0.046);
      sg.addColorStop(0, "#fff3c4");
      sg.addColorStop(1, "#f5c95e");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(w * 0.115, h * 0.125, h * 0.046, 0, Math.PI * 2);
      ctx.fill();
      // soft clouds at the top corners (centre sky stays pale for the dark text)
      const cloud = (cx: number, cy: number, s: number) => {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (const [dx, dy, rr] of [
          [0, 0, 1],
          [-0.9, 0.16, 0.68],
          [0.9, 0.18, 0.72],
          [0.35, -0.3, 0.62],
          [-0.4, -0.24, 0.55],
        ] as Array<[number, number, number]>) {
          ctx.beginPath();
          ctx.ellipse(cx + dx * s, cy + dy * s, rr * s, rr * s * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      cloud(w * 0.035, h * 0.075, h * 0.052);
      cloud(w * 0.965, h * 0.06, h * 0.06);
      cloud(w * 0.79, h * 0.145, h * 0.034);
      // two distant birds
      ctx.strokeStyle = "rgba(60,90,130,0.55)";
      ctx.lineWidth = Math.max(h * 0.0022, 0.8);
      for (const [bx, by, bs] of [
        [0.885, 0.235, 0.016],
        [0.925, 0.265, 0.012],
      ] as Array<[number, number, number]>) {
        ctx.beginPath();
        ctx.arc(w * bx - h * bs, h * by, h * bs, Math.PI * 1.15, Math.PI * 1.75);
        ctx.arc(w * bx + h * bs, h * by, h * bs, Math.PI * 1.25, Math.PI * 1.85);
        ctx.stroke();
      }
      // rolling hills: far band, then the bright near field with crest shading
      ctx.fillStyle = "#e6effc";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.80);
      ctx.quadraticCurveTo(w * 0.3, h * 0.745, w * 0.58, h * 0.795);
      ctx.quadraticCurveTo(w * 0.82, h * 0.835, w, h * 0.79);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.875);
      ctx.quadraticCurveTo(w * 0.35, h * 0.815, w * 0.66, h * 0.865);
      ctx.quadraticCurveTo(w * 0.86, h * 0.895, w, h * 0.875);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(168,196,238,0.65)";
      ctx.lineWidth = Math.max(h * 0.0035, 1);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.878);
      ctx.quadraticCurveTo(w * 0.35, h * 0.818, w * 0.66, h * 0.868);
      ctx.stroke();
      // small pines on the hills — greens only, snow-capped
      pineDetailed(ctx, w * 0.075, h * 0.885, h * 0.115, "#14634a", "rgba(255,255,255,0.85)", 81);
      pineDetailed(ctx, w * 0.185, h * 0.862, h * 0.088, "#0e4d38", "rgba(255,255,255,0.8)", 82);
      pineDetailed(ctx, w * 0.665, h * 0.885, h * 0.095, "#14634a", "rgba(255,255,255,0.85)", 83);
      pineDetailed(ctx, w * 0.735, h * 0.905, h * 0.125, "#0e4d38", "rgba(255,255,255,0.8)", 84);
      // feature tree, decorated — bottom right, clear of the text block
      pineDetailed(ctx, w * 0.885, h * 0.995, h * 0.30, "#0e4d38", "rgba(255,255,255,0.9)", 85);
      const rngT = mulberry32(86);
      const treeCols: Array<[string, string]> = [
        ["#e0483c", "#7e1414"],
        ["#e3b341", "#8a5f0e"],
        ["#5b8dd9", "#274b7a"],
        ["#fff3d6", "#c9a44e"],
      ];
      for (let i = 0; i < 14; i++) {
        const ty = h * (0.78 + rngT() * 0.185);
        const spread = Math.min((ty - h * 0.695) * 0.36, h * 0.034);
        const tx = w * 0.885 + (rngT() - 0.5) * 2 * Math.max(spread, 2);
        const [c1, c2] = treeCols[Math.floor(rngT() * treeCols.length)];
        bauble(ctx, tx, ty, h * 0.0085, c1, c2);
      }
      sparkle(ctx, w * 0.885, h * 0.685, h * 0.026, "#e3b341", 0.95);
      // snowman — bottom left
      const sx = w * 0.115;
      const sb = h * 0.985;
      const r1 = h * 0.052;
      const r2 = h * 0.037;
      ctx.fillStyle = "rgba(178,205,240,0.55)";
      ctx.beginPath();
      ctx.ellipse(sx, sb, r1 * 1.25, r1 * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      const ball = (cx: number, cy: number, r: number) => {
        const bg2 = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.2, cx, cy, r);
        bg2.addColorStop(0, "#ffffff");
        bg2.addColorStop(0.8, "#f2f7ff");
        bg2.addColorStop(1, "#d7e6fa");
        ctx.fillStyle = bg2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };
      ball(sx, sb - r1, r1);
      ball(sx, sb - r1 * 2 - r2 * 0.82, r2);
      const hy = sb - r1 * 2 - r2 * 0.82;
      // twig arms
      ctx.strokeStyle = "#6b4a2b";
      ctx.lineWidth = Math.max(h * 0.004, 1.2);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx - r1 * 0.8, sb - r1 * 1.15);
      ctx.lineTo(sx - r1 * 1.75, sb - r1 * 1.75);
      ctx.moveTo(sx - r1 * 1.45, sb - r1 * 1.6);
      ctx.lineTo(sx - r1 * 1.8, sb - r1 * 1.95);
      ctx.moveTo(sx + r1 * 0.8, sb - r1 * 1.15);
      ctx.lineTo(sx + r1 * 1.7, sb - r1 * 1.6);
      ctx.stroke();
      // scarf
      ctx.fillStyle = "#c0272d";
      ctx.beginPath();
      ctx.ellipse(sx, hy + r2 * 0.88, r2 * 0.98, r2 * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a31e24";
      ctx.fillRect(sx + r2 * 0.42, hy + r2 * 0.95, r2 * 0.42, r2 * 1.05);
      ctx.fillStyle = "#c0272d";
      ctx.fillRect(sx + r2 * 0.42, hy + r2 * 1.28, r2 * 0.42, r2 * 0.16);
      // face + buttons
      ctx.fillStyle = "#22302a";
      for (const [dx, dy, rr] of [
        [-0.34, -0.15, 0.10],
        [0.34, -0.15, 0.10],
        [0, 0.95, 0.11],
        [0, 1.45, 0.11],
      ] as Array<[number, number, number]>) {
        ctx.beginPath();
        ctx.arc(sx + dx * r2, hy + dy * r2 + (dy > 0.5 ? r2 * 1.5 : 0), rr * r2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#e07b2a";
      ctx.beginPath();
      ctx.moveTo(sx, hy + r2 * 0.05);
      ctx.lineTo(sx + r2 * 0.95, hy + r2 * 0.28);
      ctx.lineTo(sx, hy + r2 * 0.34);
      ctx.closePath();
      ctx.fill();
      // rosy cheeks
      ctx.fillStyle = "rgba(232,96,76,0.35)";
      ctx.beginPath();
      ctx.arc(sx - r2 * 0.58, hy + r2 * 0.3, r2 * 0.2, 0, Math.PI * 2);
      ctx.arc(sx + r2 * 0.58, hy + r2 * 0.3, r2 * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // falling snow — blue-kissed so it reads on the pale sky
      snowFall(ctx, w, h, 90, 42, 0.55, "190,214,246");
      snowFall(ctx, w, h, 40, 43, 0.95, "255,255,255");
    },
  },
  {
    id: "classic-wreath",
    name: "Classic Wreath",
    headlineColor: "#0b3d2e",
    textColor: "#22302a",
    subColor: "#991b1b",
    footerColor: "rgba(34,48,42,0.6)",
    // v1 used 0.56 — with a 3-line message the from-line printed ON TOP of the
    // message. 0.35 (with the slightly smaller wreath) keeps lines 1–4 clear
    // in every case; see REPORT.md for the documented max-length edge case.
    headlineY: 0.35,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = gradient(ctx, w, h, [
        [0, "#fffef9"],
        [1, "#f6ead0"],
      ]);
      ctx.fillRect(0, 0, w, h);
      // faint gold speckle — stationery, not stars
      const rng = mulberry32(51);
      for (let i = 0; i < 46; i++) {
        ctx.fillStyle = `rgba(201,151,63,${0.05 + rng() * 0.09})`;
        ctx.beginPath();
        ctx.arc(rng() * w, rng() * h, 0.8 + rng() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // delicate double gold frame inset
      ctx.strokeStyle = "rgba(179,134,33,0.40)";
      ctx.lineWidth = Math.max(h * 0.0022, 1);
      ctx.strokeRect(w * 0.016, h * 0.024, w * 0.968, h * 0.952);
      ctx.strokeStyle = "rgba(179,134,33,0.20)";
      ctx.strokeRect(w * 0.024, h * 0.036, w * 0.952, h * 0.928);
      wreathV2(ctx, w / 2, h * 0.14, h * 0.098);
      // holly sprigs in the top corners
      const sprig = (x: number, y: number, flip: number) => {
        hollyLeaf(ctx, x, y, h * 0.064, h * 0.029, flip * 0.5, "#14634a", "rgba(6,30,20,0.4)");
        hollyLeaf(ctx, x + flip * w * 0.018, y + h * 0.018, h * 0.054, h * 0.025, flip * 1.15, "#0b3d2e", "rgba(6,30,20,0.4)");
        berryCluster(ctx, x + flip * w * 0.007, y + h * 0.009, h * 0.017);
      };
      sprig(w * 0.055, h * 0.075, 1);
      sprig(w * 0.945, h * 0.075, -1);
      // gold sparkle clusters low in the corners (footer strip stays clear)
      sparkle(ctx, w * 0.055, h * 0.90, h * 0.014, "#c9973f", 0.7);
      sparkle(ctx, w * 0.945, h * 0.90, h * 0.014, "#c9973f", 0.7);
      sparkle(ctx, w * 0.085, h * 0.845, h * 0.009, "#c9973f", 0.5);
      sparkle(ctx, w * 0.915, h * 0.845, h * 0.009, "#c9973f", 0.5);
    },
  },
  {
    id: "candy-stripes",
    name: "Candy Stripes",
    headlineColor: "#f0c75e",
    textColor: "#fff9f0",
    subColor: "#ffe9a8",
    footerColor: "rgba(255,249,240,0.85)",
    headlineY: 0.26,
    drawBackground(ctx, w, h) {
      // centre panel first (frame is painted over the edges)
      const cg = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h * 0.5, w * 0.62);
      cg.addColorStop(0, "#125239");
      cg.addColorStop(0.55, "#0b3d2e");
      cg.addColorStop(1, "#06231a");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, w, h);
      // candy-stripe frame with gold pinstripes on the colour boundaries
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
      const stripe = Math.round(h * 0.07);
      const lean = h * 0.35;
      for (let x = -h; x < w + h; x += stripe * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripe, 0);
        ctx.lineTo(x + stripe - lean, h);
        ctx.lineTo(x - lean, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(201,151,63,0.65)";
      ctx.lineWidth = Math.max(h * 0.0022, 1);
      for (let x = -h; x < w + h; x += stripe) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - lean, h);
        ctx.stroke();
      }
      ctx.restore();
      // candy swirl medallions on the four frame corners
      const medallion = (cx: number, cy: number) => {
        const r = frame * 0.47;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#fff7ed";
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.fillStyle = "#c0272d";
        for (let i = 0; i < 6; i++) {
          const a0 = (i / 6) * Math.PI * 2 + 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, a0, a0 + Math.PI / 6);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = "#c9973f";
        ctx.lineWidth = Math.max(h * 0.003, 1.2);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#c0272d";
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      };
      medallion(frame / 2, frame / 2);
      medallion(w - frame / 2, frame / 2);
      medallion(frame / 2, h - frame / 2);
      medallion(w - frame / 2, h - frame / 2);
      // double gold inner border
      ctx.strokeStyle = "#e3b341";
      ctx.lineWidth = Math.max(h * 0.004, 1.6);
      ctx.strokeRect(frame + h * 0.008, frame + h * 0.008, w - frame * 2 - h * 0.016, h - frame * 2 - h * 0.016);
      ctx.strokeStyle = "rgba(227,179,65,0.45)";
      ctx.lineWidth = Math.max(h * 0.002, 1);
      ctx.strokeRect(frame + h * 0.02, frame + h * 0.02, w - frame * 2 - h * 0.04, h - frame * 2 - h * 0.04);
      // two baubles hanging into the panel, clear of the headline band
      bauble(ctx, w * 0.295, frame + h * 0.052, h * 0.021, "#e0483c", "#7e1414", frame + 2);
      bauble(ctx, w * 0.705, frame + h * 0.052, h * 0.021, "#e3b341", "#7a5210", frame + 2);
      headlineGlow(ctx, w, h, 0.26);
      // gold confetti + sparkles in the panel (v1's olive blobs read as smudges)
      const rng = mulberry32(61);
      for (let i = 0; i < 34; i++) {
        const x = frame + rng() * (w - frame * 2);
        const y = frame + rng() * (h - frame * 2);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI);
        ctx.fillStyle = `rgba(240,199,94,${0.14 + rng() * 0.2})`;
        ctx.fillRect(-h * 0.006, -h * 0.0022, h * 0.012, h * 0.0044);
        ctx.restore();
      }
      for (let i = 0; i < 6; i++) {
        sparkle(ctx, frame + rng() * (w - frame * 2), frame + rng() * (h - frame * 2), (4 + rng() * 6) * (h / 800), "#ffe9a8", 0.4 + rng() * 0.3);
      }
      snowFall(ctx, w, h, 55, 62, 0.55);
      // footer nameplate — v1 printed the footer across the moving stripes,
      // which made it unreadable; the plate straddles the border like stationery
      const pw = w * 0.54;
      const ph = h * 0.082;
      const px = (w - pw) / 2;
      const py = h - frame - ph * 0.28;
      ctx.fillStyle = "rgba(6,35,26,0.96)";
      rrect(ctx, px, py, pw, ph, ph * 0.3);
      ctx.fill();
      ctx.strokeStyle = "rgba(227,179,65,0.8)";
      ctx.lineWidth = Math.max(h * 0.0022, 1);
      rrect(ctx, px, py, pw, ph, ph * 0.3);
      ctx.stroke();
      sparkle(ctx, px + ph * 0.42, py + ph / 2, ph * 0.17, "#e3b341", 0.9);
      sparkle(ctx, px + pw - ph * 0.42, py + ph / 2, ph * 0.17, "#e3b341", 0.9);
    },
  },
];

/** Layered wreath: needle ring, holly rings, baubles, berries, cones, bow. */
function wreathV2(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const rng = mulberry32(99);
  // gold guide rings
  ctx.strokeStyle = "rgba(179,134,33,0.35)";
  ctx.lineWidth = Math.max(r * 0.016, 0.9);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(179,134,33,0.22)";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  // back ring — pine needle clusters radiating out
  ctx.strokeStyle = "#0a3524";
  ctx.lineCap = "round";
  const needles = 130;
  for (let i = 0; i < needles; i++) {
    const a = (i / needles) * Math.PI * 2 + rng() * 0.05;
    const r0 = r * 0.78;
    const r1 = r * (1.04 + rng() * 0.1);
    ctx.lineWidth = Math.max(r * 0.02, 0.9);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a + (rng() - 0.5) * 0.16) * r1, cy + Math.sin(a + (rng() - 0.5) * 0.16) * r1);
    ctx.stroke();
  }
  // holly leaf rings — two greens, tangential with jitter
  const ring = (ringR: number, count: number, len: number, phase: number) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + phase;
      const x = cx + Math.cos(a) * ringR;
      const y = cy + Math.sin(a) * ringR;
      hollyLeaf(
        ctx,
        x,
        y,
        len,
        len * 0.46,
        a + Math.PI / 2 + (rng() - 0.5) * 0.45,
        i % 3 === 0 ? "#14634a" : "#0b3d2e",
        "rgba(4,24,16,0.5)",
      );
    }
  };
  ring(r * 0.94, 34, r * 0.34, 0);
  ring(r * 0.74, 28, r * 0.28, 0.11);
  // gold bead dots along the inner ring
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + 0.14;
    ctx.fillStyle = "rgba(201,151,63,0.85)";
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, r * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
  // berries, baubles, pinecones placed around the ring
  const place = (deg: number, fn: () => void) => {
    const a = (deg * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86);
    fn();
    ctx.restore();
  };
  place(18, () => berryCluster(ctx, 0, 0, r * 0.085));
  place(96, () => berryCluster(ctx, 0, 0, r * 0.08));
  place(168, () => berryCluster(ctx, 0, 0, r * 0.085));
  place(252, () => berryCluster(ctx, 0, 0, r * 0.075));
  place(322, () => berryCluster(ctx, 0, 0, r * 0.08));
  place(58, () => bauble(ctx, 0, 0, r * 0.075, "#e3b341", "#7a5210"));
  place(132, () => bauble(ctx, 0, 0, r * 0.068, "#e0483c", "#7e1414"));
  place(208, () => bauble(ctx, 0, 0, r * 0.072, "#e3b341", "#7a5210"));
  place(288, () => bauble(ctx, 0, 0, r * 0.066, "#e0483c", "#7e1414"));
  const pinecone = (rot: number) => {
    ctx.save();
    ctx.rotate(rot);
    for (let rowI = 0; rowI < 4; rowI++) {
      const n = 3 + (rowI % 2);
      for (let k = 0; k < n; k++) {
        const px2 = (k - (n - 1) / 2) * r * 0.075;
        const py2 = rowI * r * 0.062;
        ctx.fillStyle = rowI % 2 ? "#6b4423" : "#7d5230";
        ctx.beginPath();
        ctx.ellipse(px2, py2, r * 0.052, r * 0.036, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(46,28,12,0.55)";
        ctx.beginPath();
        ctx.ellipse(px2, py2 + r * 0.014, r * 0.04, r * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };
  place(226, () => pinecone(0.5));
  place(344, () => pinecone(-0.4));
  // ribbon bow at the bottom of the ring
  ribbonBow(ctx, cx, cy + r * 1.02, r * 0.62);
  sparkle(ctx, cx + r * 0.3, cy - r * 0.72, r * 0.09, "#c9973f", 0.8);
  sparkle(ctx, cx - r * 0.62, cy + r * 0.28, r * 0.07, "#c9973f", 0.65);
}

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
