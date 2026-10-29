"use client";

import { useEffect, useRef } from "react";

/** Gentle canvas snowfall, absolutely positioned inside its parent. */
export default function Snowfall({ density = 90 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const flakes = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2.6,
      s: 0.08 + Math.random() * 0.27,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.0007 + Math.random() * 0.0033,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w));
      canvas.height = Math.max(1, Math.floor(h));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const f of flakes) {
        f.y += f.s / Math.max(1, h / 220);
        f.drift += f.driftSpeed;
        if (f.y > 1.02) {
          f.y = -0.02;
          f.x = Math.random();
        }
        const x = f.x * w + Math.sin(f.drift) * 14;
        const y = f.y * h;
        ctx.beginPath();
        ctx.arc(x, y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className="snowfall" aria-hidden="true" />;
}
